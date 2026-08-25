package com.smart.tuition.controller;

import com.smart.tuition.entity.Student;
import com.smart.tuition.repository.StudentRepository;
import com.smart.tuition.security.CustomUserDetails;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/v1/ai")
@RequiredArgsConstructor
public class AIAssistantController {

    private final StudentRepository studentRepository;

    @Data
    public static class AIQueryRequest {
        private String query;
    }

    @Data
    public static class AIQueryResponse {
        private String response;
        private String action;
        private Object payload;
    }

    @PostMapping("/ask")
    public ResponseEntity<AIQueryResponse> askAssistant(@RequestBody AIQueryRequest request, @AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not authenticated");
        }

        String role = userDetails.getRole();
        String query = request.getQuery().toLowerCase();
        AIQueryResponse response = new AIQueryResponse();
        response.setAction("NONE");

        if ("ROLE_ADMIN".equals(role)) {
            if (query.contains("create student") || query.contains("create account")) {
                response.setResponse("Creating student accounts is a write operation. Confirm before continuing.");
                response.setAction("CREATE_STUDENT_PROMPT");
            } else if (query.contains("overdue") || query.contains("pending")) {
                response.setResponse("There are several students with overdue fees. Check the dashboard for details.");
            } else {
                response.setResponse("Hi Admin! I am the EduFlux AI Assistant. I can help you manage students, create accounts, and analyze fees.");
            }
        } else {
            Student student = studentRepository.findByUser_UserId(userDetails.getUserId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Student not found"));

            if (query.contains("how much") || query.contains("pending")) {
                response.setResponse("You have fees pending. Please check your 'My Fees' tab for a detailed breakdown.");
            } else if (query.contains("next payment") || query.contains("due")) {
                response.setResponse("Your next payment is due soon. Check the 'Dashboard' for upcoming due dates.");
            } else if (query.contains("overdue")) {
                response.setResponse("Overdue fees incur a late penalty. Make sure to pay them via the 'My Fees' section.");
            } else {
                response.setResponse("Hi " + student.getUser().getName().split(" ")[0] + "! I am the EduFlux AI Fee Assistant. I can help you with questions about your pending fees, due dates, and payment history.");
            }
        }

        return ResponseEntity.ok(response);
    }
}
