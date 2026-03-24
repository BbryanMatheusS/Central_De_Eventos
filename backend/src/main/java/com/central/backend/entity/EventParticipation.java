package com.central.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "event_participation")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class EventParticipation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "freelancer_id", nullable = false)
    private Freelancer freelancer;

    @Column(name = "payment_amount", nullable = false)
    private BigDecimal paymentAmount;

    @Column(nullable = false)
    private Boolean attended = false;

    @Column(nullable = false, length = 20)
    private String status = "PENDING";
}
