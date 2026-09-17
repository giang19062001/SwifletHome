-- Migration V21: Create external traceability tables and add displayActorType to tbl_traceability_forms

-- 1. Thêm cột displayActorType vào tbl_traceability_forms
ALTER TABLE `tbl_traceability_forms`
    ADD COLUMN `displayActorType` ENUM('HOST', 'EXTERNAL', 'BOTH') NOT NULL DEFAULT 'BOTH' AFTER `sortOrder`;

-- 2. Tạo bảng tbl_traceability_batches_external
CREATE TABLE IF NOT EXISTS `tbl_traceability_batches_external` (
    `seq` INT NOT NULL AUTO_INCREMENT,
    `traceabilityId` VARCHAR(100) NOT NULL COMMENT 'Mã đợt truy xuất external duy nhất (VD: 3FAM-VCĐP-USR000071-a1b2c3d4)',
    `userCode` VARCHAR(45) NOT NULL COMMENT 'Mã user',
    `status` ENUM('PROCESSING', 'APPROVED', 'REFUSED') DEFAULT 'PROCESSING',
    `qrUrl` VARCHAR(255) DEFAULT NULL COMMENT 'Đường dẫn QR code đại diện đợt truy xuất',
    `isActive` CHAR(1) DEFAULT 'Y',
    `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` DATETIME DEFAULT NULL,
    `createdId` VARCHAR(45) DEFAULT NULL,
    `updatedId` VARCHAR(45) DEFAULT NULL,
    PRIMARY KEY (`seq`),
    UNIQUE KEY `uq_traceabilityId_ext` (`traceabilityId`),
    KEY `idx_userCode_ext` (`userCode`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Tạo bảng tbl_traceability_submissions_external
CREATE TABLE IF NOT EXISTS `tbl_traceability_submissions_external` (
    `seq` INT NOT NULL AUTO_INCREMENT,
    `batchSeq` INT NOT NULL,
    `traceabilityCode` VARCHAR(45) NOT NULL COMMENT 'Mã (VD: TRE000001)',
    `formSeq` INT NOT NULL COMMENT 'ID của form (tbl_traceability_forms.seq)',
    `userCode` VARCHAR(45) NOT NULL,
    `formData` JSON NOT NULL,
    `uniqueId` VARCHAR(255) NOT NULL,
    `isActive` CHAR(1) DEFAULT 'Y',
    `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` DATETIME DEFAULT NULL,
    `createdId` VARCHAR(45) DEFAULT NULL,
    `updatedId` VARCHAR(45) DEFAULT NULL,
    PRIMARY KEY (`seq`),
    UNIQUE KEY `traceabilityCode_UNIQUE_ext` (`traceabilityCode`),
    UNIQUE KEY `uniqueId_UNIQUE_ext` (`uniqueId`),
    UNIQUE KEY `uq_batch_form_ext` (`batchSeq`, `formSeq`),
    KEY `idx_batchSeq_ext` (`batchSeq`),
    KEY `idx_userCode_ext` (`userCode`),
    KEY `idx_formSeq_ext` (`formSeq`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Tạo bảng tbl_traceability_file_external
CREATE TABLE IF NOT EXISTS `tbl_traceability_file_external` (
    `seq` INT NOT NULL AUTO_INCREMENT,
    `submissionSeq` INT DEFAULT 0 COMMENT 'seq của tbl_traceability_submissions_external (0 = chưa bind)',
    `uniqueId` VARCHAR(255) NOT NULL COMMENT 'UUID của form traceability cha',
    `fieldKey` VARCHAR(100) NOT NULL,
    `fieldType` ENUM ('file_single', 'file_multiple') NOT NULL DEFAULT 'file_single',
    `sortOrder` INT DEFAULT 0,
    `filename` VARCHAR(255) NOT NULL,
    `originalname` TEXT NOT NULL,
    `size` INT NOT NULL,
    `mimetype` VARCHAR(100) NOT NULL,
    `isActive` CHAR(1) DEFAULT 'Y',
    `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` DATETIME DEFAULT NULL,
    `createdId` VARCHAR(45) DEFAULT NULL,
    `updatedId` VARCHAR(45) DEFAULT NULL,
    PRIMARY KEY (`seq`),
    UNIQUE KEY `filename_UNIQUE_ext` (`filename`),
    KEY `idx_uniqueId_ext` (`uniqueId`),
    KEY `idx_uniqueId_fieldKey_ext` (`uniqueId`, `fieldKey`),
    KEY `idx_submissionSeq_ext` (`submissionSeq`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
