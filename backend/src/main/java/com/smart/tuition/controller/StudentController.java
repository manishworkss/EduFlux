package com.smart.tuition.controller;

import com.smart.tuition.entity.Student;
import com.smart.tuition.entity.User;
import com.smart.tuition.entity.enums.Role;
import com.smart.tuition.repository.StudentRepository;
import com.smart.tuition.repository.UserRepository;
import com.smart.tuition.repository.CourseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/students")
@RequiredArgsConstructor
public class StudentController {

    private final StudentRepository studentRepository;
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final PasswordEncoder passwordEncoder;

    @GetMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<List<Student>> getAllStudents() {
        return ResponseEntity.ok(studentRepository.findAll());
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Student> registerStudent(@RequestBody Student studentDetails) {
        // Create User account first
        User user = new User();
        user.setName(studentDetails.getUser().getName());
        user.setEmail(studentDetails.getUser().getEmail());
        user.setPassword(passwordEncoder.encode("student123")); // default password
        user.setRole(Role.ROLE_STUDENT);
        User savedUser = userRepository.save(user);

        // Map relationships
        studentDetails.setUser(savedUser);
        studentDetails.setCourse(courseRepository.findById(studentDetails.getCourse().getCourseId())
                .orElseThrow(() -> new RuntimeException("Course not found")));

        return ResponseEntity.ok(studentRepository.save(studentDetails));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Student> getStudentProfile(@PathVariable Long id) {
        // Can add logic to ensure student only views own profile
        return ResponseEntity.ok(studentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found")));
    }
}
