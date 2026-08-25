package com.smart.tuition.controller;

import com.smart.tuition.entity.Payment;
import com.smart.tuition.entity.StudentFee;
import com.smart.tuition.entity.enums.FeeStatus;
import com.smart.tuition.entity.enums.PaymentStatus;
import com.smart.tuition.repository.PaymentRepository;
import com.smart.tuition.repository.StudentFeeRepository;
import com.smart.tuition.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentRepository paymentRepository;
    private final StudentFeeRepository studentFeeRepository;
    private final StudentRepository studentRepository;

    @PostMapping("/process")
    public ResponseEntity<Payment> processPayment(@RequestBody Payment paymentRequest) {
        StudentFee fee = studentFeeRepository.findById(paymentRequest.getStudentFee().getStudentFeeId())
                .orElseThrow(() -> new RuntimeException("Fee record not found"));
                
        // Mock processing
        Payment payment = new Payment();
        payment.setStudent(fee.getStudent());
        payment.setStudentFee(fee);
        payment.setAmount(paymentRequest.getAmount());
        payment.setPaymentMethod(paymentRequest.getPaymentMethod());
        payment.setTransactionId("TXN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        payment.setPaymentDate(LocalDateTime.now());
        
        // Simulating 100% success for demo
        payment.setStatus(PaymentStatus.SUCCESS);
        payment.setReceiptNumber("REC-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        
        Payment savedPayment = paymentRepository.save(payment);
        
        // Update fee record
        fee.setPaidAmount(fee.getPaidAmount() + payment.getAmount());
        if (fee.getPaidAmount() >= fee.getAmount()) {
            fee.setStatus(FeeStatus.PAID);
        }
        studentFeeRepository.save(fee);
        
        // Ideally, trigger a Notification here
        
        return ResponseEntity.ok(savedPayment);
    }

    @GetMapping("/history/{studentId}")
    public ResponseEntity<List<Payment>> getPaymentHistory(@PathVariable Long studentId) {
        return ResponseEntity.ok(paymentRepository.findByStudent_StudentId(studentId));
    }
}
