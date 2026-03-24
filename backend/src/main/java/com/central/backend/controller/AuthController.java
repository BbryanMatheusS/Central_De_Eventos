package com.central.backend.controller;

import com.central.backend.dto.AuthResponse;
import com.central.backend.dto.LoginRequest;
import com.central.backend.dto.RegisterRequest;
import com.central.backend.entity.Company;
import com.central.backend.entity.Freelancer;
import com.central.backend.entity.Role;
import com.central.backend.entity.User;
import com.central.backend.repository.CompanyRepository;
import com.central.backend.repository.FreelancerRepository;
import com.central.backend.repository.UserRepository;
import com.central.backend.security.CustomUserDetails;
import com.central.backend.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;
    private final FreelancerRepository freelancerRepository;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        CustomUserDetails userDetails = (CustomUserDetails) auth.getPrincipal();
        User user = userDetails.getUser();
        
        Long companyId = user.getCompany() != null ? user.getCompany().getId() : null;
        String token = jwtUtil.generateToken(userDetails, user.getId(), companyId);

        return ResponseEntity.ok(new AuthResponse(token, user.getId(), user.getRole(), companyId));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("E-mail já está em uso.");
        }

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());

        // Se for um Dono de Empresa, ele informou os dados da empresa na request, e nós já criamos com segurança atrelada.
        if (request.getRole() == Role.OWNER) {
            Company company = new Company();
            company.setName(request.getCompanyName());
            company.setCnpj(request.getCnpj());
            company = companyRepository.save(company);
            user.setCompany(company);
        }

        user = userRepository.save(user);

        // Se for um Freelancer, vinculamos os dados na tabela estendida.
        if (request.getRole() == Role.FREELANCER) {
            Freelancer freelancer = new Freelancer();
            freelancer.setUser(user);
            freelancer.setName(request.getName());
            freelancer.setDocument(request.getDocument());
            freelancer.setPixKey(request.getPixKey());
            freelancerRepository.save(freelancer);
        }

        return ResponseEntity.ok("Usuário registrado com sucesso!");
    }

    @PutMapping("/password")
    public ResponseEntity<?> forceChangePassword(@RequestBody LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail()).orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest().body("Usuário não encontrado!");
        }
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        userRepository.save(user);
        return ResponseEntity.ok("Senha do usuário " + request.getEmail() + " alterada com sucesso!");
    }
}
