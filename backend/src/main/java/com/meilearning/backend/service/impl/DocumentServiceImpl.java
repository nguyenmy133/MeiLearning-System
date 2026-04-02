package com.meilearning.backend.service.impl;

import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import com.meilearning.backend.dto.response.DocumentResponse;
import com.meilearning.backend.entity.ClassEntity;
import com.meilearning.backend.entity.ClassEnrollment;
import com.meilearning.backend.entity.Document;
import com.meilearning.backend.entity.Student;
import com.meilearning.backend.entity.User;

import com.meilearning.backend.exception.ResourceNotFoundException;
import com.meilearning.backend.repository.ClassEnrollmentRepository;
import com.meilearning.backend.repository.ClassRepository;
import com.meilearning.backend.repository.DocumentRepository;
import com.meilearning.backend.repository.StudentRepository;
import com.meilearning.backend.repository.UserRepository;
import com.meilearning.backend.service.DocumentService;
import com.meilearning.backend.service.FileStorageService;
import com.meilearning.backend.service.NotificationDispatcher;
import com.meilearning.backend.dto.response.PageResponse;
import com.meilearning.backend.util.SpecHelper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class DocumentServiceImpl implements DocumentService {

    private final DocumentRepository documentRepository;
    private final UserRepository userRepository;
    private final ClassRepository classRepository;
    private final FileStorageService fileStorageService;
    private final StudentRepository studentRepository;
    private final ClassEnrollmentRepository enrollmentRepository;
    private final NotificationDispatcher notificationDispatcher;

    // ── Query có phân quyền ──────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public PageResponse<DocumentResponse> getAll(String username, Long classId, int page, int limit) {
        if (page < 1) page = 1;

        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        Pageable pageable = PageRequest.of(page - 1, limit, Sort.by("createdAt").descending());
        Specification<Document> spec = SpecHelper.empty();

        // RBAC: phân quyền theo role
        boolean isAdmin = currentUser.getRole() == User.Role.admin;
        boolean isStudent = currentUser.getRole() == User.Role.student;

        if (!isAdmin && !isStudent) {
            // Teacher: chỉ thấy tài liệu mình upload
            final Long userId = currentUser.getId();
            spec = spec.and((root, q, cb) -> cb.equal(root.get("uploadedBy").get("id"), userId));

            // Teacher + classId filter: thêm JOIN riêng (teacher không có RBAC class filter nên chỉ 1 JOIN)
            if (classId != null) {
                spec = spec.and((root, q, cb) -> {
                    if (q != null) q.distinct(true);
                    Join<Document, ClassEntity> classJoin = root.join("classes", JoinType.INNER);
                    return cb.equal(classJoin.get("id"), classId);
                });
            }
        } else if (isStudent) {
            // Student: thấy tài liệu của các lớp đã đăng ký
            Student student = studentRepository.findByUserUsername(currentUser.getUsername())
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy học viên: " + username));
            List<Long> enrolledClassIds = enrollmentRepository.findByStudentId(student.getId())
                    .stream().map(e -> e.getClassEntity().getId()).toList();
            if (enrolledClassIds.isEmpty()) {
                // Chưa đăng ký lớp nào → trả rỗng
                spec = spec.and((root, q, cb) -> cb.literal(false).isNotNull());
            } else {
                // Dùng 1 JOIN duy nhất cho cả RBAC + classId filter (tránh double JOIN bug)
                spec = spec.and((root, q, cb) -> {
                    if (q != null) q.distinct(true);
                    Join<Document, ClassEntity> classJoin = root.join("classes", JoinType.INNER);
                    if (classId != null) {
                        // Gộp: enrolled class + specific classId → chỉ trả nếu classId nằm trong enrolled
                        return cb.and(
                                classJoin.get("id").in(enrolledClassIds),
                                cb.equal(classJoin.get("id"), classId)
                        );
                    }
                    return classJoin.get("id").in(enrolledClassIds);
                });
            }
        } else {
            // Admin: không filter RBAC → thấy tất cả
            if (classId != null) {
                spec = spec.and((root, q, cb) -> {
                    if (q != null) q.distinct(true);
                    Join<Document, ClassEntity> classJoin = root.join("classes", JoinType.INNER);
                    return cb.equal(classJoin.get("id"), classId);
                });
            }
        }

        Page<Document> result = documentRepository.findAll(spec, pageable);
        return PageResponse.<DocumentResponse>builder()
                .data(result.getContent().stream().map(this::toResponse).toList())
                .total(result.getTotalElements())
                .page(page)
                .limit(limit)
                .totalPages(result.getTotalPages())
                .build();
    }

    // ── Legacy overload (dùng bởi các service khác, không có security context) ──

    @Override
    @Transactional(readOnly = true)
    public List<DocumentResponse> getAll(Long classId) {
        List<Document> docs;
        if (classId != null) {
            docs = documentRepository.findByClassIdOrderByCreatedAtDesc(classId);
        } else {
            docs = documentRepository.findAllByOrderByCreatedAtDesc();
        }
        return docs.stream().map(this::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public DocumentResponse getById(Long id) {
        return toResponse(findById(id));
    }

    // ── Upload file tài liệu ────────────────────────────────────────────────────

    @Override
    public DocumentResponse upload(String username, String title, String description,
                                   List<Long> classIds, MultipartFile file) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy user: " + username));

        Set<ClassEntity> classEntities = resolveClasses(classIds);
        String fileUrl = fileStorageService.store(file, "documents");

        Document document = Document.builder()
                .title(title)
                .description(description)
                .fileUrl(fileUrl)
                .fileType(file.getContentType())
                .fileSize(file.getSize())
                .classes(classEntities)
                .uploadedBy(user)
                .build();

        documentRepository.save(document);

        // Thông báo cho học viên thuộc các lớp được gán
        notifyStudentsAboutNewDocument(document, user.getName());

        return toResponse(document);
    }

    // ── Upload YouTube link ─────────────────────────────────────────────────────

    @Override
    public DocumentResponse uploadYoutubeLink(String username, String title, String description,
                                              List<Long> classIds, String youtubeUrl) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy user: " + username));

        Set<ClassEntity> classEntities = resolveClasses(classIds);

        Document document = Document.builder()
                .title(title)
                .description(description)
                .fileUrl(youtubeUrl)
                .fileType("youtube")
                .fileSize(0L)
                .classes(classEntities)
                .uploadedBy(user)
                .build();

        documentRepository.save(document);

        // Thông báo cho học viên thuộc các lớp được gán
        notifyStudentsAboutNewDocument(document, user.getName());

        return toResponse(document);
    }

    // ── Xóa có kiểm tra ownership ────────────────────────────────────────────────

    @Override
    public void delete(String username, Long id) {
        Document doc = findById(id);
        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        // Kiểm tra ownership: chỉ người upload hoặc admin mới được xóa
        boolean isAdmin = currentUser.getRole() == User.Role.admin;
        boolean isOwner = doc.getUploadedBy() != null
                && doc.getUploadedBy().getId().equals(currentUser.getId());

        if (!isAdmin && !isOwner) {
            throw new AccessDeniedException(
                    "Bạn không có quyền xóa tài liệu này. Chỉ người upload hoặc admin mới được xóa.");
        }

        // Chỉ xóa file vật lý nếu không phải YouTube link
        if (!"youtube".equals(doc.getFileType())) {
            fileStorageService.delete(doc.getFileUrl());
        }
        documentRepository.delete(doc);
    }

    // ── Helpers ──────────────────────────────────────────────────────────────────

    private Document findById(Long id) {
        return documentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tài liệu: " + id));
    }

    /**
     * Resolve danh sách classIds → Set<ClassEntity>.
     * Nếu classIds rỗng hoặc null → trả về Set rỗng.
     */
    private Set<ClassEntity> resolveClasses(List<Long> classIds) {
        if (classIds == null || classIds.isEmpty()) {
            return new HashSet<>();
        }
        List<ClassEntity> found = classRepository.findAllById(classIds);
        if (found.size() != classIds.size()) {
            // Tìm class IDs không tồn tại
            Set<Long> foundIds = found.stream().map(ClassEntity::getId).collect(Collectors.toSet());
            List<Long> missing = classIds.stream().filter(id -> !foundIds.contains(id)).toList();
            throw new ResourceNotFoundException("Không tìm thấy lớp: " + missing);
        }
        return new HashSet<>(found);
    }

    /**
     * Gửi thông báo in-app cho tất cả học viên thuộc các lớp được gán tài liệu.
     * Gom unique students từ tất cả classes để tránh gửi trùng.
     */
    private void notifyStudentsAboutNewDocument(Document document, String teacherName) {
        if (document.getClasses() == null || document.getClasses().isEmpty()) {
            return; // Tài liệu không gán lớp → không thông báo
        }

        boolean isYoutube = "youtube".equals(document.getFileType());
        String docTypeLabel = isYoutube ? "video YouTube" : "tài liệu";

        // Gom tất cả students unique từ các lớp
        Set<User> notifiedUsers = new HashSet<>();
        for (ClassEntity cls : document.getClasses()) {
            List<ClassEnrollment> enrollments = enrollmentRepository.findByClassEntityId(cls.getId());
            for (ClassEnrollment enrollment : enrollments) {
                User studentUser = enrollment.getStudent().getUser();
                if (studentUser != null && notifiedUsers.add(studentUser)) {
                    String title = "📄 " + docTypeLabel + " mới: " + document.getTitle();
                    String classNames = document.getClasses().stream()
                            .map(ClassEntity::getName)
                            .collect(Collectors.joining(", "));
                    String content = String.format(
                            "Giáo viên %s đã tải lên %s \"%s\" cho lớp %s.",
                            teacherName, docTypeLabel, document.getTitle(), classNames
                    );
                    notificationDispatcher.notifyInApp(studentUser, "document", title, content);
                }
            }
        }

        if (!notifiedUsers.isEmpty()) {
            log.info("📢 Đã thông báo {} học viên về tài liệu mới: {}", notifiedUsers.size(), document.getTitle());
        }
    }

    private DocumentResponse toResponse(Document doc) {
        List<DocumentResponse.ClassInfo> classInfos = doc.getClasses() != null
                ? doc.getClasses().stream()
                    .map(c -> DocumentResponse.ClassInfo.builder()
                            .id(c.getId())
                            .name(c.getName())
                            .build())
                    .sorted(Comparator.comparing(DocumentResponse.ClassInfo::getId))
                    .toList()
                : List.of();

        return DocumentResponse.builder()
                .id(doc.getId())
                .title(doc.getTitle())
                .description(doc.getDescription())
                .fileUrl(doc.getFileUrl())
                .fileType(doc.getFileType())
                .fileSize(doc.getFileSize())
                .classes(classInfos)
                .uploadedByName(doc.getUploadedBy() != null ? doc.getUploadedBy().getName() : null)
                .uploadedById(doc.getUploadedBy() != null ? doc.getUploadedBy().getId() : null)
                .createdAt(doc.getCreatedAt() != null ? doc.getCreatedAt().toString() : null)
                .build();
    }
}
