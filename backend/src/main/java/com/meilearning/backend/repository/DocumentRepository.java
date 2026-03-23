package com.meilearning.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.meilearning.backend.entity.Document;
import java.util.List;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Long>, JpaSpecificationExecutor<Document> {

    @Query("SELECT DISTINCT d FROM Document d JOIN d.classes c WHERE c.id = :classId ORDER BY d.createdAt DESC")
    List<Document> findByClassIdOrderByCreatedAtDesc(@Param("classId") Long classId);

    List<Document> findByUploadedByIdOrderByCreatedAtDesc(Long userId);

    List<Document> findAllByOrderByCreatedAtDesc();
}
