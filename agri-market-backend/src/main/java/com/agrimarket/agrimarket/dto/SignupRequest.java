package com.agrimarket.agrimarket.dto;

import com.agrimarket.agrimarket.model.Role;
import lombok.Data;

@Data
public class SignupRequest {
    private String name;
    private String email;
    private String password;
    private String phone;
    private Role role;
}
