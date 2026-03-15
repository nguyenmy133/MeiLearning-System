/**
 * Entity: Tài liệu — file đính kèm (giáo trình, bài tập, v.v.)
 */
package com.meilearning.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
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

    /** Đường dẫn file (local storage hoặc S3 URL) */
    @Column(name = "file_url", nullable = false)
    private String fileUrl;

    /** MIME type */
    @Column(name = "file_type", length = 100)
    private String fileType;

    /** Kích thước file (bytes) */
    @Column(name = "file_size")
    private Long fileSize;

    /** Lớp liên quan (optional) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "class_id")
    private ClassEntity classEntity;

    /** Người upload */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "uploaded_by", nullable = false)
    private User uploadedBy;
}
