package com.smart.tuition.controller;

import com.smart.tuition.entity.Notification;
import com.smart.tuition.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import com.smart.tuition.security.CustomUserDetails;
import com.smart.tuition.repository.StudentRepository;

import java.util.List;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationRepository notificationRepository;
    private final StudentRepository studentRepository;
    private final com.smart.tuition.service.FeeNotificationService feeNotificationService;

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<Notification>> getStudentNotifications(@PathVariable Long studentId, @AuthenticationPrincipal CustomUserDetails userDetails) {
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
        return ResponseEntity.ok(notificationRepository.findByStudent_StudentIdOrderByCreatedAtDesc(studentId));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Long id, @AuthenticationPrincipal CustomUserDetails userDetails) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
                
        if ("ROLE_ADMIN".equals(userDetails.getRole())) {
            if (notification.getStudent().getAdmin() == null || !notification.getStudent().getAdmin().getUserId().equals(userDetails.getUserId())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied. Student belongs to another admin.");
            }
        } else if (!notification.getStudent().getUser().getUserId().equals(userDetails.getUserId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }
        
        notification.setIsRead(true);
        notificationRepository.save(notification);
        return ResponseEntity.ok().build();
    }
    
    @PostMapping("/trigger-reminders")
    public ResponseEntity<?> triggerReminders(@RequestParam(required = false) String referenceDate) {
        java.time.LocalDate ref = referenceDate != null ? java.time.LocalDate.parse(referenceDate) : java.time.LocalDate.now();
        feeNotificationService.generateFeeReminders(ref);
        return ResponseEntity.ok("Reminders triggered for reference date: " + ref);
    }
}
