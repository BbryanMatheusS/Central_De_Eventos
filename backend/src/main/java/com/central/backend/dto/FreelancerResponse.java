package com.central.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class FreelancerResponse {
    private Long id;
    private String name;
    private String document;
    private String pixKey;
    private String email;
}
