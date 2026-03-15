package com.meilearning.backend.service.impl;

import com.meilearning.backend.service.FileStorageService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

/**
 * Local file storage — lưu file vào thư mục `uploads/` trong project root.
 *
 * Production nên thay bằng S3 hoặc cloud storage implementation.
 */
@Slf4j
@Service
public class LocalFileStorageServiceImpl implements FileStorageService {

    private static final String UPLOAD_DIR = "uploads";

    @Override
    public String store(MultipartFile file, String subDir) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File không được để trống");
        }

        try {
            // Tạo thư mục nếu chưa có
            Path uploadPath = Paths.get(UPLOAD_DIR, subDir);
            Files.createDirectories(uploadPath);

            // Tạo tên file unique bằng UUID
            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String uniqueFilename = UUID.randomUUID().toString() + extension;

            // Lưu file
            Path filePath = uploadPath.resolve(uniqueFilename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // Trả về relative URL
            String relativePath = "/" + UPLOAD_DIR + "/" + subDir + "/" + uniqueFilename;
            log.info("File saved: {}", relativePath);
            return relativePath;

        } catch (IOException e) {
            log.error("Failed to store file: {}", e.getMessage());
            throw new RuntimeException("Không thể lưu file: " + e.getMessage(), e);
        }
    }

    @Override
    public void delete(String filePath) {
        if (filePath == null || filePath.isBlank()) return;
        try {
            // Bỏ leading slash
            String cleanPath = filePath.startsWith("/") ? filePath.substring(1) : filePath;
            Path path = Paths.get(cleanPath);
            if (Files.exists(path)) {
                Files.delete(path);
                log.info("File deleted: {}", filePath);
            }
        } catch (IOException e) {
            log.warn("Failed to delete file {}: {}", filePath, e.getMessage());
        }
    }
}
