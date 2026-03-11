package meilearning.com.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;
import meilearning.com.backend.entity.Facility;
import meilearning.com.backend.entity.enums.FacilityStatus;

import java.util.List;

@Repository
public interface FacilityRepository extends JpaRepository<Facility, Long>, JpaSpecificationExecutor<Facility> {

    List<Facility> findByStatus(FacilityStatus status);

    List<Facility> findByNameContainingIgnoreCase(String name);

    long countByStatus(FacilityStatus status);

    boolean existsByName(String name);
}
