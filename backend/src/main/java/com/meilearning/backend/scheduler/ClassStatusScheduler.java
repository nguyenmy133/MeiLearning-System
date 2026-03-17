package com.meilearning.backend.scheduler;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import com.meilearning.backend.entity.ClassEntity;
import com.meilearning.backend.entity.enums.ClassStatus;
import com.meilearning.backend.repository.ClassRepository;
import java.time.LocalDate;
import java.util.List;

/**
 * Scheduler: Tự động chuyển trạng thái lớp học.
 *
 * - upcoming → active: khi startDate <= hôm nay
 *
 * Chạy mỗi ngày lúc 00:05 sáng.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class ClassStatusScheduler {

    private final ClassRepository classRepository;

    @Scheduled(cron = "0 5 0 * * *") // 00:05 mỗi ngày
    @Transactional
    public void activateUpcomingClasses() {
        LocalDate today = LocalDate.now();

        List<ClassEntity> upcomingClasses = classRepository
                .findByStatusAndStartDateLessThanEqual(ClassStatus.upcoming, today);

        if (upcomingClasses.isEmpty()) {
            return;
        }

        for (ClassEntity c : upcomingClasses) {
            c.setStatus(ClassStatus.active);
            classRepository.save(c);
            log.info("Auto-activated class: {} (id={}), startDate={}", c.getName(), c.getId(), c.getStartDate());
        }

        log.info("Auto-activated {} classes", upcomingClasses.size());
    }
}
