package com.agrimarket.agrimarket.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class JwtResponse {
    private String token;
    private String id;
    private String name;
    private String email;
    private String role;
}
