package com.smart.tuition.controller;

import com.smart.tuition.entity.Payment;
import com.smart.tuition.entity.Student;
import com.smart.tuition.entity.StudentFee;
import com.smart.tuition.entity.enums.FeeStatus;
import com.smart.tuition.repository.PaymentRepository;
import com.smart.tuition.repository.StudentFeeRepository;
import com.smart.tuition.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/admin/reports")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
public class AdminReportsController {

    private final StudentRepository studentRepository;
    private final StudentFeeRepository studentFeeRepository;
    private final PaymentRepository paymentRepository;

    @GetMapping("/collection")
    public ResponseEntity<Map<String, Object>> getCollectionReport(org.springframework.security.core.Authentication authentication) {
        com.smart.tuition.security.CustomUserDetails userDetails = (com.smart.tuition.security.CustomUserDetails) authentication.getPrincipal();
        List<Payment> payments = paymentRepository.findByStudent_Admin_UserId(userDetails.getUserId());
        
        // Course-wise collection
        Map<String, Double> courseWiseCollection = new HashMap<>();
        for (Payment p : payments) {
            if ("SUCCESS".equals(p.getStatus().name()) || "COMPLETED".equals(p.getStatus().name())) {
                String courseName = p.getStudent().getCourseName();
                if (courseName == null) courseName = "Unassigned";
                courseWiseCollection.put(courseName, courseWiseCollection.getOrDefault(courseName, 0.0) + p.getAmount());
            }
        }

        Map<String, Object> report = new HashMap<>();
        report.put("totalCollections", payments.stream()
                .filter(p -> "SUCCESS".equals(p.getStatus().name()) || "COMPLETED".equals(p.getStatus().name()))
                .mapToDouble(Payment::getAmount).sum());
        report.put("courseWiseCollection", courseWiseCollection);
        report.put("payments", payments);
        
        return ResponseEntity.ok(report);
    }

    @GetMapping("/pending")
    public ResponseEntity<List<StudentFee>> getPendingFeesReport(org.springframework.security.core.Authentication authentication) {
        com.smart.tuition.security.CustomUserDetails userDetails = (com.smart.tuition.security.CustomUserDetails) authentication.getPrincipal();
        return ResponseEntity.ok(studentFeeRepository.findByStudent_Admin_UserId(userDetails.getUserId()).stream()
                .filter(fee -> fee.getStatus() == FeeStatus.PENDING || fee.getStatus() == FeeStatus.PARTIAL)
                .collect(Collectors.toList()));
    }

    @GetMapping("/overdue")
    public ResponseEntity<List<StudentFee>> getOverdueFeesReport(org.springframework.security.core.Authentication authentication) {
        com.smart.tuition.security.CustomUserDetails userDetails = (com.smart.tuition.security.CustomUserDetails) authentication.getPrincipal();
        return ResponseEntity.ok(studentFeeRepository.findByStudent_Admin_UserId(userDetails.getUserId()).stream()
                .filter(fee -> fee.getStatus() == FeeStatus.OVERDUE)
                .collect(Collectors.toList()));
    }
}
