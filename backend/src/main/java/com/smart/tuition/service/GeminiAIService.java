package com.smart.tuition.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class GeminiAIService {

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public String extractStudentData(MultipartFile file) throws Exception {
        String mimeType = file.getContentType();
        
        // Handle CSVs locally without Gemini to save costs and ensure accuracy
        if (mimeType != null && (mimeType.equals("text/csv") || mimeType.equals("application/vnd.ms-excel") || file.getOriginalFilename().endsWith(".csv"))) {
            log.info("Processing CSV file locally");
            return parseCsvToJson(file);
        }

        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + geminiApiKey;

        byte[] fileBytes = file.getBytes();
        String base64Data = Base64.getEncoder().encodeToString(fileBytes);

        if (mimeType == null || mimeType.isEmpty()) {
            mimeType = "application/pdf";
        }

        if (geminiApiKey == null || geminiApiKey.contains("your_gemini_api_key_here") || geminiApiKey.isBlank()) {
            log.warn("No valid Gemini API key found! Running in MOCK mode.");
            // Return mock data for demonstration purposes
            return "[{ \"firstName\": \"John\", \"lastName\": \"Doe\", \"name\": \"John Doe\", \"email\": \"johndoe@example.com\", \"mobileNo\": \"+91 9876543210\", \"dob\": \"2010-05-15\", \"courseName\": \"Class 10th Math\", \"semester\": 1, \"academicYear\": \"2026-27\", \"admissionDate\": \"2023-08-01\", \"address\": \"123 Mock Street\", \"city\": \"Delhi\", \"state\": \"Delhi\", \"pincode\": \"110001\", \"guardianName\": \"Jane Doe\", \"guardianMobile\": \"+91 9876543211\", \"guardianRelationship\": \"Mother\" }]";
        }

        String prompt = "You are an AI assistant for a tuition center. Extract the student details from the provided admission document. " +
                "Return ONLY a valid JSON object WITH AN ARRAY AT THE ROOT (even for one student). Each object should contain: " +
                "firstName (String), lastName (String), name (String - full name), email (String), mobileNo (String), dob (String, YYYY-MM-DD), " +
                "courseName (String), semester (number), academicYear (String), admissionDate (String, YYYY-MM-DD), " +
                "address (String), city (String), state (String), pincode (String), guardianName (String), guardianMobile (String), " +
                "guardianRelationship (String). Do not include markdown formatting like ```json.";

        Map<String, Object> inlineData = new HashMap<>();
        inlineData.put("mimeType", mimeType);
        inlineData.put("data", base64Data);

        Map<String, Object> inlineDataPart = new HashMap<>();
        inlineDataPart.put("inlineData", inlineData);

        Map<String, Object> textPart = new HashMap<>();
        textPart.put("text", prompt);

        Map<String, Object> part1 = inlineDataPart;
        Map<String, Object> part2 = textPart;

        Map<String, Object> content = new HashMap<>();
        content.put("parts", List.of(part2, part1));

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("contents", List.of(content));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(requestBody, headers);

        log.info("Sending request to Gemini API to parse uploaded document...");
        
        try {
            ResponseEntity<String> response = restTemplate.postForEntity(url, requestEntity, String.class);
            
            JsonNode rootNode = objectMapper.readTree(response.getBody());
            String extractedText = rootNode.path("candidates")
                    .get(0)
                    .path("content")
                    .path("parts")
                    .get(0)
                    .path("text").asText();
                    
            log.info("Received response from Gemini API");
            
            // Clean up possible markdown if the model ignored instructions
            extractedText = extractedText.replaceAll("```json", "").replaceAll("```", "").trim();
            
            return extractedText;
        } catch (Exception e) {
            log.error("Failed to parse document with Gemini API", e);
            throw new RuntimeException("Failed to analyze document with AI: " + e.getMessage());
        }
    }

    private String parseCsvToJson(MultipartFile file) throws Exception {
        List<Map<String, Object>> records = new ArrayList<>();
        try (BufferedReader br = new BufferedReader(new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {
            String headerLine = br.readLine();
            if (headerLine == null) return "[]";
            String[] headers = headerLine.split(",");
            for (int i = 0; i < headers.length; i++) {
                headers[i] = headers[i].trim().replaceAll("^\"|\"$", "");
            }
            
            String line;
            while ((line = br.readLine()) != null) {
                if (line.trim().isEmpty()) continue;
                String[] values = line.split(",(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)");
                Map<String, Object> record = new HashMap<>();
                for (int i = 0; i < headers.length && i < values.length; i++) {
                    String key = headers[i];
                    String value = values[i].trim().replaceAll("^\"|\"$", "");
                    
                    if (key.equalsIgnoreCase("First Name")) record.put("firstName", value);
                    else if (key.equalsIgnoreCase("Last Name")) record.put("lastName", value);
                    else if (key.equalsIgnoreCase("Full Name") || key.equalsIgnoreCase("Name")) record.put("name", value);
                    else if (key.equalsIgnoreCase("Email")) record.put("email", value);
                    else if (key.equalsIgnoreCase("Mobile Number") || key.equalsIgnoreCase("Mobile") || key.equalsIgnoreCase("Phone")) record.put("mobileNo", value);
                    else if (key.equalsIgnoreCase("DOB") || key.equalsIgnoreCase("Date of Birth")) record.put("dob", value);
                    else if (key.equalsIgnoreCase("Course") || key.equalsIgnoreCase("Course Name")) record.put("courseName", value);
                    else if (key.equalsIgnoreCase("Semester")) {
                        try { record.put("semester", Integer.parseInt(value)); } catch(Exception e) { record.put("semester", 1); }
                    }
                    else if (key.equalsIgnoreCase("Academic Year")) record.put("academicYear", value);
                    else if (key.equalsIgnoreCase("Admission Date")) record.put("admissionDate", value);
                    else if (key.equalsIgnoreCase("Address")) record.put("address", value);
                    else if (key.equalsIgnoreCase("City")) record.put("city", value);
                    else if (key.equalsIgnoreCase("State")) record.put("state", value);
                    else if (key.equalsIgnoreCase("Pincode") || key.equalsIgnoreCase("Zip")) record.put("pincode", value);
                    else if (key.equalsIgnoreCase("Guardian Name") || key.equalsIgnoreCase("Parent Name")) record.put("guardianName", value);
                    else if (key.equalsIgnoreCase("Guardian Mobile") || key.equalsIgnoreCase("Parent Mobile")) record.put("guardianMobile", value);
                    else if (key.equalsIgnoreCase("Guardian Relationship") || key.equalsIgnoreCase("Relationship")) record.put("guardianRelationship", value);
                    else record.put(key, value);
                }
                
                // fallback for name if missing
                if (!record.containsKey("name") && record.containsKey("firstName") && record.containsKey("lastName")) {
                    record.put("name", record.get("firstName") + " " + record.get("lastName"));
                }
                
                records.add(record);
            }
        }
        return objectMapper.writeValueAsString(records);
    }
}
