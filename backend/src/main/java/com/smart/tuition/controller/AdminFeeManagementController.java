package com.smart.tuition.controller;

import com.smart.tuition.entity.StudentFeeConfig;
import com.smart.tuition.repository.StudentFeeConfigRepository;
import com.smart.tuition.repository.StudentRepository;
import com.smart.tuition.service.MonthlyFeeGeneratorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/fee-management")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AdminFeeManagementController {

    @Autowired
    private StudentFeeConfigRepository configRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private MonthlyFeeGeneratorService generatorService;

    @GetMapping("/configs")
    public ResponseEntity<List<StudentFeeConfig>> getAllConfigs(org.springframework.security.core.Authentication authentication) {
        com.smart.tuition.security.CustomUserDetails userDetails = (com.smart.tuition.security.CustomUserDetails) authentication.getPrincipal();
        return ResponseEntity.ok(configRepository.findByStudent_Admin_UserId(userDetails.getUserId()));
    }

    @PostMapping("/configs")
    public ResponseEntity<?> setStudentFeeConfig(@RequestBody FeeConfigRequest request, org.springframework.security.core.Authentication authentication) {
        com.smart.tuition.security.CustomUserDetails userDetails = (com.smart.tuition.security.CustomUserDetails) authentication.getPrincipal();
        
        var studentOpt = studentRepository.findByStudentIdAndAdmin_UserId(request.getStudentId(), userDetails.getUserId());
        if (studentOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Student not found or access denied");
        }

        StudentFeeConfig config = configRepository.findByStudent_StudentId(request.getStudentId())
                .orElse(new StudentFeeConfig());

        config.setStudent(studentOpt.get());
        config.setMonthlyAmount(request.getMonthlyAmount());
        
        if (config.getConfigId() == null) {
            config.setFeeStartMonth(request.getFeeStartMonth().withDayOfMonth(1));
        }
        
        if (request.getEffectiveFrom() != null) {
            config.setEffectiveFrom(request.getEffectiveFrom().withDayOfMonth(1));
        }

        config.setActive(request.getActive() != null ? request.getActive() : true);

        return ResponseEntity.ok(configRepository.save(config));
    }

    @PostMapping("/trigger-generation")
    public ResponseEntity<?> triggerFeeGeneration() {
        generatorService.generateMonthlyFees();
        return ResponseEntity.ok("Fee generation triggered successfully.");
    }
}

class FeeConfigRequest {
    private Long studentId;
    private Double monthlyAmount;
    private LocalDate feeStartMonth;
    private LocalDate effectiveFrom;
    private Boolean active;

    // Getters and Setters
    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }
    
    public Double getMonthlyAmount() { return monthlyAmount; }
    public void setMonthlyAmount(Double monthlyAmount) { this.monthlyAmount = monthlyAmount; }
    
    public LocalDate getFeeStartMonth() { return feeStartMonth; }
    public void setFeeStartMonth(LocalDate feeStartMonth) { this.feeStartMonth = feeStartMonth; }
    
    public LocalDate getEffectiveFrom() { return effectiveFrom; }
    public void setEffectiveFrom(LocalDate effectiveFrom) { this.effectiveFrom = effectiveFrom; }
    
    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }
}
