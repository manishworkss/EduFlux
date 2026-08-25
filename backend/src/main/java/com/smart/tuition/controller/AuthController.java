package com.smart.tuition.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.smart.tuition.dto.AuthRequest;
import com.smart.tuition.dto.AuthResponse;
import com.smart.tuition.dto.SignupRequest;
import com.smart.tuition.dto.VerifyOtpRequest;
import com.smart.tuition.entity.OtpVerification;
import com.smart.tuition.entity.Student;
import com.smart.tuition.entity.User;
import com.smart.tuition.entity.enums.Role;
import com.smart.tuition.repository.OtpVerificationRepository;
import com.smart.tuition.repository.StudentRepository;
import com.smart.tuition.repository.UserRepository;
import com.smart.tuition.security.CustomUserDetails;
import com.smart.tuition.security.JwtUtil;
import com.smart.tuition.service.EmailService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final OtpVerificationRepository otpVerificationRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final ObjectMapper objectMapper;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        String jwtToken = jwtUtil.generateToken(userDetails);

        AuthResponse response = AuthResponse.builder()
                .token(jwtToken)
                .userId(userDetails.getUserId())
                .role(userDetails.getRole())
                .build();

        return ResponseEntity.ok(response);
    }

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@Valid @RequestBody SignupRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email is already in use");
        }

        // Generate 6-digit OTP
        String otp = String.format("%06d", new Random().nextInt(999999));

        // Delete any existing OTP for this email
        otpVerificationRepository.findTopByEmailOrderByCreatedAtDesc(request.getEmail())
                .ifPresent(existing -> otpVerificationRepository.delete(existing));

        OtpVerification otpVerification = new OtpVerification();
        otpVerification.setEmail(request.getEmail());
        otpVerification.setOtp(otp);
        otpVerification.setExpiresAt(LocalDateTime.now().plusMinutes(10));
        
        try {
            otpVerification.setSignupPayloadJson(objectMapper.writeValueAsString(request));
        } catch (JsonProcessingException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to process request");
        }

        otpVerificationRepository.save(otpVerification);

        emailService.sendOtpEmail(request.getEmail(), otp);

        return ResponseEntity.ok().body("{\"message\": \"OTP sent to email\"}");
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<AuthResponse> verifyOtp(@Valid @RequestBody VerifyOtpRequest request) {
        OtpVerification otpVerification = otpVerificationRepository.findTopByEmailOrderByCreatedAtDesc(request.getEmail())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "No pending OTP found for this email"));

        if (otpVerification.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "OTP has expired");
        }

        if (!otpVerification.getOtp().equals(request.getOtp())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid OTP");
        }

        SignupRequest signupRequest;
        try {
            signupRequest = objectMapper.readValue(otpVerification.getSignupPayloadJson(), SignupRequest.class);
        } catch (JsonProcessingException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to parse signup data");
        }

        // Create User
        User user = new User();
        user.setName(signupRequest.getName());
        user.setEmail(signupRequest.getEmail());
        user.setPassword(passwordEncoder.encode(signupRequest.getPassword()));
        user.setRole(signupRequest.getRole());
        
        user = userRepository.save(user);

        // If Student, create empty Student profile
        if (user.getRole() == Role.ROLE_STUDENT) {
            Student student = new Student();
            student.setUser(user);
            student.setEnrollmentNumber("TMP-" + System.currentTimeMillis());
            studentRepository.save(student);
        }

        otpVerificationRepository.delete(otpVerification);

        // Auto login
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(signupRequest.getEmail(), signupRequest.getPassword())
        );

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        String jwtToken = jwtUtil.generateToken(userDetails);

        AuthResponse response = AuthResponse.builder()
                .token(jwtToken)
                .userId(userDetails.getUserId())
                .role(userDetails.getRole())
                .build();

        return ResponseEntity.ok(response);
    }
}
