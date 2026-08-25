package com.smart.tuition.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    public void sendOtpEmail(String toEmail, String otp) {
        String subject = "AI EduFlux - Verify Your Account";
        String body = "Hello,\n\nYour OTP for account verification is: " + otp + "\n\nThis OTP is valid for 10 minutes.\n\nThanks,\nEduFlux Team";


        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(toEmail);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
            log.info("Email sent successfully to {}", toEmail);
        } catch (Exception e) {
            log.warn("Failed to send email via SMTP. Error: {}", e.getMessage());
        }
    }
}
