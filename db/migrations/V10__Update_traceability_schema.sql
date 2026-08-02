-- ALTER tbl_traceability_forms to add formDescription
ALTER TABLE tbl_traceability_forms 
    ADD COLUMN formDescription TEXT DEFAULT NULL COMMENT 'Mô tả ngắn gọn về biểu mẫu' AFTER formName;

-- ALTER tbl_traceability_submissions to temporarily support both old and new ENUM values
ALTER TABLE tbl_traceability_submissions 
    MODIFY COLUMN status ENUM('WAITING', 'APPROVED', 'REFUSE', 'CANCEL', 'PROCESSING', 'REFUSED') DEFAULT 'WAITING',
    ADD COLUMN qrUrl VARCHAR(255) DEFAULT NULL COMMENT 'Đường dẫn đến ảnh mã QR code' AFTER uniqueId,
    ADD COLUMN traceabilityId VARCHAR(100) DEFAULT NULL COMMENT 'Mã traceabilityId' AFTER qrUrl;

-- Map existing status values to new status values
UPDATE tbl_traceability_submissions SET status = 'PROCESSING' WHERE status = 'WAITING';
UPDATE tbl_traceability_submissions SET status = 'REFUSED' WHERE status = 'REFUSE';
UPDATE tbl_traceability_submissions SET status = 'REFUSED' WHERE status = 'CANCEL';

-- Finalize ENUM values for status
ALTER TABLE tbl_traceability_submissions 
    MODIFY COLUMN status ENUM('PROCESSING', 'APPROVED', 'REFUSED') DEFAULT 'PROCESSING';
