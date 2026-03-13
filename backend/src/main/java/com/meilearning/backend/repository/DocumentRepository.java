package com.meilearning.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.meilearning.backend.entity.Document;

import java.util.List;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {

    List<Document> findByClassEntityIdOrderByCreatedAtDesc(Long classId);

    List<Document> findByUploadedByIdOrderByCreatedAtDesc(Long userId);

    List<Document> findAllByOrderByCreatedAtDesc();
}
