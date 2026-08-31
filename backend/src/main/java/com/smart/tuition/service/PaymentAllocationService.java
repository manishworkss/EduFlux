package com.smart.tuition.service;

import com.smart.tuition.entity.Payment;
import com.smart.tuition.entity.Student;
import com.smart.tuition.entity.StudentFee;
import com.smart.tuition.entity.enums.FeeStatus;
import com.smart.tuition.entity.enums.PaymentStatus;
import com.smart.tuition.repository.PaymentRepository;
import com.smart.tuition.repository.StudentFeeRepository;
import com.smart.tuition.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class PaymentAllocationService {

    @Autowired
    private StudentFeeRepository studentFeeRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Transactional
    public Payment processSpecificFeePayment(Long studentId, Long feeId, Double amount, String paymentMethod) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new IllegalArgumentException("Student not found"));

        StudentFee fee = studentFeeRepository.findById(feeId)
                .orElseThrow(() -> new IllegalArgumentException("Fee not found"));

        if (!fee.getStudent().getStudentId().equals(studentId)) {
            throw new IllegalArgumentException("Fee does not belong to the student");
        }

        if (amount > fee.getRemainingAmount()) {
            throw new IllegalArgumentException("Payment amount exceeds remaining amount");
        }

        return allocatePaymentToFee(student, fee, amount, paymentMethod);
    }

    @Transactional
    public void processLumpSumOldestDueFirst(Long studentId, Double totalAmount, String paymentMethod) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new IllegalArgumentException("Student not found"));

        List<StudentFee> outstandingFees = studentFeeRepository.findOutstandingFeesByStudentOrderByFeeMonthAsc(studentId);

        Double remainingToAllocate = totalAmount;

        for (StudentFee fee : outstandingFees) {
            if (remainingToAllocate <= 0) break;

            Double allocateAmount = Math.min(fee.getRemainingAmount(), remainingToAllocate);
            allocatePaymentToFee(student, fee, allocateAmount, paymentMethod);
            remainingToAllocate -= allocateAmount;
        }

        if (remainingToAllocate > 0) {
            // Depending on business rules, could throw error, save as credit, or ignore.
            // Current rule: don't allow overpayment, but if using lumpsum we'll just stop or throw.
            throw new IllegalArgumentException("Payment amount exceeds total outstanding balance");
        }
    }

    private Payment allocatePaymentToFee(Student student, StudentFee fee, Double amount, String paymentMethod) {
        // Create Payment record
        Payment payment = new Payment();
        payment.setStudent(student);
        payment.setStudentFee(fee);
        payment.setAmount(amount);
        payment.setTransactionId("TXN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        payment.setReceiptNumber("REC-" + System.currentTimeMillis());
        payment.setPaymentMethod(paymentMethod);
        payment.setPaymentDate(LocalDateTime.now());
        payment.setStatus(PaymentStatus.SUCCESS);

        paymentRepository.save(payment);

        // Update fee paidAmount and let PrePersist/PreUpdate recalculate remainingAmount
        fee.setPaidAmount(fee.getPaidAmount() + amount);
        
        // Manual calc to set status immediately since pre-update runs later
        double remaining = fee.getAmount() - fee.getPaidAmount();
        
        if (remaining <= 0) {
            fee.setStatus(FeeStatus.PAID);
        } else {
            fee.setStatus(FeeStatus.PARTIAL);
        }

        studentFeeRepository.save(fee);

        return payment;
    }
}
