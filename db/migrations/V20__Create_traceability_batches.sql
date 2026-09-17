-- Migration V20: Create tbl_traceability_batches and refactor tbl_traceability_submissions

-- 1. Tạo bảng quản lý đợt truy xuất nguồn gốc
CREATE TABLE IF NOT EXISTS `tbl_traceability_batches` (
    `seq` INT NOT NULL AUTO_INCREMENT,
    `traceabilityId` VARCHAR(100) NOT NULL COMMENT 'Mã đợt truy xuất nguồn gốc duy nhất (VD: 3FAM-NY-USR000071-HOM000058-1)',
    `userCode` VARCHAR(45) NOT NULL COMMENT 'Mã user',
    `userHomeCode` VARCHAR(45) NOT NULL COMMENT 'Mã nhà yến',
    `status` ENUM('PROCESSING', 'APPROVED', 'REFUSED') DEFAULT 'PROCESSING',
    `qrUrl` VARCHAR(255) DEFAULT NULL COMMENT 'Đường dẫn QR code đại diện đợt truy xuất',
    `harvestPhases` VARCHAR(255) DEFAULT NULL COMMENT 'Các đợt thu hoạch (VD: 2,3,4)',
    `isActive` CHAR(1) DEFAULT 'Y',
    `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` DATETIME DEFAULT NULL,
    `createdId` VARCHAR(45) DEFAULT NULL,
    `updatedId` VARCHAR(45) DEFAULT NULL,
    PRIMARY KEY (`seq`),
    UNIQUE KEY `uq_traceabilityId` (`traceabilityId`),
    KEY `idx_user_home` (`userCode`, `userHomeCode`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Thêm cột batchSeq vào tbl_traceability_submissions
ALTER TABLE `tbl_traceability_submissions`
    ADD COLUMN `batchSeq` INT DEFAULT NULL AFTER `seq`;

-- 3. Data Migration: Gom nhóm bản ghi cũ theo (userCode, userHomeCode, traceabilityId) để chuyển sang tbl_traceability_batches với Option B (đuôi -1)
INSERT INTO `tbl_traceability_batches` (`traceabilityId`, `userCode`, `userHomeCode`, `status`, `qrUrl`, `harvestPhases`, `createdId`)
SELECT 
    CONCAT(traceabilityId, '-1'), 
    userCode, 
    userHomeCode, 
    COALESCE(MAX(status), 'PROCESSING'), 
    CONCAT('uploads/images/traceQrcodes/', traceabilityId, '-1.png'), 
    MAX(harvestPhases), 
    MAX(createdId)
FROM `tbl_traceability_submissions`
WHERE `traceabilityId` IS NOT NULL AND `traceabilityId` != ''
GROUP BY userCode, userHomeCode, traceabilityId;

-- 4. Liên kết các bản ghi cũ trong tbl_traceability_submissions với batchSeq tương ứng
UPDATE `tbl_traceability_submissions` s
JOIN `tbl_traceability_batches` b 
  ON s.userCode = b.userCode 
 AND s.userHomeCode = b.userHomeCode 
 AND b.traceabilityId = CONCAT(s.traceabilityId, '-1')
SET s.batchSeq = b.seq;

-- 5. Đặt batchSeq NOT NULL, drop unique key cũ uq_user_home_form và tạo unique key uq_batch_form
ALTER TABLE `tbl_traceability_submissions`
    MODIFY COLUMN `batchSeq` INT NOT NULL,
    DROP KEY `uq_user_home_form`,
    ADD UNIQUE KEY `uq_batch_form` (`batchSeq`, `formSeq`),
    ADD KEY `idx_batchSeq` (`batchSeq`);

-- 6. Xóa các cột trùng lặp đã di chuyển sang tbl_traceability_batches
ALTER TABLE `tbl_traceability_submissions`
    DROP COLUMN `qrUrl`,
    DROP COLUMN `traceabilityId`,
    DROP COLUMN `harvestPhases`,
    DROP COLUMN `status`;
