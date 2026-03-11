package meilearning.com.backend.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import meilearning.com.backend.dto.request.CreateSubjectRequest;
import meilearning.com.backend.dto.request.UpdateSubjectRequest;
import meilearning.com.backend.dto.response.PageResponse;
import meilearning.com.backend.dto.response.SubjectResponse;
import meilearning.com.backend.dto.response.SubjectStatsResponse;
import meilearning.com.backend.entity.Subject;
import meilearning.com.backend.entity.enums.SubjectStatus;
import meilearning.com.backend.exception.DuplicateResourceException;
import meilearning.com.backend.exception.ResourceNotFoundException;
import meilearning.com.backend.mapper.SubjectMapper;
import meilearning.com.backend.repository.SubjectRepository;
import meilearning.com.backend.service.SubjectService;

@Service
@RequiredArgsConstructor
@Transactional
public class SubjectServiceImpl implements SubjectService {

    private final SubjectRepository subjectRepository;
    private final SubjectMapper subjectMapper;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<SubjectResponse> getAll(String search, String category, String status,
                                                 int page, int limit) {
        Pageable pageable = PageRequest.of(page - 1, limit, Sort.by("createdAt").descending());

        Specification<Subject> spec = Specification.where((Specification<Subject>) null);

        if (search != null && !search.isBlank()) {
            String keyword = "%" + search.toLowerCase() + "%";
            spec = spec.and((root, query, cb) ->
                    cb.or(
                            cb.like(cb.lower(root.get("name")), keyword),
                            cb.like(cb.lower(root.get("code")), keyword)
                    ));
        }

        if (category != null && !category.isBlank()) {
            spec = spec.and((root, query, cb) ->
                    cb.equal(root.get("category"), category));
        }

        if (status != null && !status.isBlank() && !"all".equals(status)) {
            SubjectStatus subjectStatus = SubjectStatus.valueOf(status);
            spec = spec.and((root, query, cb) ->
                    cb.equal(root.get("status"), subjectStatus));
        }

        Page<Subject> result = subjectRepository.findAll(spec, pageable);

        return PageResponse.<SubjectResponse>builder()
                .data(result.getContent().stream().map(subjectMapper::toResponse).toList())
                .total(result.getTotalElements())
                .page(page)
                .limit(limit)
                .totalPages(result.getTotalPages())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public SubjectResponse getById(Long id) {
        Subject subject = subjectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy môn học với id: " + id));
        return subjectMapper.toResponse(subject);
    }

    @Override
    public SubjectResponse create(CreateSubjectRequest request) {
        // Validate unique code
        if (subjectRepository.existsByCode(request.getCode())) {
            throw new DuplicateResourceException("Mã môn học '" + request.getCode() + "' đã tồn tại");
        }

        // Validate unique name
        if (subjectRepository.existsByName(request.getName())) {
            throw new DuplicateResourceException("Tên môn học '" + request.getName() + "' đã tồn tại");
        }

        Subject subject = subjectMapper.toEntity(request);
        subject = subjectRepository.save(subject);
        return subjectMapper.toResponse(subject);
    }

    @Override
    public SubjectResponse update(Long id, UpdateSubjectRequest request) {
        Subject subject = subjectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy môn học với id: " + id));

        // Validate unique code (if changing)
        if (request.getCode() != null && !request.getCode().equals(subject.getCode())) {
            if (subjectRepository.existsByCode(request.getCode())) {
                throw new DuplicateResourceException("Mã môn học '" + request.getCode() + "' đã tồn tại");
            }
        }

        // Validate unique name (if changing)
        if (request.getName() != null && !request.getName().equals(subject.getName())) {
            if (subjectRepository.existsByName(request.getName())) {
                throw new DuplicateResourceException("Tên môn học '" + request.getName() + "' đã tồn tại");
            }
        }

        subjectMapper.updateEntity(request, subject);
        subject = subjectRepository.save(subject);
        return subjectMapper.toResponse(subject);
    }

    @Override
    public void delete(Long id) {
        Subject subject = subjectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy môn học với id: " + id));
        subjectRepository.delete(subject);
    }

    @Override
    @Transactional(readOnly = true)
    public SubjectStatsResponse getStats() {
        long total = subjectRepository.count();
        long active = subjectRepository.countByStatus(SubjectStatus.active);
        long inactive = subjectRepository.countByStatus(SubjectStatus.inactive);

        // TODO: Tính totalTeachers và totalClasses khi có data relationships
        return SubjectStatsResponse.builder()
                .total(total)
                .active(active)
                .inactive(inactive)
                .totalTeachers(0)
                .totalClasses(0)
                .build();
    }
}
