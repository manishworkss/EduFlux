package com.smart.tuition.controller;

import com.smart.tuition.dto.FeeSummaryDto;
import com.smart.tuition.entity.Notification;
import com.smart.tuition.entity.Payment;
import com.smart.tuition.entity.Student;
import com.smart.tuition.entity.StudentFee;
import com.smart.tuition.entity.enums.FeeStatus;
import com.smart.tuition.repository.NotificationRepository;
import com.smart.tuition.repository.PaymentRepository;
import com.smart.tuition.repository.StudentFeeRepository;
import com.smart.tuition.repository.StudentRepository;
import com.smart.tuition.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/v1/students/me")
@RequiredArgsConstructor
public class StudentMeController {

    private final StudentRepository studentRepository;
    private final StudentFeeRepository studentFeeRepository;
    private final PaymentRepository paymentRepository;
    private final NotificationRepository notificationRepository;

    private Student getAuthenticatedStudent(CustomUserDetails userDetails) {
        if (userDetails == null || userDetails.getUserId() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not authenticated");
        }
        return studentRepository.findByUser_UserId(userDetails.getUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Student profile not found for user"));
    }

    @GetMapping
    public ResponseEntity<Student> getMyProfile(@AuthenticationPrincipal CustomUserDetails userDetails) {
        Student student = getAuthenticatedStudent(userDetails);
        return ResponseEntity.ok(student);
    }

    @GetMapping("/fees")
    public ResponseEntity<List<StudentFee>> getMyFees(@AuthenticationPrincipal CustomUserDetails userDetails) {
        Student student = getAuthenticatedStudent(userDetails);
        List<StudentFee> fees = studentFeeRepository.findByStudent_StudentId(student.getStudentId());
        return ResponseEntity.ok(fees);
    }

    @GetMapping("/fees/summary")
    public ResponseEntity<FeeSummaryDto> getMyFeeSummary(@AuthenticationPrincipal CustomUserDetails userDetails) {
        Student student = getAuthenticatedStudent(userDetails);
        List<StudentFee> fees = studentFeeRepository.findByStudent_StudentId(student.getStudentId());

        double totalFee = 0;
        double paidAmount = 0;
        double pendingAmount = 0;
        double overdueAmount = 0;

        for (StudentFee fee : fees) {
            totalFee += fee.getAmount();
            paidAmount += fee.getPaidAmount();
            double remaining = fee.getAmount() - fee.getPaidAmount();
            
            if (fee.getStatus() == FeeStatus.OVERDUE) {
                overdueAmount += remaining;
            } else if (fee.getStatus() == FeeStatus.PENDING || fee.getStatus() == FeeStatus.PARTIAL) {
                pendingAmount += remaining;
            }
        }

        FeeSummaryDto summary = FeeSummaryDto.builder()
                .totalFee(totalFee)
                .paidAmount(paidAmount)
                .pendingAmount(pendingAmount)
                .overdueAmount(overdueAmount)
                .build();

        return ResponseEntity.ok(summary);
    }

    @GetMapping("/payments")
    public ResponseEntity<List<Payment>> getMyPayments(@AuthenticationPrincipal CustomUserDetails userDetails) {
        Student student = getAuthenticatedStudent(userDetails);
        List<Payment> payments = paymentRepository.findByStudent_StudentId(student.getStudentId());
        return ResponseEntity.ok(payments);
    }

    @GetMapping("/notifications")
    public ResponseEntity<List<Notification>> getMyNotifications(@AuthenticationPrincipal CustomUserDetails userDetails) {
        Student student = getAuthenticatedStudent(userDetails);
        List<Notification> notifications = notificationRepository.findByStudent_StudentIdOrderByCreatedAtDesc(student.getStudentId());
        return ResponseEntity.ok(notifications);
    }

    @PutMapping("/notifications/{id}/read")
    public ResponseEntity<Void> markNotificationAsRead(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        Student student = getAuthenticatedStudent(userDetails);
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Notification not found"));
        
        if (!notification.getStudent().getStudentId().equals(student.getStudentId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }
        
        notification.setIsRead(true);
        notificationRepository.save(notification);
        return ResponseEntity.ok().build();
    }
}
