package com.smart.tuition.controller;

import com.smart.tuition.entity.StudentFee;
import com.smart.tuition.entity.enums.FeeStatus;
import com.smart.tuition.repository.StudentFeeRepository;
import com.smart.tuition.repository.StudentRepository;
import com.smart.tuition.repository.FeeStructureRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

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
    public ResponseEntity<List<StudentFee>> getAllStudentFees() {
        return ResponseEntity.ok(studentFeeRepository.findAll());
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<StudentFee>> getFeesForStudent(@PathVariable Long studentId) {
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
