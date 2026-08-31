package com.smart.tuition.service;

import com.smart.tuition.entity.Notification;
import com.smart.tuition.entity.Payment;
import com.smart.tuition.entity.Student;
import com.smart.tuition.entity.StudentFee;
import com.smart.tuition.entity.enums.FeeStatus;
import com.smart.tuition.entity.enums.NotificationType;
import com.smart.tuition.entity.enums.PaymentStatus;
import com.smart.tuition.repository.NotificationRepository;
import com.smart.tuition.repository.PaymentRepository;
import com.smart.tuition.repository.StudentFeeRepository;
import com.smart.tuition.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final StudentFeeRepository studentFeeRepository;
    private final NotificationRepository notificationRepository;

    @Transactional
    public Payment processPayment(StudentFee fee, Double amount, String paymentMethod, Student student) {
        
        // Mock processing (Assuming success for this demo system)
        Payment payment = new Payment();
        payment.setStudent(student);
        payment.setStudentFee(fee);
        payment.setAmount(amount);
        payment.setPaymentMethod(paymentMethod);
        payment.setTransactionId("TXN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        payment.setPaymentDate(LocalDateTime.now());
        payment.setStatus(PaymentStatus.SUCCESS);
        payment.setReceiptNumber("REC-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        
        Payment savedPayment = paymentRepository.save(payment);
        
        // Update fee record safely
        Double newPaidAmount = fee.getPaidAmount() + amount;
        fee.setPaidAmount(newPaidAmount);
        
        if (newPaidAmount >= fee.getAmount()) {
            fee.setStatus(FeeStatus.PAID);
        } else if (newPaidAmount > 0) {
            fee.setStatus(FeeStatus.PARTIAL);
        }
        
        studentFeeRepository.save(fee);
        
        // Create notification
        Notification notification = new Notification();
        notification.setStudent(student);
        notification.setType(NotificationType.PAYMENT_SUCCESS);
        notification.setTitle("Payment Successful");
        notification.setMessage("Your payment of ₹" + amount + " for " + fee.getFeeStructure().getFeeType() + " was received. Transaction ID: " + savedPayment.getTransactionId());
        notificationRepository.save(notification);
        
        return savedPayment;
    }
}
