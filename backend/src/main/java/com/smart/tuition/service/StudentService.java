package com.smart.tuition.service;

import com.smart.tuition.entity.Student;
import com.smart.tuition.entity.User;
import com.smart.tuition.entity.enums.Role;
import com.smart.tuition.repository.StudentRepository;
import com.smart.tuition.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class StudentService {

    private final StudentRepository studentRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public Map<String, Object> registerStudent(Student studentDetails, Long adminId) {
        String generatedPassword = generatePassword(studentDetails);
        String enrollmentNumber = generateEnrollmentNumber();

        User adminUser = userRepository.findById(adminId)
                .orElseThrow(() -> new RuntimeException("Admin not found"));

        User user = new User();
        user.setName(studentDetails.getUser().getName());
        user.setEmail(studentDetails.getUser().getEmail());
        user.setPassword(passwordEncoder.encode(generatedPassword));
        user.setRawPassword(generatedPassword);
        user.setRole(Role.ROLE_STUDENT);
        user.setMustChangePassword(true);
        user.setProfileCompleted(false);
        user.setMobileNo(studentDetails.getPhone());
        user.setAddress(studentDetails.getAddress());
        
        User savedUser = userRepository.save(user);

        studentDetails.setUser(savedUser);
        studentDetails.setAdmin(adminUser);
        studentDetails.setEnrollmentNumber(enrollmentNumber);
        studentDetails.setPersonalEmail(studentDetails.getUser().getEmail());
        
        Student savedStudent = studentRepository.save(studentDetails);

        Map<String, Object> response = new HashMap<>();
        response.put("student", savedStudent);
        response.put("temporaryPassword", generatedPassword);

        return response;
    }

    private String generatePassword(Student student) {
        String name = student.getUser().getName();
        String firstTwo = "st";
        if (name != null) {
            String firstName = name.trim().split("\\s+")[0].replaceAll("[^a-zA-Z]", "");
            if (firstName.length() >= 2) {
                firstTwo = firstName.substring(0, 2).toLowerCase();
            } else if (firstName.length() == 1) {
                firstTwo = (firstName + "a").toLowerCase();
            }
        }
        String year = student.getDob() != null ? String.valueOf(student.getDob().getYear()) : String.valueOf(java.time.LocalDate.now().getYear());
        return firstTwo + "@" + year;
    }

    private String generateEnrollmentNumber() {
        Long maxId = studentRepository.findMaxEnrollmentNumber();
        if (maxId == null || maxId < 2601010L) {
            return "2601010";
        }
        return String.valueOf(maxId + 1);
    }
}
