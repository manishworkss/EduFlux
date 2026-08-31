package com.smart.tuition.repository;

import com.smart.tuition.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByStudent_StudentId(Long studentId);
    List<Payment> findByStudent_Admin_UserId(Long adminId);
    boolean existsByTransactionId(String transactionId);
    boolean existsByReceiptNumber(String receiptNumber);
}
