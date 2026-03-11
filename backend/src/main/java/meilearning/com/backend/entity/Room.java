/**
 * Entity: Phòng học — thuộc một Facility.
 */
package meilearning.com.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import meilearning.com.backend.entity.enums.RoomStatus;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "rooms", indexes = {
        @Index(name = "idx_rooms_facility", columnList = "facility_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Room extends BaseEntity {

    @Column(nullable = false, length = 50)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "facility_id", nullable = false)
    private Facility facility;

    @Column(nullable = false)
    private Integer capacity;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private RoomStatus status = RoomStatus.available;

    // ── Relationships ──────────────────────────────────────────────

    @OneToMany(mappedBy = "room")
    @Builder.Default
    private List<ClassEntity> classes = new ArrayList<>();
}
