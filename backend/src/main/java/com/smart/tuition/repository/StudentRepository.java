package com.smart.tuition.repository;

import com.smart.tuition.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {
    Optional<Student> findByEnrollmentNumber(String enrollmentNumber);
    boolean existsByEnrollmentNumber(String enrollmentNumber);
    Optional<Student> findByUser_UserId(Long userId);
    
    @org.springframework.data.jpa.repository.Query("SELECT MAX(CAST(s.enrollmentNumber AS long)) FROM Student s")
    Long findMaxEnrollmentNumber();

    java.util.List<Student> findByAdmin_UserId(Long adminId);
    Optional<Student> findByStudentIdAndAdmin_UserId(Long studentId, Long adminId);
}
