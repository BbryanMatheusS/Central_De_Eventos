package com.central.backend.repository;

import com.central.backend.entity.EventParticipation;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface EventParticipationRepository extends JpaRepository<EventParticipation, Long> {
    List<EventParticipation> findByEventId(Long eventId);
    List<EventParticipation> findByFreelancerId(Long freelancerId);
}
