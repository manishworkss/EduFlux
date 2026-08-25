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
        private String email;
    }

    @PostMapping("/students")
    public ResponseEntity<?> createStudent(@RequestBody CreateStudentRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email is already in use");
        }

        String tempPassword = "Edf@" + (1000 + new Random().nextInt(9000));

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(tempPassword));
        user.setRole(Role.ROLE_STUDENT);
        user.setMustChangePassword(true);
        
        user = userRepository.save(user);

        Student student = new Student();
        student.setUser(user);
        student.setEnrollmentNumber("STU" + System.currentTimeMillis());
        studentRepository.save(student);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Student created successfully");
        response.put("temporaryPassword", tempPassword);
        response.put("student", student);

        return ResponseEntity.ok(response);
    }
}
