-- Migration V23: Create table tbl_traceability_batches_extra_linked

CREATE TABLE IF NOT EXISTS `tbl_traceability_batches_extra_linked` (
    `seq` INT NOT NULL AUTO_INCREMENT,
    `userCode` VARCHAR(45) NOT NULL COMMENT 'Mã user sở hữu',
    `lotcode` VARCHAR(100) DEFAULT NULL COMMENT 'Mã lô của đợt truy xuất mở rộng này',
    `batchExternalSeq` INT NOT NULL COMMENT 'seq của tbl_traceability_batches_external (luôn luôn có giá trị)',
    `batchInternalSeq` INT DEFAULT NULL COMMENT 'seq của tbl_traceability_batches nội bộ (chỉ có khi lotcode match với lô nội bộ)',
    `formDataExtra` JSON DEFAULT NULL COMMENT 'Dữ liệu cơ sở & thu hoạch do user tự nhập (chỉ lưu khi batchInternalSeq là NULL)',
    `isActive` ENUM('Y', 'N') DEFAULT 'Y',
    `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    `createdId` VARCHAR(45) DEFAULT NULL,
    `updatedId` VARCHAR(45) DEFAULT NULL,
    PRIMARY KEY (`seq`),
    UNIQUE KEY `uq_batchExternalSeq` (`batchExternalSeq`),
    KEY `idx_batchInternalSeq` (`batchInternalSeq`),
    KEY `idx_lotcode` (`lotcode`),
    KEY `idx_userCode` (`userCode`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
