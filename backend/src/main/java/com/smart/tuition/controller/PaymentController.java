package com.smart.tuition.controller;

import com.smart.tuition.entity.Payment;
import com.smart.tuition.entity.StudentFee;
import com.smart.tuition.repository.PaymentRepository;
import com.smart.tuition.repository.StudentFeeRepository;
import com.smart.tuition.repository.StudentRepository;
import com.smart.tuition.service.PaymentService;
import com.smart.tuition.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentRepository paymentRepository;
    private final StudentFeeRepository studentFeeRepository;
    private final StudentRepository studentRepository;
    private final com.smart.tuition.service.PaymentAllocationService paymentAllocationService;

    @Value("${razorpay.api.key}")
    private String razorpayApiKey;

    @Value("${razorpay.api.secret}")
    private String razorpayApiSecret;

    @PostMapping("/process")
    public ResponseEntity<Payment> processPayment(@RequestBody PaymentRequest request, @AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not authenticated");
        }
        
        Long studentId = request.getStudentId();
        if (studentId == null) {
            var student = studentRepository.findByUser_UserId(userDetails.getUserId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Student profile not found"));
            studentId = student.getStudentId();
        }

        if (request.getFeeId() != null) {
            Payment savedPayment = paymentAllocationService.processSpecificFeePayment(
                studentId, request.getFeeId(), request.getAmount(), request.getPaymentMethod());
            return ResponseEntity.ok(savedPayment);
        } else {
            paymentAllocationService.processLumpSumOldestDueFirst(
                studentId, request.getAmount(), request.getPaymentMethod());
            return ResponseEntity.ok().build();
        }
    }

    @PostMapping("/create-order")
    public ResponseEntity<Map<String, String>> createOrder(@RequestBody PaymentRequest request, @AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not authenticated");
        }
        try {
            RazorpayClient razorpayClient = new RazorpayClient(razorpayApiKey, razorpayApiSecret);
            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", (int) (request.getAmount() * 100)); // amount in paise
            orderRequest.put("currency", "INR");
            orderRequest.put("receipt", "txn_" + System.currentTimeMillis());

            Order order = razorpayClient.orders.create(orderRequest);

            Map<String, String> response = new HashMap<>();
            response.put("orderId", order.get("id"));
            response.put("amount", String.valueOf(request.getAmount()));
            response.put("key", razorpayApiKey);
            return ResponseEntity.ok(response);
        } catch (RazorpayException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to create Razorpay order", e);
        }
    }

    @PostMapping("/verify")
    public ResponseEntity<Payment> verifyPayment(@RequestBody Map<String, Object> data, @AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not authenticated");
        }
        try {
            String razorpayOrderId = (String) data.get("razorpay_order_id");
            String razorpayPaymentId = (String) data.get("razorpay_payment_id");
            String razorpaySignature = (String) data.get("razorpay_signature");
            
            Long studentId = data.containsKey("studentId") && data.get("studentId") != null ? Long.valueOf(data.get("studentId").toString()) : 0L;
            if (studentId == 0L) {
                var student = studentRepository.findByUser_UserId(userDetails.getUserId())
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Student profile not found"));
                studentId = student.getStudentId();
            }
            Long feeId = data.containsKey("feeId") && data.get("feeId") != null ? Long.valueOf(data.get("feeId").toString()) : null;
            Double amount = Double.valueOf(data.get("amount").toString());
            String method = data.containsKey("method") ? (String) data.get("method") : "ONLINE";

            JSONObject options = new JSONObject();
            options.put("razorpay_order_id", razorpayOrderId);
            options.put("razorpay_payment_id", razorpayPaymentId);
            options.put("razorpay_signature", razorpaySignature);

            boolean isValid = Utils.verifyPaymentSignature(options, razorpayApiSecret);

            if (isValid) {
                Payment payment;
                if (feeId != null) {
                    payment = paymentAllocationService.processSpecificFeePayment(studentId, feeId, amount, method);
                } else {
                    paymentAllocationService.processLumpSumOldestDueFirst(studentId, amount, method);
                    // Just fetching the latest payment as a hack for lump sum return, but ideally should return list
                    payment = paymentRepository.findByStudent_StudentId(studentId).get(0);
                }
                
                // Update transaction ID to real razorpay payment ID
                payment.setTransactionId(razorpayPaymentId);
                paymentRepository.save(payment);
                
                return ResponseEntity.ok(payment);
            } else {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Payment verification failed");
            }
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error verifying payment", e);
        }
    }

    public static class PaymentRequest {
        private Long studentId;
        private Long feeId;
        private Double amount;
        private String paymentMethod;

        public Long getStudentId() { return studentId; }
        public void setStudentId(Long studentId) { this.studentId = studentId; }
        public Long getFeeId() { return feeId; }
        public void setFeeId(Long feeId) { this.feeId = feeId; }
        public Double getAmount() { return amount; }
        public void setAmount(Double amount) { this.amount = amount; }
        public String getPaymentMethod() { return paymentMethod; }
        public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
    }

    @GetMapping("/history/{studentId}")
    public ResponseEntity<List<Payment>> getPaymentHistory(@PathVariable Long studentId, @AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not authenticated");
        }
        var student = studentRepository.findById(studentId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        if ("ROLE_ADMIN".equals(userDetails.getRole())) {
            if (student.getAdmin() == null || !student.getAdmin().getUserId().equals(userDetails.getUserId())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied. Student belongs to another admin.");
            }
        } else if (!student.getUser().getUserId().equals(userDetails.getUserId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }
        return ResponseEntity.ok(paymentRepository.findByStudent_StudentId(studentId));
    }
    
    @GetMapping("/receipt/{id}")
    public ResponseEntity<Payment> getReceipt(@PathVariable Long id, @AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not authenticated");
        }
        Payment payment = paymentRepository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Payment not found"));
        
        if ("ROLE_ADMIN".equals(userDetails.getRole())) {
            if (payment.getStudent().getAdmin() == null || !payment.getStudent().getAdmin().getUserId().equals(userDetails.getUserId())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied. Student belongs to another admin.");
            }
        } else if (!payment.getStudent().getUser().getUserId().equals(userDetails.getUserId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }
        
        return ResponseEntity.ok(payment);
    }
}
