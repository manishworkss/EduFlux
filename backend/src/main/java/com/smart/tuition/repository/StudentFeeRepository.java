package com.smart.tuition.repository;

import com.smart.tuition.entity.StudentFee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentFeeRepository extends JpaRepository<StudentFee, Long> {
    List<StudentFee> findByStudent_StudentId(Long studentId);
    List<StudentFee> findByStudent_Admin_UserId(Long adminId);
    List<StudentFee> findByStudent_StudentIdOrderByFeeMonthDesc(Long studentId);
    
    Optional<StudentFee> findByStudent_StudentIdAndFeeMonth(Long studentId, java.time.LocalDate feeMonth);
    
    @Query("SELECT sf FROM StudentFee sf WHERE sf.student.studentId = :studentId AND sf.status IN ('PENDING', 'OVERDUE', 'PARTIALLY_PAID') ORDER BY sf.feeMonth ASC")
    List<StudentFee> findOutstandingFeesByStudentOrderByFeeMonthAsc(@org.springframework.data.repository.query.Param("studentId") Long studentId);
    
    @Query("SELECT SUM(sf.remainingAmount) FROM StudentFee sf WHERE sf.student.studentId = :studentId")
    Double sumRemainingAmountByStudent(@org.springframework.data.repository.query.Param("studentId") Long studentId);
    
    @Query("SELECT SUM(sf.paidAmount) FROM StudentFee sf WHERE sf.student.studentId = :studentId")
    Double sumPaidAmountByStudent(@org.springframework.data.repository.query.Param("studentId") Long studentId);
    
    @Query("SELECT sf FROM StudentFee sf WHERE sf.status = 'PENDING' AND sf.dueDate < :currentDate")
    List<StudentFee> findFeesToMarkOverdue(@org.springframework.data.repository.query.Param("currentDate") java.time.LocalDate currentDate);
    
    @Query("SELECT sf FROM StudentFee sf WHERE sf.status IN ('PENDING', 'PARTIAL')")
    List<StudentFee> findAllPendingOrPartial();

    @Query("SELECT sf FROM StudentFee sf WHERE sf.status = 'OVERDUE'")
    List<StudentFee> findFeesForOverdueReminders();
}
