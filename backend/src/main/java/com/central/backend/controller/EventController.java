package com.central.backend.controller;

import com.central.backend.dto.EventParticipationRequest;
import com.central.backend.dto.EventRequest;
import com.central.backend.entity.Event;
import com.central.backend.entity.EventParticipation;
import com.central.backend.entity.Freelancer;
import com.central.backend.repository.EventParticipationRepository;
import com.central.backend.repository.EventRepository;
import com.central.backend.repository.FreelancerRepository;
import com.central.backend.security.CustomUserDetails;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.io.PrintWriter;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
public class EventController {

    private final EventRepository eventRepository;
    private final EventParticipationRepository eventParticipationRepository;
    private final FreelancerRepository freelancerRepository;

    private CustomUserDetails getAuthenticatedUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return (CustomUserDetails) auth.getPrincipal();
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('OWNER', 'ROOT')")
    public ResponseEntity<?> createEvent(@RequestBody EventRequest request) {
        CustomUserDetails user = getAuthenticatedUser();
        if (user.getUser().getCompany() == null) {
            return ResponseEntity.badRequest().body("Usuário não tem empresa associada.");
        }

        Event event = new Event();
        event.setName(request.getName());
        event.setLocation(request.getLocation());
        event.setEventDate(request.getEventDate());
        event.setEventTime(request.getEventTime());
        event.setCompany(user.getUser().getCompany());
        
        Event saved = eventRepository.save(event);
        Map<String, Object> result = new HashMap<>();
        result.put("id", saved.getId());
        result.put("name", saved.getName());
        result.put("location", saved.getLocation());
        result.put("eventDate", saved.getEventDate());
        result.put("eventTime", saved.getEventTime());
        return ResponseEntity.ok(result);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('OWNER', 'ROOT')")
    public ResponseEntity<?> getCompanyEvents() {
        CustomUserDetails user = getAuthenticatedUser();
        List<Event> events;
        if (user.getUser().getRole().name().equals("ROOT")) {
            events = eventRepository.findAll();
        } else {
            events = eventRepository.findByCompanyId(user.getUser().getCompany().getId());
        }
        List<Map<String, Object>> result = events.stream().map(e -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", e.getId());
            map.put("name", e.getName());
            map.put("location", e.getLocation());
            map.put("eventDate", e.getEventDate());
            map.put("eventTime", e.getEventTime());
            return map;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{eventId}/participation")
    @PreAuthorize("hasAnyRole('OWNER', 'ROOT')")
    public ResponseEntity<?> getParticipations(@PathVariable Long eventId) {
        CustomUserDetails user = getAuthenticatedUser();
        Event event = eventRepository.findById(eventId).orElse(null);
        
        if (event == null || (!user.getUser().getRole().name().equals("ROOT") && !event.getCompany().getId().equals(user.getUser().getCompany().getId()))) {
            return ResponseEntity.status(403).body("Acesso Negado ou Evento Inexistente.");
        }
        
        List<Map<String, Object>> result = eventParticipationRepository.findByEventId(eventId).stream().map(p -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", p.getId());
            map.put("freelancerName", p.getFreelancer().getName());
            map.put("document", p.getFreelancer().getDocument());
            map.put("pixKey", p.getFreelancer().getPixKey());
            map.put("paymentAmount", p.getPaymentAmount());
            map.put("attended", p.getAttended());
            map.put("status", p.getStatus());
            return map;
        }).collect(Collectors.toList());
        
        return ResponseEntity.ok(result);
    }

    @PostMapping("/{eventId}/participation")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<?> addFreelancerToEvent(@PathVariable Long eventId, @RequestBody EventParticipationRequest request) {
        CustomUserDetails user = getAuthenticatedUser();
        
        Event event = eventRepository.findById(eventId).orElse(null);
        if (event == null || !event.getCompany().getId().equals(user.getUser().getCompany().getId())) {
            return ResponseEntity.status(403).body("Evento não encontrado ou acesso bloqueado (Empresa distinta).");
        }

        Freelancer freelancer = freelancerRepository.findById(request.getFreelancerId()).orElse(null);
        if (freelancer == null) {
            return ResponseEntity.badRequest().body("Freelancer não encontrado.");
        }

        EventParticipation participation = new EventParticipation();
        participation.setEvent(event);
        participation.setFreelancer(freelancer);
        participation.setPaymentAmount(request.getPaymentAmount());
        participation.setAttended(false);
        participation.setStatus("PENDING");

        eventParticipationRepository.save(participation);
        return ResponseEntity.ok(Map.of("message", "Participação criada com sucesso!"));
    }

    @PutMapping("/participation/{participationId}/attend")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<?> confirmAttendance(@PathVariable Long participationId) {
        CustomUserDetails user = getAuthenticatedUser();
        
        EventParticipation participation = eventParticipationRepository.findById(participationId).orElse(null);
        if (participation == null || !participation.getEvent().getCompany().getId().equals(user.getUser().getCompany().getId())) {
            return ResponseEntity.status(403).body("Participação não encontrada ou bloqueada por segurança.");
        }
        
        participation.setAttended(true);
        eventParticipationRepository.save(participation);
        return ResponseEntity.ok(Map.of("message", "Presença confirmada!"));
    }

    @DeleteMapping("/participation/{participationId}")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<?> removeParticipation(@PathVariable Long participationId) {
        CustomUserDetails user = getAuthenticatedUser();
        EventParticipation participation = eventParticipationRepository.findById(participationId).orElse(null);
        if (participation == null || !participation.getEvent().getCompany().getId().equals(user.getUser().getCompany().getId())) {
            return ResponseEntity.status(403).body(Map.of("message", "Acesso negado."));
        }
        eventParticipationRepository.delete(participation);
        return ResponseEntity.ok(Map.of("message", "Removido com sucesso."));
    }

    @PutMapping("/participation/{participationId}")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<?> updateParticipation(@PathVariable Long participationId, @RequestBody EventParticipationRequest request) {
        CustomUserDetails user = getAuthenticatedUser();
        EventParticipation participation = eventParticipationRepository.findById(participationId).orElse(null);
        if (participation == null || !participation.getEvent().getCompany().getId().equals(user.getUser().getCompany().getId())) {
            return ResponseEntity.status(403).body(Map.of("message", "Acesso negado."));
        }
        participation.setPaymentAmount(request.getPaymentAmount());
        eventParticipationRepository.save(participation);
        return ResponseEntity.ok(Map.of("message", "Cachê atualizado!"));
    }

    @GetMapping("/{eventId}/export-csv")
    @PreAuthorize("hasAnyRole('OWNER', 'ROOT')")
    public void exportCsv(@PathVariable Long eventId, HttpServletResponse response) throws Exception {
        CustomUserDetails user = getAuthenticatedUser();
        Event event = eventRepository.findById(eventId).orElseThrow();
        
        if (!user.getUser().getRole().name().equals("ROOT") && !event.getCompany().getId().equals(user.getUser().getCompany().getId())) {
            response.sendError(403, "Você não tem acesso aos dados consolidados de outra Empresa.");
            return;
        }

        List<EventParticipation> records = eventParticipationRepository.findByEventId(eventId);

        response.setContentType("text/csv");
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        response.setHeader("Content-Disposition", "attachment; filename=\"evento_" + eventId + "_relatorio.csv\"");

        PrintWriter writer = response.getWriter();
        writer.println("Nome do Freelancer,Documento,Chave PIX,Valor a Pagar,Presenca Confirmada");

        for (EventParticipation p : records) {
            writer.printf("%s,%s,%s,%.2f,%s\n",
                    p.getFreelancer().getName(),
                    p.getFreelancer().getDocument(),
                    p.getFreelancer().getPixKey() != null ? p.getFreelancer().getPixKey() : "Sem Chave PIX",
                    p.getPaymentAmount(),
                    p.getAttended() ? "SIM" : "NAO"
            );
        }
    }
}
