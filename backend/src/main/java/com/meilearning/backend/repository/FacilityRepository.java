package com.meilearning.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;
import com.meilearning.backend.entity.Facility;
import com.meilearning.backend.entity.enums.FacilityStatus;

import java.util.List;

@Repository
public interface FacilityRepository extends JpaRepository<Facility, Long>, JpaSpecificationExecutor<Facility> {

    List<Facility> findByStatus(FacilityStatus status);

    List<Facility> findByNameContainingIgnoreCase(String name);

    long countByStatus(FacilityStatus status);

    boolean existsByName(String name);
}
