package com.smart.tuition.controller;

import com.smart.tuition.entity.Course;
import com.smart.tuition.repository.CourseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/courses")
@RequiredArgsConstructor
public class CourseController {

    private final CourseRepository courseRepository;
    private final com.smart.tuition.repository.UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<Course>> getAllCourses(org.springframework.security.core.Authentication authentication) {
        if (authentication != null && authentication.getPrincipal() instanceof com.smart.tuition.security.CustomUserDetails) {
            com.smart.tuition.security.CustomUserDetails userDetails = (com.smart.tuition.security.CustomUserDetails) authentication.getPrincipal();
            if (userDetails.getRole().equals("ROLE_ADMIN")) {
                return ResponseEntity.ok(courseRepository.findByAdmin_UserId(userDetails.getUserId()));
            } else if (userDetails.getRole().equals("ROLE_STUDENT")) {
                // Return courses for the student's admin if needed, but for now we can just return all or nothing.
                // Wait, the Student Dashboard doesn't even fetch all courses. It fetches the student's own course.
            }
        }
        return ResponseEntity.ok(courseRepository.findAll());
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Course> createCourse(@RequestBody Course course, org.springframework.security.core.Authentication authentication) {
        com.smart.tuition.security.CustomUserDetails userDetails = (com.smart.tuition.security.CustomUserDetails) authentication.getPrincipal();
        com.smart.tuition.entity.User adminUser = userRepository.findById(userDetails.getUserId())
                .orElseThrow(() -> new RuntimeException("Admin not found"));
        course.setAdmin(adminUser);
        return ResponseEntity.ok(courseRepository.save(course));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Course> updateCourse(@PathVariable Long id, @RequestBody Course courseDetails) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Course not found"));
        
        course.setCourseName(courseDetails.getCourseName());
        course.setDuration(courseDetails.getDuration());
        course.setDescription(courseDetails.getDescription());
        course.setStatus(courseDetails.getStatus());
        
        return ResponseEntity.ok(courseRepository.save(course));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> deleteCourse(@PathVariable Long id) {
        courseRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
