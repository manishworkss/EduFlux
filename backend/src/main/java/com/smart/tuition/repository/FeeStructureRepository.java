package com.smart.tuition.repository;

import com.smart.tuition.entity.FeeStructure;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FeeStructureRepository extends JpaRepository<FeeStructure, Long> {
    List<FeeStructure> findByCourse_CourseId(Long courseId);
    List<FeeStructure> findByAdmin_UserId(Long adminId);
}
