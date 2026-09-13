 -- 1. Tạo bảng định nghĩa Actor (Người dùng/Bộ phận)
CREATE TABLE
    `tbl_traceability_actor` (
        `seq` int NOT NULL AUTO_INCREMENT,
        `actorCode` varchar(45) UNIQUE NOT NULL,
        `actorKeyWord` varchar(45) UNIQUE NOT NULL,
        `actorName` varchar(45) NOT NULL,
        `isActive` char(1) NOT NULL DEFAULT 'Y',
        `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
        `updatedAt` datetime DEFAULT NULL,
        `createdId` varchar(45) DEFAULT 'SYSTEM',
        `updatedId` varchar(45) DEFAULT NULL,
        PRIMARY KEY (`seq`)
    ) ENGINE = InnoDB;

INSERT INTO `tbl_traceability_actor` (`seq`, `actorCode`, `actorKeyWord`, `actorName`, `isActive`, `createdAt`, `createdId`) VALUES ('1', 'RAT000001', 'HOUSE_OWNER_ACTOR', 'Chủ nhà yến', 'Y', '2026-09-09 01:00:51', 'SYSTEM');
INSERT INTO `tbl_traceability_actor` (`seq`, `actorCode`, `actorKeyWord`, `actorName`, `isActive`, `createdAt`, `createdId`) VALUES ('2', 'RAT000002', 'DELIVERING_ACTOR', 'Bộ phận giao nhận', 'Y', '2026-09-09 01:00:51', 'SYSTEM');
INSERT INTO `tbl_traceability_actor` (`seq`, `actorCode`, `actorKeyWord`, `actorName`, `isActive`, `createdAt`, `createdId`) VALUES ('3', 'RAT000003', 'PROCESSING_ACTOR', 'Bộ phận sơ chế & chế biến', 'Y', '2026-09-09 01:00:51', 'SYSTEM');
INSERT INTO `tbl_traceability_actor` (`seq`, `actorCode`, `actorKeyWord`, `actorName`, `isActive`, `createdAt`, `createdId`) VALUES ('4', 'RAT000004', 'PACKING_ACTOR', 'Bộ phận đóng gói', 'Y', '2026-09-09 01:00:51', 'SYSTEM');
INSERT INTO `tbl_traceability_actor` (`seq`, `actorCode`, `actorKeyWord`, `actorName`, `isActive`, `createdAt`, `createdId`) VALUES ('5', 'RAT000005', 'DISTRIBUTION_ACTOR', 'Bộ phận phân phối/hoàn trả', 'Y', '2026-09-09 01:00:51', 'SYSTEM');


-- 2. Tạo bảng trung gian phân quyền Form - Actor
    CREATE TABLE `tbl_traceability_actor_permissions` (
        `seq` INT NOT NULL AUTO_INCREMENT,
        `formKey` VARCHAR(45) NOT NULL,
        `actorKeyWord` VARCHAR(45) NOT NULL,
        `canRead` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '1: Có quyền xem form, 0: Không',
        `canWrite` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '1: Có quyền nhập/sửa form, 0: Không',
        `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
        `createdId` VARCHAR(45) DEFAULT 'SYSTEM',
        PRIMARY KEY (`seq`),
        UNIQUE KEY `uk_form_actor` (`formKey`, `actorKeyWord`), -- Đảm bảo 1 actor không bị trùng 2 dòng trên 1 form
        KEY `idx_actor_read` (`actorKeyWord`, `canRead`),
        KEY `idx_actor_write` (`actorKeyWord`, `canWrite`)
    ) ENGINE = InnoDB;

    INSERT INTO `tbl_traceability_actor_permissions` (`formKey`, `actorKeyWord`, `canRead`, `canWrite`, `createdId`) VALUES
    -- 1. Tất cả 8 Form (seq từ 1 -> 8) đều phân quyền cho Chủ nhà yến (HOUSE_OWNER_ACTOR)
    ('BRIEF_SWIFT_HOUSE', 'HOUSE_OWNER_ACTOR', 1, 1, 'SYSTEM'),
    ('LOGBOOK_HOUSE', 'HOUSE_OWNER_ACTOR', 1, 1, 'SYSTEM'),
    ('BATCH_HARVEST', 'HOUSE_OWNER_ACTOR', 1, 1, 'SYSTEM'),
    ('BATCH_DELIVERING', 'HOUSE_OWNER_ACTOR', 1, 1, 'SYSTEM'),
    ('PRE_PROCESSING', 'HOUSE_OWNER_ACTOR', 1, 1, 'SYSTEM'),
    ('PACKING_QR', 'HOUSE_OWNER_ACTOR', 1, 1, 'SYSTEM'),
    ('DISTRIBUTE_FEEDBACK_RECALL', 'HOUSE_OWNER_ACTOR', 1, 1, 'SYSTEM'),
    ('ISSUANCE_RECORDS', 'HOUSE_OWNER_ACTOR', 1, 1, 'SYSTEM'),
    
    -- 2. Thêm quyền cho các Bộ phận chuyên trách tương ứng từng Form:
    ('BATCH_DELIVERING', 'DELIVERING_ACTOR', 1, 1, 'SYSTEM'),     -- Form seq=4: Thêm Bộ phận giao nhận
    ('PRE_PROCESSING', 'PROCESSING_ACTOR', 1, 1, 'SYSTEM'),     -- Form seq=5: Thêm Bộ phận sơ chế & chế biến
    ('PACKING_QR', 'PACKING_ACTOR', 1, 1, 'SYSTEM'),        -- Form seq=6: Thêm Bộ phận đóng gói
    ('DISTRIBUTE_FEEDBACK_RECALL', 'DISTRIBUTION_ACTOR', 1, 1, 'SYSTEM');   -- Form seq=7: Thêm Bộ phận phân phối/hoàn trả