package com.smart.tuition.security;

import com.smart.tuition.entity.User;
import com.smart.tuition.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.smart.tuition.entity.Student;
import com.smart.tuition.repository.StudentRepository;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Optional<User> userOpt = userRepository.findByEmail(username);
        
        if (userOpt.isEmpty()) {
            Optional<Student> studentOpt = studentRepository.findByEnrollmentNumber(username);
            if (studentOpt.isPresent()) {
                userOpt = Optional.of(studentOpt.get().getUser());
            }
        }
        
        User user = userOpt.orElseThrow(() -> new UsernameNotFoundException("User not found with email or ID: " + username));
        return new CustomUserDetails(user);
    }
}
