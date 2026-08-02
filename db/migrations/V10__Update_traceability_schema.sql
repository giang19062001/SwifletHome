-- ALTER tbl_traceability_forms to add formDescription
ALTER TABLE tbl_traceability_forms 
    ADD COLUMN formDescription TEXT DEFAULT NULL COMMENT 'Mô tả ngắn gọn về biểu mẫu' AFTER formName;

-- ALTER tbl_traceability_submissions to modify status, add qrUrl and traceabilityId
ALTER TABLE tbl_traceability_submissions 
    MODIFY COLUMN status ENUM('PROCESSING', 'APPROVED', 'REFUSED') DEFAULT 'PROCESSING',
    ADD COLUMN qrUrl VARCHAR(255) DEFAULT NULL COMMENT 'Đường dẫn đến ảnh mã QR code' AFTER uniqueId,
    ADD COLUMN traceabilityId VARCHAR(100) DEFAULT NULL COMMENT 'Mã traceabilityId' AFTER qrUrl;
