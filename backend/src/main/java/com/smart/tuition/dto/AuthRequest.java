package com.smart.tuition.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AuthRequest {
    @NotBlank(message = "Email or Student ID is required")
    private String email;

    @NotBlank(message = "Password is required")
    private String password;
}
