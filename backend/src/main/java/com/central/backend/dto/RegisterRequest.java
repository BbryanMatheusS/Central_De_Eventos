package com.central.backend.dto;

import com.central.backend.entity.Role;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RegisterRequest {
    private String email;
    private String password;
    private Role role;
    
    // Required only for Role.OWNER
    private String companyName;
    private String cnpj;
    
    // Required only for Role.FREELANCER
    private String name;
    private String document;
    private String pixKey;
}
