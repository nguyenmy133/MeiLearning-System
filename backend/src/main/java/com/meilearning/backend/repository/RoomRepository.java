package com.meilearning.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import com.meilearning.backend.entity.Room;
import com.meilearning.backend.entity.enums.RoomStatus;
import java.util.List;
@Repository
public interface RoomRepository extends JpaRepository<Room, Long>, JpaSpecificationExecutor<Room> {

    List<Room> findByFacilityId(Long facilityId);

    List<Room> findByStatus(RoomStatus status);

    List<Room> findByFacilityIdAndStatus(Long facilityId, RoomStatus status);

    long countByFacilityId(Long facilityId);

    long countByStatus(RoomStatus status);

    @Query("SELECT COALESCE(SUM(r.capacity), 0) FROM Room r")
    long sumTotalCapacity();

    @Query("SELECT COALESCE(SUM(r.capacity), 0) FROM Room r WHERE r.facility.id = :facilityId")
    long sumCapacityByFacilityId(Long facilityId);

    java.util.Optional<Room> findByName(String name);

    boolean existsByNameAndFacilityId(String name, Long facilityId);

    boolean existsByNameAndFacilityIdAndIdNot(String name, Long facilityId, Long id);

}
