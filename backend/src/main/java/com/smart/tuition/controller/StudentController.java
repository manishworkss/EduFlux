package com.smart.tuition.controller;

import com.smart.tuition.entity.Student;
import com.smart.tuition.entity.User;
import com.smart.tuition.entity.enums.Role;
import com.smart.tuition.repository.StudentRepository;

import com.smart.tuition.service.StudentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/students")
@RequiredArgsConstructor
public class StudentController {

    private final StudentRepository studentRepository;
    private final StudentService studentService;

    @GetMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<List<Student>> getAllStudents(org.springframework.security.core.Authentication authentication) {
        com.smart.tuition.security.CustomUserDetails userDetails = (com.smart.tuition.security.CustomUserDetails) authentication.getPrincipal();
        return ResponseEntity.ok(studentRepository.findByAdmin_UserId(userDetails.getUserId()));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<java.util.Map<String, Object>> registerStudent(@RequestBody Student studentDetails, org.springframework.security.core.Authentication authentication) {
        com.smart.tuition.security.CustomUserDetails userDetails = (com.smart.tuition.security.CustomUserDetails) authentication.getPrincipal();
        return ResponseEntity.ok(studentService.registerStudent(studentDetails, userDetails.getUserId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Student> getStudentProfile(@PathVariable Long id) {
        // Can add logic to ensure student only views own profile
        return ResponseEntity.ok(studentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found")));
    }
}
