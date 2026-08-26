package com.smart.tuition.controller;

import com.smart.tuition.entity.Student;
import com.smart.tuition.entity.User;
import com.smart.tuition.entity.enums.FeeStatus;
import com.smart.tuition.entity.enums.Role;
import com.smart.tuition.repository.StudentRepository;
import com.smart.tuition.repository.StudentFeeRepository;
import com.smart.tuition.repository.UserRepository;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.Map;
import java.util.Random;

@RestController
@RequestMapping("/api/v1/admin/dashboard")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
public class AdminDashboardController {

    private final StudentRepository studentRepository;
    private final StudentFeeRepository studentFeeRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @GetMapping("/metrics")
    public ResponseEntity<Map<String, Object>> getMetrics() {
        Map<String, Object> metrics = new HashMap<>();
        
        long totalStudents = studentRepository.count();
        
        double totalCollections = studentFeeRepository.findAll().stream()
                .mapToDouble(fee -> fee.getPaidAmount())
                .sum();
                
        double totalPending = studentFeeRepository.findAll().stream()
                .filter(fee -> fee.getStatus() == FeeStatus.PENDING || fee.getStatus() == FeeStatus.OVERDUE)
                .mapToDouble(fee -> fee.getAmount() - fee.getPaidAmount())
                .sum();
                
        metrics.put("totalStudents", totalStudents);
        metrics.put("totalCollections", totalCollections);
        metrics.put("totalPending", totalPending);
        
        return ResponseEntity.ok(metrics);
    }

    @Data
    public static class CreateStudentRequest {
        private String name;
        private String phone;
        private String email; // optional personal email
        private String parentName;
        private String parentPhone;
        private String address;
        private String pincode;
        private String state;
        private String courseName;
        private java.math.BigDecimal monthlyFee;
    }

    @PostMapping("/students")
    public ResponseEntity<?> createStudent(@RequestBody CreateStudentRequest request) {
        String namePart = request.getName() != null && request.getName().length() >= 4 
                ? request.getName().substring(0, 4) 
                : request.getName();
        String phonePart = request.getPhone() != null && request.getPhone().length() >= 4 
                ? request.getPhone().substring(0, 4) 
                : request.getPhone();
        
        // Capitalize first letter of name just in case
        if (namePart != null && !namePart.isEmpty()) {
            namePart = namePart.substring(0, 1).toUpperCase() + namePart.substring(1);
        }
        
        String tempPassword = namePart + "@" + phonePart;

        // Use enrollment number as login ID (email field in User)
        String enrollmentNumber;
        Random random = new Random();
        do {
            enrollmentNumber = "2601010" + String.format("%04d", random.nextInt(10000));
        } while (userRepository.existsByEmail(enrollmentNumber));

        User user = new User();
        user.setName(request.getName());
        user.setEmail(enrollmentNumber); // Set email to Enrollment ID so they login with it
        user.setPassword(passwordEncoder.encode(tempPassword));
        user.setRole(Role.ROLE_STUDENT);
        user.setMustChangePassword(true);
        
        user = userRepository.save(user);

        Student student = new Student();
        student.setUser(user);
        student.setEnrollmentNumber(enrollmentNumber);
        student.setPersonalEmail(request.getEmail());
        student.setPhone(request.getPhone());
        student.setParentName(request.getParentName());
        student.setParentPhone(request.getParentPhone());
        student.setAddress(request.getAddress());
        student.setPincode(request.getPincode());
        student.setState(request.getState());
        student.setCourseName(request.getCourseName());
        student.setMonthlyFee(request.getMonthlyFee());
        studentRepository.save(student);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Student created successfully");
        response.put("temporaryPassword", tempPassword);
        response.put("student", student);

        return ResponseEntity.ok(response);
    }
}
