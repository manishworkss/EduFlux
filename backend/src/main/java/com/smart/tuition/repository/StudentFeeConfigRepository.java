package com.smart.tuition.repository;

import com.smart.tuition.entity.StudentFeeConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentFeeConfigRepository extends JpaRepository<StudentFeeConfig, Long> {
    Optional<StudentFeeConfig> findByStudent_StudentId(Long studentId);
    List<StudentFeeConfig> findByStudent_Admin_UserId(Long adminId);
    List<StudentFeeConfig> findByActiveTrue();
}
