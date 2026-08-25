package com.smart.tuition.controller;

import com.smart.tuition.entity.enums.FeeStatus;
import com.smart.tuition.repository.StudentRepository;
import com.smart.tuition.repository.StudentFeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin/dashboard")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
public class AdminDashboardController {

    private final StudentRepository studentRepository;
    private final StudentFeeRepository studentFeeRepository;

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
}
