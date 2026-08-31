package com.smart.tuition.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.smart.tuition.entity.enums.Role;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AuthResponse {
    private String token;
    private Long userId;
    private Role role;
    private Boolean mustChangePassword;
    private String className;
    private String name;
    private Boolean profileCompleted;
}
