/**
 * Entity: MĂ´n há»c.
 */
package com.meilearning.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.OneToMany;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import com.meilearning.backend.entity.enums.SubjectStatus;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "subjects")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Subject extends BaseEntity {

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, unique = true, length = 20)
    private String code;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, length = 50)
    private String category;

    @Column(name = "base_price_per_session", nullable = false)
    @Builder.Default
    private Long basePricePerSession = 0L;

    /** Danh sĂ¡ch tĂªn cÆ¡ sá»Ÿ cĂ³ dáº¡y mĂ´n nĂ y, lÆ°u dáº¡ng JSON: ["CÆ¡ sá»Ÿ Q1", "CÆ¡ sá»Ÿ Q3"] */
    @Column(columnDefinition = "TEXT")
    private String facilitiesJson;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private SubjectStatus status = SubjectStatus.active;

    // â”€â”€ Relationships â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    @OneToMany(mappedBy = "subject")
    @Builder.Default
    private List<ClassEntity> classes = new ArrayList<>();

    @ManyToMany(mappedBy = "subjects")
    @Builder.Default
    private List<Teacher> teachers = new ArrayList<>();
}
