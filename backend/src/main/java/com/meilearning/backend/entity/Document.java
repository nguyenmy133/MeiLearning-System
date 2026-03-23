/**
 * Entity: Tài liệu — file đính kèm (giáo trình, bài tập, v.v.) hoặc YouTube link
 */
package com.meilearning.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "documents")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Document extends BaseEntity {

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    /** Đường dẫn file (local storage / S3 URL) hoặc YouTube URL */
    @Column(name = "file_url", nullable = false)
    private String fileUrl;

    /** MIME type hoặc "youtube" cho YouTube links */
    @Column(name = "file_type", length = 100)
    private String fileType;

    /** Kích thước file (bytes), 0 cho YouTube */
    @Column(name = "file_size")
    private Long fileSize;

    /** Các lớp liên quan (ManyToMany) */
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "document_classes",
        joinColumns = @JoinColumn(name = "document_id"),
        inverseJoinColumns = @JoinColumn(name = "class_id")
    )
    @Builder.Default
    private Set<ClassEntity> classes = new HashSet<>();

    /** Người upload */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "uploaded_by", nullable = false)
    private User uploadedBy;
}
