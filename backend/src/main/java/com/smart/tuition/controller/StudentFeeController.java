package com.smart.tuition.controller;

import com.smart.tuition.entity.StudentFee;
import com.smart.tuition.entity.enums.FeeStatus;
import com.smart.tuition.repository.StudentFeeRepository;
import com.smart.tuition.repository.StudentRepository;
import com.smart.tuition.repository.FeeStructureRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import com.smart.tuition.security.CustomUserDetails;

import java.util.List;

@RestController
@RequestMapping("/api/v1/student-fees")
@RequiredArgsConstructor
public class StudentFeeController {

    private final StudentFeeRepository studentFeeRepository;
    private final StudentRepository studentRepository;
    private final FeeStructureRepository feeStructureRepository;

    @GetMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<List<StudentFee>> getAllStudentFees(org.springframework.security.core.Authentication authentication) {
        com.smart.tuition.security.CustomUserDetails userDetails = (com.smart.tuition.security.CustomUserDetails) authentication.getPrincipal();
        return ResponseEntity.ok(studentFeeRepository.findByStudent_Admin_UserId(userDetails.getUserId()));
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<StudentFee>> getFeesForStudent(@PathVariable Long studentId, @AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not authenticated");
        }
        var student = studentRepository.findById(studentId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        if ("ROLE_ADMIN".equals(userDetails.getRole())) {
            if (student.getAdmin() == null || !student.getAdmin().getUserId().equals(userDetails.getUserId())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied. Student belongs to another admin.");
            }
        } else if (!student.getUser().getUserId().equals(userDetails.getUserId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }
        return ResponseEntity.ok(studentFeeRepository.findByStudent_StudentId(studentId));
    }

    @PostMapping("/assign")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<StudentFee> assignFee(@RequestBody StudentFee studentFee) {
        studentFee.setStudent(studentRepository.findById(studentFee.getStudent().getStudentId())
                .orElseThrow(() -> new RuntimeException("Student not found")));
                
        studentFee.setFeeStructure(feeStructureRepository.findById(studentFee.getFeeStructure().getFeeStructureId())
                .orElseThrow(() -> new RuntimeException("Fee structure not found")));
                
        studentFee.setStatus(FeeStatus.PENDING);
        studentFee.setPaidAmount(0.0);
        
        return ResponseEntity.ok(studentFeeRepository.save(studentFee));
    }
}
