package com.smart.tuition.repository;

import com.smart.tuition.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {
    Optional<Course> findByCourseName(String courseName);
    java.util.List<Course> findByAdmin_UserId(Long adminId);
    Optional<Course> findByCourseNameAndAdmin_UserId(String courseName, Long adminId);
}
