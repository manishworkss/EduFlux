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

        log.info("=========================================");
        log.info("📧 MOCK EMAIL INTERCEPTED");
        log.info("To: {}", toEmail);
        log.info("Subject: {}", subject);
        log.info("Body:\n{}", body);
        log.info("=========================================");

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(toEmail);
            message.setSubject(subject);
            message.setText(body);
            // In a real environment with valid SMTP properties, this will send the email.
            // If it fails (e.g. because of dummy credentials), we catch and log it so it doesn't break the dev flow.
            mailSender.send(message);
            log.info("Email sent successfully to {}", toEmail);
        } catch (Exception e) {
            log.warn("Failed to send email via SMTP (Likely using dummy credentials in application.properties). OTP is logged above. Error: {}", e.getMessage());
        }
    }
}
