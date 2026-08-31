package com.smart.tuition.controller;

import com.smart.tuition.entity.Payment;
import com.smart.tuition.entity.Student;
import com.smart.tuition.entity.Course;
import com.smart.tuition.entity.StudentFee;
import com.smart.tuition.entity.User;
import com.smart.tuition.entity.enums.FeeStatus;
import com.smart.tuition.entity.enums.Role;
import com.smart.tuition.repository.PaymentRepository;
import com.smart.tuition.repository.CourseRepository;
import com.smart.tuition.repository.StudentFeeRepository;
import com.smart.tuition.repository.StudentRepository;
import com.smart.tuition.repository.UserRepository;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/admin/dashboard")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
public class AdminDashboardController {

    private final StudentRepository studentRepository;
    private final StudentFeeRepository studentFeeRepository;
    private final UserRepository userRepository;
    private final PaymentRepository paymentRepository;
    private final CourseRepository courseRepository;
    private final PasswordEncoder passwordEncoder;
    private final com.smart.tuition.service.StudentService studentService;

    @Data
    public static class RecentPaymentDto {
        private Long id;
        private String studentName;
        private String feeType;
        private Double amount;
        private String date;
        private String status;
    }

    @Data
    public static class MonthlyCollectionDto {
        private String name;
        private Double total;
    }

    @Data
    public static class FeeStatusDto {
        private String name;
        private int value;
        private String fill;
    }

    @GetMapping("/metrics")
    public ResponseEntity<Map<String, Object>> getMetrics(org.springframework.security.core.Authentication authentication) {
        com.smart.tuition.security.CustomUserDetails userDetails = (com.smart.tuition.security.CustomUserDetails) authentication.getPrincipal();
        Long adminId = userDetails.getUserId();
        
        Map<String, Object> metrics = new HashMap<>();
        
        // 1. KPI Metrics
        List<Student> allStudents = studentRepository.findByAdmin_UserId(adminId);
        long totalStudents = allStudents.size();
        // Assuming active students are those created in the last 12 months for simplicity, or just use total if no "status" field exists
        long activeStudents = totalStudents; 
        
        List<StudentFee> allFees = studentFeeRepository.findByStudent_Admin_UserId(adminId);
        
        double totalCollections = allFees.stream()
                .mapToDouble(StudentFee::getPaidAmount)
                .sum();
                
        List<StudentFee> pendingFees = allFees.stream()
                .filter(fee -> fee.getStatus() == FeeStatus.PENDING || fee.getStatus() == FeeStatus.PARTIAL)
                .collect(Collectors.toList());
                
        double totalPending = pendingFees.stream()
                .mapToDouble(fee -> fee.getAmount() - fee.getPaidAmount())
                .sum();
        long pendingStudentsCount = pendingFees.stream().map(f -> f.getStudent().getStudentId()).distinct().count();

        List<StudentFee> overdueFees = allFees.stream()
                .filter(fee -> fee.getStatus() == FeeStatus.OVERDUE)
                .collect(Collectors.toList());
                
        double totalOverdue = overdueFees.stream()
                .mapToDouble(fee -> fee.getAmount() - fee.getPaidAmount())
                .sum();
        long overdueStudentsCount = overdueFees.stream().map(f -> f.getStudent().getStudentId()).distinct().count();
                
        metrics.put("totalStudents", totalStudents);
        metrics.put("activeStudents", activeStudents);
        metrics.put("totalCollections", totalCollections);
        metrics.put("totalPending", totalPending);
        metrics.put("pendingStudentsCount", pendingStudentsCount);
        metrics.put("totalOverdue", totalOverdue);
        metrics.put("overdueStudentsCount", overdueStudentsCount);

        // 2. Fee Status Distribution
        int paidCount = (int) allFees.stream().filter(f -> f.getStatus() == FeeStatus.PAID).count();
        int pendingCount = pendingFees.size();
        int overdueCount = overdueFees.size();
        
        List<FeeStatusDto> feeStatusData = new ArrayList<>();
        feeStatusData.add(createFeeStatusDto("Paid", paidCount, "#10b981"));
        feeStatusData.add(createFeeStatusDto("Pending", pendingCount, "#f59e0b"));
        feeStatusData.add(createFeeStatusDto("Overdue", overdueCount, "#ef4444"));
        metrics.put("feeStatusDistribution", feeStatusData);

        // 3. Recent Payments (Latest 5)
        List<Payment> allPayments = paymentRepository.findByStudent_Admin_UserId(adminId);
        allPayments.sort((p1, p2) -> p2.getCreatedAt().compareTo(p1.getCreatedAt())); // Descending
        
        List<RecentPaymentDto> recentPayments = allPayments.stream()
                .limit(5)
                .map(p -> {
                    RecentPaymentDto dto = new RecentPaymentDto();
                    dto.setId(p.getPaymentId());
                    dto.setStudentName(p.getStudent().getUser().getName());
                    
                    String feeType = "Monthly Fee";
                    if (p.getStudentFee() != null && p.getStudentFee().getFeeStructure() != null && p.getStudentFee().getFeeStructure().getFeeType() != null) {
                        feeType = p.getStudentFee().getFeeStructure().getFeeType();
                    }
                    dto.setFeeType(feeType);
                    
                    dto.setAmount(p.getAmount());
                    dto.setDate(p.getPaymentDate().format(DateTimeFormatter.ofPattern("dd MMM yyyy")));
                    dto.setStatus(p.getStatus().name());
                    return dto;
                })
                .collect(Collectors.toList());
        metrics.put("recentPayments", recentPayments);

        // 4. Monthly Collection Trend (Last 6 Months)
        List<MonthlyCollectionDto> monthlyTrend = generateMonthlyTrend(allPayments);
        metrics.put("monthlyCollectionTrend", monthlyTrend);
        
        return ResponseEntity.ok(metrics);
    }

    private FeeStatusDto createFeeStatusDto(String name, int value, String fill) {
        FeeStatusDto dto = new FeeStatusDto();
        dto.setName(name);
        dto.setValue(value);
        dto.setFill(fill);
        return dto;
    }

    private List<MonthlyCollectionDto> generateMonthlyTrend(List<Payment> allPayments) {
        List<MonthlyCollectionDto> trend = new ArrayList<>();
        LocalDate now = LocalDate.now();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM");

        for (int i = 5; i >= 0; i--) {
            LocalDate monthDate = now.minusMonths(i);
            String monthName = monthDate.format(formatter);
            
            double totalForMonth = allPayments.stream()
                    .filter(p -> p.getStatus().name().equals("SUCCESS") || p.getStatus().name().equals("COMPLETED"))
                    .filter(p -> p.getPaymentDate().getMonth() == monthDate.getMonth() && p.getPaymentDate().getYear() == monthDate.getYear())
                    .mapToDouble(Payment::getAmount)
                    .sum();
                    
            MonthlyCollectionDto dto = new MonthlyCollectionDto();
            dto.setName(monthName);
            dto.setTotal(totalForMonth);
            trend.add(dto);
        }
        return trend;
    }

    @Data
    public static class CreateStudentRequest {
        private String name;
        private String phone;
        private String email; 
        private LocalDate dob;
        private String guardianName;
        private String guardianPhone;
        private String guardianRelationship;
        private String address;
        private String city;
        private String pincode;
        private String state;
        private String courseName;
        private Integer semester;
        private String academicYear;
        private String enrollmentNumber;
        private LocalDate admissionDate;
    }

    @PostMapping("/students")
    public ResponseEntity<?> createStudent(@RequestBody CreateStudentRequest request, org.springframework.security.core.Authentication authentication) {
        try {
            com.smart.tuition.security.CustomUserDetails userDetails = (com.smart.tuition.security.CustomUserDetails) authentication.getPrincipal();
            Long adminId = userDetails.getUserId();
            if (request.getName() == null || request.getName().isEmpty() ||
                request.getEmail() == null || request.getEmail().isEmpty() ||
                request.getPhone() == null || request.getPhone().isEmpty() ||
                request.getCourseName() == null || request.getCourseName().isEmpty() ||
                request.getSemester() == null ||
                request.getAcademicYear() == null || request.getAcademicYear().isEmpty() ||
                request.getAddress() == null || request.getAddress().isEmpty() ||
                request.getCity() == null || request.getCity().isEmpty() ||
                request.getState() == null || request.getState().isEmpty() ||
                request.getPincode() == null || request.getPincode().isEmpty() ||
                request.getGuardianName() == null || request.getGuardianName().isEmpty() ||
                request.getGuardianPhone() == null || request.getGuardianPhone().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Missing required fields."));
            }

            if (request.getEmail() != null && !request.getEmail().isEmpty()) {
                if (userRepository.existsByEmail(request.getEmail())) {
                    return ResponseEntity.badRequest().body(Map.of("message", "Student account with this email already exists."));
                }
            }

            User user = new User();
            user.setName(request.getName());
            user.setEmail(request.getEmail() != null && !request.getEmail().isEmpty() ? request.getEmail() : request.getEnrollmentNumber()); 

            Student student = new Student();
            student.setUser(user);
            student.setEnrollmentNumber(request.getEnrollmentNumber());
            student.setPersonalEmail(request.getEmail());
            student.setPhone(request.getPhone());
            student.setDob(request.getDob());
            student.setGuardianName(request.getGuardianName());
            student.setGuardianPhone(request.getGuardianPhone());
            student.setGuardianRelationship(request.getGuardianRelationship());
            student.setAddress(request.getAddress());
            student.setCity(request.getCity());
            student.setPincode(request.getPincode());
            student.setState(request.getState());
            
            if (request.getCourseName() != null && !request.getCourseName().isEmpty()) {
                courseRepository.findByCourseNameAndAdmin_UserId(request.getCourseName(), adminId)
                        .ifPresent(student::setCourse);
            }
            
            student.setSemester(request.getSemester());
            student.setAcademicYear(request.getAcademicYear());
            student.setAdmissionDate(request.getAdmissionDate() != null ? request.getAdmissionDate() : LocalDate.now());

            return ResponseEntity.ok(studentService.registerStudent(student, adminId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
    @PutMapping("/students/{studentId}")
    public ResponseEntity<?> updateStudent(@PathVariable Long studentId, @RequestBody CreateStudentRequest request, org.springframework.security.core.Authentication authentication) {
        try {
            com.smart.tuition.security.CustomUserDetails userDetails = (com.smart.tuition.security.CustomUserDetails) authentication.getPrincipal();
            Long adminId = userDetails.getUserId();
            
            Student student = studentRepository.findByStudentIdAndAdmin_UserId(studentId, adminId)
                    .orElseThrow(() -> new RuntimeException("Student not found"));
            
            User user = student.getUser();
            if (request.getName() != null) user.setName(request.getName());
            if (request.getEmail() != null && !request.getEmail().isEmpty()) user.setEmail(request.getEmail());
            // Save user implicitly when saving student if CascadeType.MERGE/ALL is used, but student.setUser is already set.

            if (request.getEnrollmentNumber() != null) student.setEnrollmentNumber(request.getEnrollmentNumber());
            if (request.getEmail() != null) student.setPersonalEmail(request.getEmail());
            if (request.getPhone() != null) student.setPhone(request.getPhone());
            if (request.getDob() != null) student.setDob(request.getDob());
            if (request.getGuardianName() != null) student.setGuardianName(request.getGuardianName());
            if (request.getGuardianPhone() != null) student.setGuardianPhone(request.getGuardianPhone());
            if (request.getGuardianRelationship() != null) student.setGuardianRelationship(request.getGuardianRelationship());
            if (request.getAddress() != null) student.setAddress(request.getAddress());
            if (request.getCity() != null) student.setCity(request.getCity());
            if (request.getPincode() != null) student.setPincode(request.getPincode());
            if (request.getState() != null) student.setState(request.getState());
            
            if (request.getCourseName() != null && !request.getCourseName().isEmpty()) {
                courseRepository.findByCourseNameAndAdmin_UserId(request.getCourseName(), adminId)
                        .ifPresent(student::setCourse);
            }
            
            if (request.getSemester() != null) student.setSemester(request.getSemester());
            if (request.getAcademicYear() != null) student.setAcademicYear(request.getAcademicYear());
            if (request.getAdmissionDate() != null) student.setAdmissionDate(request.getAdmissionDate());

            studentRepository.save(student);
            return ResponseEntity.ok(Map.of("message", "Student updated successfully", "student", student));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
