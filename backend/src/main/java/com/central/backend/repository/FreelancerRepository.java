package com.central.backend.repository;

import com.central.backend.entity.Freelancer;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface FreelancerRepository extends JpaRepository<Freelancer, Long> {
    Optional<Freelancer> findByUserId(Long userId);
}
