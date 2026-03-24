package com.central.backend.controller;

import com.central.backend.dto.FreelancerRequest;
import com.central.backend.dto.FreelancerResponse;
import com.central.backend.entity.EventParticipation;
import com.central.backend.repository.EventParticipationRepository;
import com.central.backend.repository.FreelancerRepository;
import com.central.backend.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/freelancers")
@RequiredArgsConstructor
public class FreelancerController {

    private final FreelancerRepository freelancerRepository;
    private final EventParticipationRepository eventParticipationRepository;

    @GetMapping("/me")
    @PreAuthorize("hasRole('FREELANCER')")
    public ResponseEntity<FreelancerResponse> getMyProfile() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        CustomUserDetails userDetails = (CustomUserDetails) auth.getPrincipal();

        return freelancerRepository.findByUserId(userDetails.getUser().getId())
                .map(f -> ResponseEntity.ok(
                        new FreelancerResponse(f.getId(), f.getName(), f.getDocument(), f.getPixKey(), userDetails.getUsername())
                ))
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/me")
    @PreAuthorize("hasRole('FREELANCER')")
    public ResponseEntity<FreelancerResponse> updateMyProfile(@RequestBody FreelancerRequest updateData) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        CustomUserDetails userDetails = (CustomUserDetails) auth.getPrincipal();

        return freelancerRepository.findByUserId(userDetails.getUser().getId())
                .map(f -> {
                    if (updateData.getName() != null) f.setName(updateData.getName());
                    if (updateData.getDocument() != null) f.setDocument(updateData.getDocument());
                    if (updateData.getPixKey() != null) f.setPixKey(updateData.getPixKey());

                    f = freelancerRepository.save(f);

                    return ResponseEntity.ok(
                            new FreelancerResponse(f.getId(), f.getName(), f.getDocument(), f.getPixKey(), userDetails.getUsername())
                    );
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/all")
    @PreAuthorize("hasAnyRole('OWNER', 'ROOT')")
    public ResponseEntity<List<Map<String, Object>>> getAllFreelancers() {
        List<Map<String, Object>> list = freelancerRepository.findAll().stream().map(f -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", f.getId());
            map.put("name", f.getName());
            map.put("document", f.getDocument());
            return map;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }

    @GetMapping("/me/events")
    @PreAuthorize("hasRole('FREELANCER')")
    public ResponseEntity<List<Map<String, Object>>> getMyEvents() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        CustomUserDetails userDetails = (CustomUserDetails) auth.getPrincipal();
        var freelancer = freelancerRepository.findByUserId(userDetails.getUser().getId()).orElseThrow();
        
        List<Map<String, Object>> events = eventParticipationRepository.findAll().stream()
            .filter(p -> p.getFreelancer().getId().equals(freelancer.getId()))
            .map(p -> {
                Map<String, Object> map = new HashMap<>();
                map.put("participationId", p.getId());
                map.put("eventName", p.getEvent().getName());
                map.put("eventLocation", p.getEvent().getLocation());
                map.put("eventDate", p.getEvent().getEventDate().toString());
                map.put("eventTime", p.getEvent().getEventTime().toString());
                map.put("paymentAmount", p.getPaymentAmount());
                map.put("status", p.getStatus());
                map.put("attended", p.getAttended());
                return map;
            }).collect(Collectors.toList());

        return ResponseEntity.ok(events);
    }
    
    @PutMapping("/participation/{participationId}/status")
    @PreAuthorize("hasRole('FREELANCER')")
    public ResponseEntity<?> updateParticipationStatus(@PathVariable Long participationId, @RequestBody Map<String, String> payload) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        CustomUserDetails userDetails = (CustomUserDetails) auth.getPrincipal();

        var freelancer = freelancerRepository.findByUserId(userDetails.getUser().getId()).orElseThrow();
        EventParticipation participation = eventParticipationRepository.findById(participationId).orElseThrow();
        
        if (!participation.getFreelancer().getId().equals(freelancer.getId())) {
             return ResponseEntity.status(403).body(Map.of("message", "Acesso Negado"));
        }
        
        participation.setStatus(payload.get("status"));
        eventParticipationRepository.save(participation);
        return ResponseEntity.ok(Map.of("message", "Status atualizado!"));
    }
}
