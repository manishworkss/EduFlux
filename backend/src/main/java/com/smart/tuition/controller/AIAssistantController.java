package com.smart.tuition.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.smart.tuition.entity.Student;
import com.smart.tuition.entity.User;
import com.smart.tuition.repository.CourseRepository;
import com.smart.tuition.repository.StudentRepository;
import com.smart.tuition.repository.UserRepository;
import com.smart.tuition.security.CustomUserDetails;
import com.smart.tuition.service.GeminiAIService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/ai")
@RequiredArgsConstructor
@Slf4j
public class AIAssistantController {

    private final StudentRepository studentRepository;
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final GeminiAIService geminiAIService;
    private final ObjectMapper objectMapper;
    private final com.smart.tuition.service.StudentService studentService;
    private final com.smart.tuition.service.AnalyticsService analyticsService;

    @Data
    public static class AIQueryRequest {
        private String query;
    }

    @Data
    public static class AIQueryResponse {
        private String response;
        private String action;
        private Object payload;
    }

    @Data
    public static class PreviewStudentDto {
        private String name;
        private String email;
        private String mobileNo;
        private String dob;
        private String courseName;
        private Integer semester;
        private String academicYear;
        private String admissionDate;
        private String address;
        private String city;
        private String state;
        private String pincode;
        private String guardianName;
        private String guardianMobile;
        private String guardianRelationship;
        private boolean isValid;
        private boolean isDuplicate;
        private List<String> missingFields;
    }

    @PostMapping("/upload-student-data")
    public ResponseEntity<AIQueryResponse> uploadStudentData(@RequestParam("file") MultipartFile file, @AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails == null || !"ROLE_ADMIN".equals(userDetails.getRole())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only admins can perform this action");
        }

        AIQueryResponse response = new AIQueryResponse();
        response.setAction("NONE");

        try {
            log.info("Processing uploaded file: {}", file.getOriginalFilename());
            String jsonString = geminiAIService.extractStudentData(file);
            log.info("Extracted JSON from document: {}", jsonString);

            JsonNode data = objectMapper.readTree(jsonString);

            List<JsonNode> studentsData = new ArrayList<>();
            if (data.isArray()) {
                data.forEach(studentsData::add);
            } else {
                studentsData.add(data);
            }

            List<PreviewStudentDto> previewList = new ArrayList<>();

            for (JsonNode node : studentsData) {
                PreviewStudentDto dto = new PreviewStudentDto();
                dto.setName(node.path("name").asText(null));
                dto.setEmail(node.path("email").asText(null));
                dto.setMobileNo(node.path("mobileNo").asText(null));
                dto.setDob(node.path("dob").asText(null));
                dto.setCourseName(node.path("courseName").asText(null));
                dto.setSemester(node.path("semester").asInt(1));
                dto.setAcademicYear(node.path("academicYear").asText(null));
                dto.setAdmissionDate(node.path("admissionDate").asText(null));
                dto.setAddress(node.path("address").asText(null));
                dto.setCity(node.path("city").asText(null));
                dto.setState(node.path("state").asText(null));
                dto.setPincode(node.path("pincode").asText(null));
                dto.setGuardianName(node.path("guardianName").asText(null));
                dto.setGuardianMobile(node.path("guardianMobile").asText(null));
                dto.setGuardianRelationship(node.path("guardianRelationship").asText(null));

                // Clean up string "null" from AI
                if ("null".equalsIgnoreCase(dto.getEmail())) dto.setEmail(null);
                if ("null".equalsIgnoreCase(dto.getName())) dto.setName(null);

                List<String> missing = new ArrayList<>();
                if (dto.getName() == null || dto.getName().isBlank()) missing.add("Name");
                if (dto.getEmail() == null || dto.getEmail().isBlank()) missing.add("Email");
                if (dto.getMobileNo() == null || dto.getMobileNo().isBlank()) missing.add("Mobile Number");
                if (dto.getDob() == null || dto.getDob().isBlank()) missing.add("DOB");
                
                dto.setMissingFields(missing);
                
                if (dto.getEmail() != null && !dto.getEmail().isBlank()) {
                    dto.setDuplicate(userRepository.existsByEmail(dto.getEmail()));
                } else {
                    dto.setDuplicate(false);
                }

                dto.setValid(missing.isEmpty() && !dto.isDuplicate());
                previewList.add(dto);
            }

            if (previewList.size() == 1) {
                response.setResponse("I've extracted the student details. Please review them below and confirm registration.");
            } else {
                response.setResponse("I've processed the batch list. Please review the valid and invalid records before confirming.");
            }
            
            response.setAction("PREVIEW_REGISTRATION");
            response.setPayload(previewList);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Failed to process document", e);
            response.setResponse("I encountered an error processing the document: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PostMapping("/confirm-registration")
    public ResponseEntity<AIQueryResponse> confirmRegistration(@RequestBody List<PreviewStudentDto> confirmedStudents, @AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails == null || !"ROLE_ADMIN".equals(userDetails.getRole())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only admins can perform this action");
        }

        AIQueryResponse response = new AIQueryResponse();
        List<Map<String, Object>> createdStudents = new ArrayList<>();

        Long adminId = userDetails.getUserId();

        for (PreviewStudentDto dto : confirmedStudents) {
            if (!dto.isValid() || dto.isDuplicate()) continue;

            try {
                User user = new User();
                user.setName(dto.getName());
                user.setEmail(dto.getEmail());
                
                Student student = new Student();
                student.setUser(user);
                
                if (dto.getCourseName() != null && !dto.getCourseName().isEmpty()) {
                    courseRepository.findByCourseNameAndAdmin_UserId(dto.getCourseName(), adminId)
                            .ifPresent(student::setCourse);
                }
                
                student.setAcademicYear(dto.getAcademicYear() != null ? dto.getAcademicYear() : "2026-27");
                student.setSemester(dto.getSemester() != null ? dto.getSemester() : 1);
                student.setPhone(dto.getMobileNo());
                student.setAddress(dto.getAddress());
                student.setCity(dto.getCity() != null ? dto.getCity() : "Unknown City");
                student.setGuardianName(dto.getGuardianName());
                student.setGuardianPhone(dto.getGuardianMobile());
                student.setGuardianRelationship(dto.getGuardianRelationship() != null ? dto.getGuardianRelationship() : "Parent");
                student.setPincode(dto.getPincode());
                student.setState(dto.getState());

                if (dto.getAdmissionDate() != null && !dto.getAdmissionDate().isBlank() && !dto.getAdmissionDate().equalsIgnoreCase("null")) {
                    try {
                        student.setAdmissionDate(LocalDate.parse(dto.getAdmissionDate()));
                    } catch (Exception e) {
                        student.setAdmissionDate(LocalDate.now());
                    }
                } else {
                    student.setAdmissionDate(LocalDate.now());
                }

                if (dto.getDob() != null && !dto.getDob().isBlank() && !dto.getDob().equalsIgnoreCase("null")) {
                    try {
                        student.setDob(LocalDate.parse(dto.getDob()));
                    } catch (Exception e) {
                        student.setDob(null);
                    }
                }

                Map<String, Object> result = studentService.registerStudent(student, adminId);
                createdStudents.add(result);
            } catch (Exception e) {
                log.error("Error creating student: " + dto.getEmail(), e);
            }
        }

        if (createdStudents.isEmpty()) {
            response.setResponse("No valid students were registered.");
            response.setAction("NONE");
        } else if (createdStudents.size() == 1) {
            Student s = (Student) createdStudents.get(0).get("student");
            String pwd = (String) createdStudents.get(0).get("temporaryPassword");
            response.setResponse("Student Registered Successfully!\n\nName: " + s.getUser().getName() + "\nStudent ID: " + s.getEnrollmentNumber() + "\nEmail: " + s.getUser().getEmail() + "\nTemporary Password: " + pwd);
            response.setAction("CREATE_STUDENTS");
            response.setPayload(createdStudents);
        } else {
            response.setResponse("Successfully registered " + createdStudents.size() + " students.");
            response.setAction("CREATE_STUDENTS");
            response.setPayload(createdStudents);
        }

        return ResponseEntity.ok(response);
    }

    @PostMapping("/ask")
    public ResponseEntity<AIQueryResponse> askAssistant(@RequestBody AIQueryRequest request, @AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not authenticated");
        }

        String role = userDetails.getRole();
        String query = request.getQuery().toLowerCase();
        AIQueryResponse response = new AIQueryResponse();
        response.setAction("NONE");

        if ("ROLE_ADMIN".equals(role)) {
            Long adminId = userDetails.getUserId();
            com.smart.tuition.dto.AnalyticsDashboardDto stats = analyticsService.getDashboardData(adminId);
            if (query.contains("register") || query.contains("create student") || query.contains("create account") || query.contains("admission") || query.contains("extract")) {
                response.setResponse("I can help with that! Please click the attachment (📎) icon to upload the student's admission form (PDF, Image, or CSV), and I will extract the details for you to review before registration.");
                response.setAction("NONE");
            } else if (query.contains("overdue") || query.contains("pending")) {
                response.setResponse(String.format("Currently, there are **%d** active students. The total pending fee amount is **$%s** and the overdue amount is **$%s**. Please check the dashboard for a detailed breakdown.", 
                        stats.getActiveStudents(), stats.getTotalPendingFees(), stats.getTotalOverdueFees()));
            } else if (query.contains("collected") || query.contains("collection")) {
                response.setResponse(String.format("The total fee collected so far is **$%s**. You have **%d** successful payments.", 
                        stats.getTotalFeeCollection(), stats.getSuccessfulPayments()));
            } else {
                response.setResponse("Hi Admin! I am the EduFlux AI Assistant. I can help you manage students, create accounts from documents/CSVs, and analyze fees.");
            }
        } else {
            Student student = studentRepository.findByUser_UserId(userDetails.getUserId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Student not found"));

            if (query.contains("how much") || query.contains("pending")) {
                response.setResponse("You have fees pending. Please check your 'My Fees' tab for a detailed breakdown.");
            } else if (query.contains("next payment") || query.contains("due")) {
                response.setResponse("Your next payment is due soon. Check the 'Dashboard' for upcoming due dates.");
            } else if (query.contains("overdue")) {
                response.setResponse("Overdue fees incur a late penalty. Make sure to pay them via the 'My Fees' section.");
            } else {
                response.setResponse("Hi " + student.getUser().getName().split(" ")[0] + "! I am the EduFlux AI Fee Assistant. I can help you with questions about your pending fees, due dates, and payment history.");
            }
        }

        return ResponseEntity.ok(response);
    }
}
