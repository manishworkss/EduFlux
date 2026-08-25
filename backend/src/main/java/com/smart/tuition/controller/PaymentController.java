package com.smart.tuition.controller;

import com.smart.tuition.entity.Payment;
import com.smart.tuition.entity.StudentFee;
import com.smart.tuition.entity.enums.FeeStatus;
import com.smart.tuition.entity.enums.PaymentStatus;
import com.smart.tuition.repository.NotificationRepository;
import com.smart.tuition.entity.Notification;
import com.smart.tuition.entity.enums.NotificationType;
import com.smart.tuition.repository.PaymentRepository;
import com.smart.tuition.repository.StudentFeeRepository;
import com.smart.tuition.repository.StudentRepository;
import com.smart.tuition.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.server.ResponseStatusException;

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
    private final NotificationRepository notificationRepository;

    @PostMapping("/process")
    public ResponseEntity<Payment> processPayment(@RequestBody Payment paymentRequest, @AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not authenticated");
        }

        StudentFee fee = studentFeeRepository.findById(paymentRequest.getStudentFee().getStudentFeeId())
                .orElseThrow(() -> new RuntimeException("Fee record not found"));
        
        if (!fee.getStudent().getUser().getUserId().equals(userDetails.getUserId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }
                
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
        
        Notification notification = new Notification();
        notification.setStudent(fee.getStudent());
        notification.setType(NotificationType.PAYMENT_SUCCESS);
        notification.setTitle("Payment Successful");
        notification.setMessage("Your payment of ₹" + payment.getAmount() + " for " + fee.getFeeStructure().getFeeType() + " was received. Transaction ID: " + payment.getTransactionId());
        notificationRepository.save(notification);
        
        return ResponseEntity.ok(savedPayment);
    }

    @GetMapping("/history/{studentId}")
    public ResponseEntity<List<Payment>> getPaymentHistory(@PathVariable Long studentId, @AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not authenticated");
        }
        var student = studentRepository.findById(studentId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        if (!student.getUser().getUserId().equals(userDetails.getUserId())) {
            // Note: Admin could be allowed here, but for now we restrict to the owner.
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }
        return ResponseEntity.ok(paymentRepository.findByStudent_StudentId(studentId));
    }
}
