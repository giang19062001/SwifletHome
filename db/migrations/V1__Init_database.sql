-- ============================================================================
-- Flyway V1 Baseline Migration
-- Database: swiftlet
-- Generated: 2026-06-21
-- Total tables: 67
-- ============================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------------------------------------------------------
-- 1. tbl_answer - câu trả lời
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `tbl_answer` (
    `seq` int NOT NULL AUTO_INCREMENT,
    `answerCode` varchar(45) NOT NULL,
    `answerContent` text NOT NULL,
    `answerObject` char(10) NOT NULL,
    `answerCategory` varchar(45) NOT NULL,
    `isActive` char(1) DEFAULT 'Y',
    `isFree` char(1) DEFAULT 'Y',
    `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` datetime DEFAULT NULL,
    `createdId` varchar(45) DEFAULT 'SYSTEM',
    `updatedId` varchar(45) DEFAULT NULL,
    PRIMARY KEY (`seq`),
    UNIQUE KEY `answerCode_UNIQUE` (`answerCode`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 2. tbl_blacklist_ip - blacklist ip
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `tbl_blacklist_ip` (
    `seq` int NOT NULL AUTO_INCREMENT,
    `ipAddress` varchar(45) NOT NULL,
    `reason` text DEFAULT NULL,
    `isActive` char(1) DEFAULT 'Y',
    `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` datetime DEFAULT NULL,
    `createdId` varchar(45) DEFAULT 'SYSTEM',
    `updatedId` varchar(45) DEFAULT NULL,
    PRIMARY KEY (`seq`),
    UNIQUE KEY `ipAddress_UNIQUE` (`ipAddress`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 3. tbl_blog - bài đọc
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `tbl_blog` (
    `seq` int NOT NULL AUTO_INCREMENT,
    `blogCode` varchar(45) NOT NULL,
    `blogName` varchar(45) NOT NULL,
    `blogObject` char(10) NOT NULL,
    `blogCategory` varchar(45) NOT NULL,
    `blogContent` text NOT NULL,
    `blogScreenCode` char(15) DEFAULT '',
    `isActive` char(1) DEFAULT 'Y',
    `isFree` char(1) DEFAULT 'Y',
    `isMain` varchar(45) DEFAULT 'N',
    `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` datetime DEFAULT NULL,
    `createdId` varchar(45) DEFAULT 'SYSTEM',
    `updatedId` varchar(45) DEFAULT NULL,
    PRIMARY KEY (`seq`),
    UNIQUE KEY `blogCode_UNIQUE` (`blogCode`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 4. tbl_category - thể loại câu hỏi
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `tbl_category` (
    `seq` int NOT NULL AUTO_INCREMENT,
    `categoryCode` varchar(45) NOT NULL,
    `categoryName` varchar(45) NOT NULL,
    `isActive` char(1) DEFAULT 'Y',
    `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` datetime DEFAULT NULL,
    `createdId` varchar(45) DEFAULT 'SYSTEM',
    `updatedId` varchar(45) DEFAULT NULL,
    PRIMARY KEY (`seq`),
    UNIQUE KEY `categoryCode_UNIQUE` (`categoryCode`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 5. tbl_checkout - thanh toán từ Google / Apple
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `tbl_checkout` (
    `seq` int NOT NULL AUTO_INCREMENT,
    `id` varchar(255) DEFAULT NULL,
    `api_version` varchar(50) DEFAULT NULL,
    `app_id` varchar(255) DEFAULT NULL,
    `app_user_id` varchar(50) DEFAULT NULL,
    `country_code` varchar(10) DEFAULT NULL,
    `currency` varchar(10) DEFAULT NULL,
    `discount_amount` decimal(10,2) DEFAULT NULL,
    `discount_identifier` varchar(255) DEFAULT NULL,
    `discount_percentage` decimal(5,2) DEFAULT NULL,
    `entitlement_ids` json DEFAULT NULL,
    `environment` varchar(50) DEFAULT NULL,
    `event_timestamp_ms` bigint DEFAULT NULL,
    `expiration_at_ms` bigint DEFAULT NULL,
    `is_family_share` tinyint(1) DEFAULT NULL,
    `is_trial_conversion` tinyint(1) DEFAULT NULL,
    `offer_code` varchar(255) DEFAULT NULL,
    `period_type` varchar(50) DEFAULT NULL,
    `presented_offering_context` varchar(255) DEFAULT NULL,
    `presented_offering_id` varchar(255) DEFAULT NULL,
    `price` decimal(10,2) DEFAULT NULL,
    `price_in_purchased_currency` decimal(15,2) DEFAULT NULL,
    `product_display_name` varchar(255) DEFAULT NULL,
    `product_id` varchar(255) DEFAULT NULL,
    `purchased_at_ms` bigint DEFAULT NULL,
    `renewal_number` int DEFAULT NULL,
    `store` varchar(50) DEFAULT NULL,
    `takehome_percentage` decimal(5,2) DEFAULT NULL,
    `transaction_id` varchar(255) DEFAULT NULL,
    `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`seq`),
    UNIQUE KEY `id_UNIQUE` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 6. tbl_consignment - ký gửi
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `tbl_consignment` (
    `seq` int NOT NULL AUTO_INCREMENT,
    `consignmentCode` varchar(45) NOT NULL,
    `userCode` varchar(45) NOT NULL,
    `senderName` varchar(45) NOT NULL,
    `senderPhone` varchar(15) NOT NULL,
    `nestType` varchar(45) NOT NULL,
    `nestQuantity` int NOT NULL,
    `deliveryAddress` text NOT NULL,
    `receiverName` varchar(45) NOT NULL,
    `receiverPhone` varchar(15) NOT NULL,
    `consignmentStatus` enum('WAITING','CONFIRMED','DELIVERING','CANCEL','DELIVERED','RETURN') DEFAULT 'WAITING',
    `isActive` char(1) DEFAULT 'Y',
    `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` datetime DEFAULT NULL,
    `createdId` varchar(45) DEFAULT 'SYSTEM',
    `updatedId` varchar(45) DEFAULT NULL,
    PRIMARY KEY (`seq`),
    UNIQUE KEY `consignment_UNIQUE` (`consignmentCode`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 7. tbl_consignment_delivering - quá trình vận chuyển
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `tbl_consignment_delivering` (
    `seq` int NOT NULL AUTO_INCREMENT,
    `consignmentCode` varchar(45) NOT NULL,
    `address` text NOT NULL,
    `isActive` char(1) DEFAULT 'Y',
    `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` datetime DEFAULT NULL,
    `createdId` varchar(45) DEFAULT 'SYSTEM',
    `updatedId` varchar(45) DEFAULT NULL,
    PRIMARY KEY (`seq`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 8. tbl_consignment_history - lịch sử ký gửi
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `tbl_consignment_history` (
    `seq` int NOT NULL AUTO_INCREMENT,
    `consignmentCode` varchar(45) NOT NULL,
    `address` text DEFAULT NULL,
    `consignmentStatus` enum('WAITING','CONFIRMED','DELIVERING','CANCEL','DELIVERED','RETURN') NOT NULL,
    `isActive` char(1) DEFAULT 'Y',
    `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` datetime DEFAULT NULL,
    `createdId` varchar(45) DEFAULT 'SYSTEM',
    `updatedId` varchar(45) DEFAULT NULL,
    PRIMARY KEY (`seq`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 9. tbl_doctor - khám bệnh nhà yến
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `tbl_doctor` (
    `seq` int NOT NULL AUTO_INCREMENT,
    `userCode` varchar(45) NOT NULL,
    `userName` varchar(45) NOT NULL,
    `userPhone` varchar(255) NOT NULL,
    `note` text NOT NULL,
    `noteAnswered` text,
    `status` enum('WAITING','ANSWERED','CANCEL') DEFAULT 'WAITING',
    `uniqueId` char(255) NOT NULL,
    `isActive` char(1) DEFAULT 'Y',
    `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` datetime DEFAULT NULL,
    `createdId` varchar(45) DEFAULT 'SYSTEM',
    `updatedId` varchar(45) DEFAULT NULL,
    PRIMARY KEY (`seq`),
    UNIQUE KEY `uniqueId_UNIQUE` (`uniqueId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 10. tbl_doctor_file
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `tbl_doctor_file` (
    `seq` int NOT NULL AUTO_INCREMENT,
    `doctorSeq` int DEFAULT NULL,
    `userCode` varchar(45) NOT NULL,
    `uniqueId` char(255) NOT NULL,
    `filename` varchar(255) NOT NULL,
    `originalname` text NOT NULL,
    `size` int NOT NULL,
    `mimetype` varchar(45) NOT NULL,
    `isActive` char(1) DEFAULT 'Y',
    `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` datetime DEFAULT NULL,
    `createdId` varchar(45) DEFAULT NULL,
    `updatedId` varchar(45) DEFAULT NULL,
    PRIMARY KEY (`seq`),
    UNIQUE KEY `filename_UNIQUE` (`filename`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 11. tbl_doctor_video
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `tbl_doctor_video` (
    `seq` int NOT NULL AUTO_INCREMENT,
    `name` varchar(255) NULL,
    `address` varchar(255) NOT NULL,
    `videoTitle` varchar(255) NULL,
    `videoUrl` varchar(255) NOT NULL,
    `sortOrder` int NOT NULL DEFAULT 0,
    `isActive` char(1) DEFAULT 'Y',
    `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` datetime DEFAULT NULL,
    `createdId` varchar(45) DEFAULT 'SYSTEM',
    `updatedId` varchar(45) DEFAULT NULL,
    PRIMARY KEY (`seq`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 12. tbl_eater - người ăn yến
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `tbl_eater` (
    `seq` int unsigned NOT NULL AUTO_INCREMENT,
    `eaterCode` varchar(45) NOT NULL,
    `deviceToken` varchar(255) NOT NULL,
    `userTypeKeyWord` varchar(45) NOT NULL,
    `entryTime` datetime DEFAULT CURRENT_TIMESTAMP,
    `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`seq`),
    UNIQUE KEY `deviceToken_UNIQUE` (`deviceToken`),
    UNIQUE KEY `eaterCode_UNIQUE` (`eaterCode`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 13. tbl_guest_consulation - thông tin đăng ký tư vấn
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `tbl_guest_consulation` (
    `seq` int NOT NULL AUTO_INCREMENT,
    `name` varchar(255) NOT NULL,
    `phone` varchar(15) NOT NULL,
    `issueInterest` varchar(500) NOT NULL,
    `issueDescription` text NOT NULL,
    `isReply` char(1) NOT NULL DEFAULT 'N',
    `isActive` char(1) NOT NULL DEFAULT 'Y',
    `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` datetime DEFAULT NULL,
    `createdId` varchar(45) DEFAULT 'SYSTEM',
    `updatedId` varchar(45) DEFAULT NULL,
    PRIMARY KEY (`seq`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 14. tbl_home_sale - nhà yến SCT
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `tbl_home_sale` (
    `seq` int NOT NULL AUTO_INCREMENT,
    `homeCode` varchar(45) NOT NULL,
    `homeName` varchar(255) NOT NULL,
    `homeAddress` text NOT NULL,
    `homeDescription` text NOT NULL,
    `latitude` float NOT NULL,
    `longitude` float NOT NULL,
    `homeImage` varchar(255) NOT NULL,
    `isActive` char(1) DEFAULT 'Y',
    `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` datetime DEFAULT NULL,
    `createdId` varchar(45) DEFAULT 'SYSTEM',
    `updatedId` varchar(45) DEFAULT NULL,
    PRIMARY KEY (`seq`),
    UNIQUE KEY `homeCode_UNIQUE` (`homeCode`),
    UNIQUE KEY `homeImage_UNIQUE` (`homeImage`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 15. tbl_home_sale_img
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `tbl_home_sale_img` (
    `seq` int NOT NULL AUTO_INCREMENT,
    `homeSeq` int NOT NULL,
    `filename` varchar(255) NOT NULL,
    `originalname` text NOT NULL,
    `size` int NOT NULL,
    `mimetype` varchar(45) NOT NULL,
    `isActive` char(1) DEFAULT 'Y',
    `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` datetime DEFAULT NULL,
    `createdId` varchar(45) DEFAULT 'SYSTEM',
    `updatedId` varchar(45) DEFAULT NULL,
    PRIMARY KEY (`seq`),
    UNIQUE KEY `filename_UNIQUE` (`filename`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 16. tbl_home_sale_sightseeing - đăng ký tham quan nhà yến SCT
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `tbl_home_sale_sightseeing` (
    `seq` int NOT NULL AUTO_INCREMENT,
    `homeCode` varchar(45) NOT NULL,
    `userCode` varchar(45) NOT NULL,
    `userName` varchar(45) NOT NULL,
    `userPhone` text NOT NULL,
    `numberAttendCode` char(15) NOT NULL,
    `status` enum('WAITING','APPROVED','CANCEL') DEFAULT 'WAITING',
    `note` text,
    `isActive` char(1) DEFAULT 'Y',
    `cancelReason` text,
    `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` datetime DEFAULT NULL,
    `createdId` varchar(45) DEFAULT 'SYSTEM',
    `updatedId` varchar(45) DEFAULT NULL,
    PRIMARY KEY (`seq`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 17. tbl_info_config - thông tin chuyển khoản, sdt
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `tbl_info_config` (
    `seq` int NOT NULL AUTO_INCREMENT,
    `infoKeyword` enum('BANK','OWNER','VAT') NOT NULL DEFAULT 'BANK',
    `infoName` varchar(45) NOT NULL,
    `infoContent` json NOT NULL,
    `infoDescription` varchar(255) NOT NULL,
    `isActive` char(1) DEFAULT 'Y',
    `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` datetime DEFAULT NULL,
    `createdId` varchar(45) DEFAULT 'SYSTEM',
    `updatedId` varchar(45) DEFAULT NULL,
    PRIMARY KEY (`seq`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 18. tbl_media_audio - audio kỹ thuật
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `tbl_media_audio` (
    `seq` int NOT NULL AUTO_INCREMENT,
    `seqPay` int DEFAULT NULL,
    `filename` varchar(255) NOT NULL,
    `originalname` text NOT NULL,
    `size` int NOT NULL,
    `mimetype` varchar(45) NOT NULL,
    `isActive` char(1) DEFAULT 'Y',
    `isFree` char(1) DEFAULT 'Y',
    `isCoupleFree` char(1) DEFAULT 'Y',
    `badge` enum('NEW','NORMAL') DEFAULT 'NORMAL',
    `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` datetime DEFAULT NULL,
    `createdId` varchar(45) DEFAULT 'SYSTEM',
    `updatedId` varchar(45) DEFAULT NULL,
    PRIMARY KEY (`seq`),
    UNIQUE KEY `filename_UNIQUE` (`filename`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 19. tbl_media_video - video kỹ thuật
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `tbl_media_video` (
    `seq` int NOT NULL AUTO_INCREMENT,
    `originalname` text NULL,
    `urlLink` varchar(255) NOT NULL,
    `isActive` char(1) DEFAULT 'Y',
    `badge` enum('NEW','NORMAL') DEFAULT 'NORMAL',
    `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` datetime DEFAULT NULL,
    `createdId` varchar(45) DEFAULT 'SYSTEM',
    `updatedId` varchar(45) DEFAULT NULL,
    PRIMARY KEY (`seq`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 20. tbl_notification_topics - chủ đề thông báo
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `tbl_notification_topics` (
    `seq` int NOT NULL AUTO_INCREMENT,
    `topicCode` varchar(45) NOT NULL,
    `topicKeyword` char(255) NOT NULL,
    `topicName` varchar(45) NOT NULL,
    `topicDescription` text,
    `isActive` char(1) DEFAULT 'Y',
    `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` datetime DEFAULT NULL,
    `createdId` varchar(45) DEFAULT 'SYSTEM',
    `updatedId` varchar(45) DEFAULT NULL,
    PRIMARY KEY (`seq`),
    UNIQUE KEY `topicCode_UNIQUE` (`topicCode`),
    UNIQUE KEY `topicName_UNIQUE` (`topicName`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 21. tbl_notification_user_topics - đăng ký chủ đề thông báo của user
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `tbl_notification_user_topics` (
    `seq` int NOT NULL AUTO_INCREMENT,
    `userCode` varchar(45) NOT NULL,
    `topicCode` varchar(45) NOT NULL,
    `isActive` char(1) DEFAULT 'Y',
    `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` datetime DEFAULT NULL,
    `createdId` varchar(45) DEFAULT 'SYSTEM',
    `updatedId` varchar(45) DEFAULT NULL,
    PRIMARY KEY (`seq`),
    UNIQUE KEY `uk_user_topic` (`userCode`, `topicCode`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 22. tbl_notifications - thông báo
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `tbl_notifications` (
    `seq` int NOT NULL AUTO_INCREMENT,
    `notificationId` char(36) NOT NULL,
    `messageId` varchar(255) NOT NULL,
    `title` varchar(255) NOT NULL,
    `body` text NOT NULL,
    `data` json DEFAULT NULL,
    `targetScreen` char(255) NOT NULL,
    `notificationType` enum('ADMIN','ADMIN_QR','ADMIN_CONSIGNMENT','TODO') DEFAULT 'ADMIN',
    `notificationMethod` enum('SINGLE','MULTICAST','TOPIC') DEFAULT NULL,
    `userCode` varchar(45) DEFAULT NULL,
    `userCodesMuticast` json DEFAULT NULL,
    `topicCode` varchar(45) DEFAULT NULL,
    `isActive` char(1) NOT NULL DEFAULT 'Y',
    `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` datetime DEFAULT NULL,
    `createdId` varchar(45) DEFAULT 'SYSTEM',
    `updatedId` varchar(45) DEFAULT NULL,
    PRIMARY KEY (`seq`),
    UNIQUE KEY `notificationId_UNIQUE` (`notificationId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 23. tbl_notifications_user - thông báo của user
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `tbl_notifications_user` (
    `seq` int NOT NULL AUTO_INCREMENT,
    `notificationId` char(36) NOT NULL,
    `userCode` varchar(45) DEFAULT NULL,
    `notificationStatus` enum('SENT','READ') DEFAULT 'SENT',
    `isActive` char(1) NOT NULL DEFAULT 'Y',
    `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` datetime DEFAULT NULL,
    `createdId` varchar(45) DEFAULT 'SYSTEM',
    `updatedId` varchar(45) DEFAULT NULL,
    PRIMARY KEY (`seq`),
    UNIQUE KEY `uk_notification_user` (`notificationId`, `userCode`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 24. tbl_object - đối tượng hệ thống
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `tbl_object` (
    `seq` int NOT NULL AUTO_INCREMENT,
    `objectKeyword` enum('SWIFTLET','TEA','COFFEE') NOT NULL DEFAULT 'SWIFTLET',
    `objectName` varchar(45) NOT NULL,
    `isActive` char(1) DEFAULT 'Y',
    `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` datetime DEFAULT NULL,
    `createdId` varchar(45) DEFAULT 'SYSTEM',
    `updatedId` varchar(45) DEFAULT NULL,
    PRIMARY KEY (`seq`),
    UNIQUE KEY `objectCharacter_UNIQUE` (`objectKeyword`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 25. tbl_option_common - mã code dùng chung
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `tbl_option_common` (
    `seq` int NOT NULL AUTO_INCREMENT,
    `code` varchar(15) NOT NULL,
    `mainOption` varchar(45) NOT NULL,
    `subOption` varchar(45) NOT NULL,
    `keyOption` varchar(45) NOT NULL,
    `valueOption` varchar(255) NOT NULL,
    `sortOrder` int DEFAULT 0,
    `isActive` char(1) DEFAULT 'Y',
    `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` datetime DEFAULT NULL,
    `createdId` varchar(45) DEFAULT 'SYSTEM',
    `updatedId` varchar(45) DEFAULT NULL,
    PRIMARY KEY (`seq`),
    UNIQUE KEY `mainOption` (`mainOption`, `subOption`, `keyOption`),
    UNIQUE KEY `code_UNIQUE` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 26. tbl_otp - mã OTP
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `tbl_otp` (
    `seq` int NOT NULL AUTO_INCREMENT,
    `userPhone` varchar(15) NOT NULL,
    `otpCode` varchar(6) NOT NULL,
    `countryCode` char(5) NOT NULL DEFAULT '+84',
    `purpose` enum('REGISTER','FORGOT_PASSWORD') NOT NULL DEFAULT 'REGISTER',
    `attemptCount` int DEFAULT 0,
    `maxAttempts` int DEFAULT 5,
    `expiresAt` datetime NOT NULL,
    `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
    `isUsed` tinyint(1) DEFAULT 0,
    PRIMARY KEY (`seq`),
    KEY `idx_phone_number` (`userPhone`),
    KEY `idx_expires_at` (`expiresAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 27. tbl_package - gói trả phí
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `tbl_package` (
    `seq` int NOT NULL AUTO_INCREMENT,
    `packageCode` varchar(45) NOT NULL,
    `packageName` varchar(45) NOT NULL,
    `packagePrice` decimal(10,3) NOT NULL,
    `packageItemSamePrice` varchar(255) DEFAULT NULL,
    `packageExpireDay` int NOT NULL,
    `packageOptionType` enum('MONEY','ITEM','BOTH') DEFAULT 'MONEY',
    `packageDescription` varchar(255) NOT NULL,
    `isActive` char(1) DEFAULT 'Y',
    `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` datetime DEFAULT NULL,
    `createdId` varchar(45) DEFAULT 'SYSTEM',
    `updatedId` varchar(45) DEFAULT NULL,
    PRIMARY KEY (`seq`),
    UNIQUE KEY `packageCode_UNIQUE` (`packageCode`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 28. tbl_phone_code - mã số điện thoại quốc gia
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `tbl_phone_code` (
    `seq` int NOT NULL AUTO_INCREMENT,
    `countryName` varchar(100) NOT NULL,
    `countryCode` varchar(5) NOT NULL,
    `isoCode` char(2) NOT NULL,
    `languageCode` char(5) NOT NULL,
    PRIMARY KEY (`seq`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 29. tbl_provinces - tỉnh thành VN
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `tbl_provinces` (
    `seq` int NOT NULL AUTO_INCREMENT,
    `provinceCode` char(15) NOT NULL,
    `provinceName` varchar(45) NOT NULL,
    `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`seq`),
    UNIQUE KEY `provinceCode_UNIQUE` (`provinceCode`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 30. tbl_qr_request - yêu cầu QR code
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `tbl_qr_request` (
    `seq` int NOT NULL AUTO_INCREMENT,
    `requestCode` varchar(45) NOT NULL,
    `userCode` varchar(45) NOT NULL,
    `userName` varchar(45) NOT NULL,
    `userHomeCode` varchar(45) NOT NULL,
    `userHomeLength` float DEFAULT 0,
    `userHomeWidth` float DEFAULT 0,
    `userHomeFloor` int DEFAULT 0,
    `userHomeAddress` varchar(45) NOT NULL,
    `temperature` int DEFAULT 0,
    `humidity` int DEFAULT 0,
    `taskMedicineList` json DEFAULT (JSON_ARRAY()),
    `taskHarvestList` json DEFAULT (JSON_ARRAY()),
    `seqHarvestPhase` int NOT NULL,
    `requestStatus` enum('WAITING','APPROVED','REFUSE','CANCEL') DEFAULT 'WAITING',
    `uniqueId` varchar(255) NOT NULL,
    `isActive` char(1) DEFAULT 'Y',
    `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` datetime DEFAULT NULL,
    `createdId` varchar(45) DEFAULT NULL,
    `updatedId` varchar(45) DEFAULT NULL,
    PRIMARY KEY (`seq`),
    UNIQUE KEY `uniqueId_UNIQUE` (`uniqueId`),
    UNIQUE KEY `uq_qr_request_seq_phase` (`seqHarvestPhase`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 31. tbl_qr_request_blockchain - QR blockchain
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `tbl_qr_request_blockchain` (
    `seq` int NOT NULL AUTO_INCREMENT,
    `requestCode` varchar(45) NOT NULL,
    `userCode` varchar(45) NOT NULL,
    `userHomeCode` varchar(45) NOT NULL,
    `qrCodeUrl` varchar(512) NOT NULL,
    `transactionHash` varchar(255) NOT NULL,
    `blockNumber` varchar(255) NOT NULL,
    `transactionFee` varchar(255) NOT NULL,
    `isActive` char(1) DEFAULT 'Y',
    `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` datetime DEFAULT NULL,
    `createdId` varchar(45) DEFAULT NULL,
    `updatedId` varchar(45) DEFAULT NULL,
    PRIMARY KEY (`seq`),
    UNIQUE KEY `requestCode_UNIQUE` (`requestCode`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 32. tbl_qr_request_file - file video của yêu cầu QR
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `tbl_qr_request_file` (
    `seq` int NOT NULL AUTO_INCREMENT,
    `qrRequestSeq` int DEFAULT NULL,
    `userCode` varchar(45) NOT NULL,
    `uniqueId` varchar(255) NOT NULL,
    `filename` varchar(255) NOT NULL,
    `originalname` text NOT NULL,
    `size` int NOT NULL,
    `mimetype` varchar(45) NOT NULL,
    `isActive` char(1) DEFAULT 'Y',
    `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` datetime DEFAULT NULL,
    `createdId` varchar(45) DEFAULT NULL,
    `updatedId` varchar(45) DEFAULT NULL,
    PRIMARY KEY (`seq`),
    UNIQUE KEY `filename_UNIQUE` (`filename`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 33. tbl_qr_request_selling - bán yến từ yêu cầu QR
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `tbl_qr_request_selling` (
    `seq` int NOT NULL AUTO_INCREMENT,
    `requestCode` varchar(45) NOT NULL,
    `userCode` varchar(45) NOT NULL,
    `userName` varchar(45) NOT NULL,
    `userPhone` varchar(15) NOT NULL,
    `priceOptionCode` varchar(15) NOT NULL,
    `priceForPurchaser` decimal(38,3) DEFAULT NULL,
    `priceForEater` decimal(38,3) DEFAULT NULL,
    `priceVatHistory` json DEFAULT NULL,
    `pricePerKg` int NOT NULL DEFAULT 0,
    `volumeForSell` float NOT NULL,
    `nestQuantity` int NOT NULL,
    `humidity` int DEFAULT 0,
    `ingredientNestOptionCode` varchar(15) NOT NULL,
    `requestSellStatus` enum('WAITING','APPROVED','REFUSE') DEFAULT 'WAITING',
    `isActive` char(1) DEFAULT 'Y',
    `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` datetime DEFAULT NULL,
    `createdId` varchar(45) DEFAULT NULL,
    `updatedId` varchar(45) DEFAULT NULL,
    PRIMARY KEY (`seq`),
    UNIQUE KEY `requestCode_UNIQUE` (`requestCode`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 34. tbl_qr_request_selling_interact - tương tác bán tổ yến
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `tbl_qr_request_selling_interact` (
    `seq` int NOT NULL AUTO_INCREMENT,
    `requestCode` varchar(45) NOT NULL,
    `userCode` varchar(45) NOT NULL,
    `isView` char(1) DEFAULT 'Y',
    `isSave` char(1) DEFAULT 'Y',
    `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` datetime DEFAULT NULL,
    `createdId` varchar(45) DEFAULT NULL,
    `updatedId` varchar(45) DEFAULT NULL,
    PRIMARY KEY (`seq`),
    UNIQUE KEY `requestCode_userCode_UNIQUE` (`requestCode`, `userCode`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 35. tbl_question - câu hỏi
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `tbl_question` (
    `seq` int NOT NULL AUTO_INCREMENT,
    `questionCode` varchar(45) NOT NULL,
    `answerCode` varchar(45) DEFAULT NULL,
    `questionObject` char(10) NOT NULL,
    `questionContent` text NOT NULL,
    `questionCategory` varchar(45) NOT NULL,
    `isActive` char(1) DEFAULT 'Y',
    `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` datetime DEFAULT NULL,
    `createdId` varchar(45) DEFAULT 'SYSTEM',
    `updatedId` varchar(45) DEFAULT NULL,
    PRIMARY KEY (`seq`),
    UNIQUE KEY `questionCode_UNIQUE` (`questionCode`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 36. tbl_sale_home - nhà yến SCT v2
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `tbl_sale_home` (
    `seq` int NOT NULL AUTO_INCREMENT,
    `homeCode` varchar(45) NOT NULL,
    `userCode` varchar(45) NOT NULL,
    `hostName` varchar(255) NOT NULL,
    `hostPhone` varchar(45) NOT NULL,
    `socialContact` varchar(255) DEFAULT NULL,
    `hostRole` varchar(45) NOT NULL,
    `homeName` varchar(255) NOT NULL,
    `homelocation` varchar(255) NOT NULL,
    `latitude` float NOT NULL,
    `longitude` float NOT NULL,
    `homeAddress` text NOT NULL,
    `homeAge` int NOT NULL,
    `homeModel` varchar(45) NOT NULL,
    `currentNests` int NOT NULL,
    `averageYieldKg` float NOT NULL,
    `numberOfFloors` int NOT NULL,
    `numberOfRooms` int NOT NULL,
    `shortDescription` text NOT NULL,
    `topicsShare` json NOT NULL,
    `sightseeingAreas` json NOT NULL,
    `includedServices` json NOT NULL,
    `serviceNotes` text DEFAULT NULL,
    `tourFee` varchar(255) NOT NULL,
    `durationPerTourMinutes` int NOT NULL,
    `availableDays` json NOT NULL,
    `timeframes` varchar(255) NOT NULL,
    `timeNoticeRequired` varchar(255) NOT NULL,
    `commitments` json NOT NULL,
    `uniqueId` char(255) NOT NULL,
    `status` enum('WAITING','APPROVED','REFUSE') DEFAULT 'WAITING',
    `isActive` char(1) DEFAULT 'Y',
    `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` datetime DEFAULT NULL,
    `createdId` varchar(45) DEFAULT 'SYSTEM',
    `updatedId` varchar(45) DEFAULT NULL,
    PRIMARY KEY (`seq`),
    UNIQUE KEY `homeCode_UNIQUE` (`homeCode`),
    UNIQUE KEY `uniqueId_UNIQUE` (`uniqueId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 37. tbl_sale_home_file - ảnh/video nhà yến SCT v2
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `tbl_sale_home_file` (
    `seq` int NOT NULL AUTO_INCREMENT,
    `homeSeq` int DEFAULT 0,
    `uniqueId` char(255) NOT NULL,
    `fileTypeCode` varchar(45) DEFAULT NULL,
    `filename` varchar(255) NOT NULL,
    `originalname` text NOT NULL,
    `size` int NOT NULL,
    `mimetype` varchar(45) NOT NULL,
    `isActive` char(1) DEFAULT 'Y',
    `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` datetime DEFAULT NULL,
    `createdId` varchar(45) DEFAULT 'SYSTEM',
    `updatedId` varchar(45) DEFAULT NULL,
    PRIMARY KEY (`seq`),
    UNIQUE KEY `filename_UNIQUE` (`filename`),
    KEY `idx_uniqueId` (`uniqueId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 38. tbl_sale_home_file_type - loại video/ảnh nhà yến SCT v2
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `tbl_sale_home_file_type` (
    `seq` int unsigned NOT NULL AUTO_INCREMENT,
    `fileTypeCode` varchar(45) NOT NULL,
    `fileTypeText` varchar(255) NOT NULL,
    `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`seq`),
    UNIQUE KEY `uk_fileTypeCode` (`fileTypeCode`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 39. tbl_screen_config - nội dung màn hình
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `tbl_screen_config` (
    `seq` int NOT NULL AUTO_INCREMENT,
    `screenKeyword` enum('SIGNUP_SERVICE','REQUEST_DOCTOR','REQUEST_QR_GUIDE','CONSIGNMENT_GUIDE','USER_TYPE_NOT_REGISTER') NOT NULL DEFAULT 'SIGNUP_SERVICE',
    `screenName` varchar(255) NOT NULL,
    `screenDescription` varchar(255) NOT NULL,
    `contentStart` text NULL,
    `contentCenter` json NULL,
    `contentEnd` text NULL,
    `screenTeamplateKeyword` varchar(255) NOT NULL,
    `screenSupportContent` json NULL,
    `isActive` char(1) DEFAULT 'Y',
    `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` datetime DEFAULT NULL,
    `createdId` varchar(45) DEFAULT 'SYSTEM',
    `updatedId` varchar(45) DEFAULT NULL,
    PRIMARY KEY (`seq`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 40. tbl_screen_template
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `tbl_screen_template` (
    `seq` int NOT NULL AUTO_INCREMENT,
    `screenTeamplateKeyword` enum('HTML_TEXT','BANNER_VIDEOS_TEXT') NOT NULL DEFAULT 'HTML_TEXT',
    `screenTeamplateDescription` varchar(255) NOT NULL,
    `isActive` char(1) DEFAULT 'Y',
    `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` datetime DEFAULT NULL,
    `createdId` varchar(45) DEFAULT 'SYSTEM',
    `updatedId` varchar(45) DEFAULT NULL,
    PRIMARY KEY (`seq`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 41. tbl_share - link chia sẻ
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `tbl_share` (
    `seq` int NOT NULL AUTO_INCREMENT,
    `shareToken` varchar(255) NOT NULL,
    `seqShare` int NOT NULL,
    `shareType` varchar(45) NOT NULL,
    `isActive` char(1) DEFAULT 'Y',
    `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`seq`),
    UNIQUE KEY `shareToken_UNIQUE` (`shareToken`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 42. tbl_team_file_type - loại ảnh/video phụ
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `tbl_team_file_type` (
    `seq` int unsigned NOT NULL AUTO_INCREMENT,
    `fileTypeCode` varchar(45) NOT NULL,
    `userTypeCode` varchar(45) NOT NULL,
    `fileTypeText` varchar(255) NOT NULL,
    `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`seq`),
    UNIQUE KEY `uk_fileTypeCode` (`fileTypeCode`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 43. tbl_team_img - ảnh/video phụ của đội sơ chế và kỹ thuật
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `tbl_team_img` (
    `seq` int NOT NULL AUTO_INCREMENT,
    `teamSeq` int NOT NULL,
    `uniqueId` varchar(255) DEFAULT NULL,
    `fileTypeCode` varchar(45) DEFAULT NULL,
    `filename` varchar(255) NOT NULL,
    `originalname` text NOT NULL,
    `size` int NOT NULL,
    `mimetype` varchar(45) NOT NULL,
    `isActive` char(1) DEFAULT 'Y',
    `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` datetime DEFAULT NULL,
    `createdId` varchar(45) DEFAULT 'SYSTEM',
    `updatedId` varchar(45) DEFAULT NULL,
    PRIMARY KEY (`seq`),
    UNIQUE KEY `filename_UNIQUE` (`filename`),
    KEY `idx_uniqueId` (`uniqueId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 44. tbl_team_review - đánh giá đội sơ chế và kỹ thuật
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `tbl_team_review` (
    `seq` int NOT NULL AUTO_INCREMENT,
    `teamCode` varchar(45) NOT NULL,
    `review` text NOT NULL,
    `star` int NOT NULL DEFAULT 0,
    `reviewBy` varchar(45) NOT NULL,
    `uniqueId` char(255) NOT NULL,
    `isDisplay` char(1) NULL DEFAULT 'N',
    `isActive` char(1) DEFAULT 'Y',
    `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` datetime DEFAULT NULL,
    `createdId` varchar(45) DEFAULT 'SYSTEM',
    `updatedId` varchar(45) DEFAULT NULL,
    PRIMARY KEY (`seq`),
    UNIQUE KEY `uniqueId_UNIQUE` (`uniqueId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 45. tbl_team_review_img - ảnh đánh giá
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `tbl_team_review_img` (
    `seq` int NOT NULL AUTO_INCREMENT,
    `reviewSeq` int NOT NULL,
    `teamCode` varchar(45) NOT NULL,
    `uniqueId` char(255) NOT NULL,
    `filename` varchar(255) NOT NULL,
    `originalname` text NOT NULL,
    `size` int NOT NULL,
    `mimetype` varchar(45) NOT NULL,
    `isActive` char(1) DEFAULT 'Y',
    `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` datetime DEFAULT NULL,
    `createdId` varchar(45) DEFAULT 'SYSTEM',
    `updatedId` varchar(45) DEFAULT NULL,
    PRIMARY KEY (`seq`),
    UNIQUE KEY `filename_UNIQUE` (`filename`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 46. tbl_team_service - dịch vụ đã đăng ký của nhóm
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `tbl_team_service` (
    `seq` int NOT NULL AUTO_INCREMENT,
    `seqTeam` int NOT NULL,
    `userTypeCode` varchar(45) NOT NULL,
    `serviceTypeCode` varchar(45) NOT NULL,
    `serviceTextInput` text CHARACTER SET utf8mb4,
    `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
    `uniqueId` varchar(255) DEFAULT NULL,
    PRIMARY KEY (`seq`),
    KEY `idx_uniqueId` (`uniqueId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 47. tbl_team_service_file - ảnh/video dịch vụ
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `tbl_team_service_file` (
    `seq` int NOT NULL AUTO_INCREMENT,
    `seqService` int NOT NULL,
    `uniqueId` varchar(255) DEFAULT NULL,
    `filename` varchar(255) NOT NULL,
    `originalname` text NOT NULL,
    `size` int NOT NULL,
    `mimetype` varchar(45) NOT NULL,
    `isActive` char(1) DEFAULT 'Y',
    `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` datetime DEFAULT NULL,
    `createdId` varchar(45) DEFAULT 'SYSTEM',
    `updatedId` varchar(45) DEFAULT NULL,
    PRIMARY KEY (`seq`),
    UNIQUE KEY `filename_UNIQUE` (`filename`),
    KEY `idx_uniqueId` (`uniqueId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 48. tbl_team_service_type - dịch vụ có sẵn
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `tbl_team_service_type` (
    `seq` int NOT NULL AUTO_INCREMENT,
    `userTypeCode` varchar(45) NOT NULL,
    `serviceTypeCode` varchar(45) NOT NULL,
    `serviceTypeName` varchar(255) NOT NULL,
    `sortOrder` int DEFAULT 0,
    `isActive` char(1) DEFAULT 'Y',
    `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    `createdId` varchar(45) DEFAULT 'SYSTEM',
    `updatedId` varchar(45) DEFAULT NULL,
    PRIMARY KEY (`seq`),
    UNIQUE KEY `serviceTypeCode_UNIQUE` (`serviceTypeCode`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 49. tbl_team_user - user team đội sơ chế và kỹ thuật
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `tbl_team_user` (
    `seq` int NOT NULL AUTO_INCREMENT,
    `userCode` varchar(45) NOT NULL,
    `userTypeCode` varchar(45) NOT NULL,
    `teamCode` varchar(45) NOT NULL,
    `teamName` varchar(45) NOT NULL,
    `teamUserName` varchar(45) DEFAULT NULL,
    `teamPhone` varchar(45) DEFAULT NULL,
    `teamAddress` text CHARACTER SET utf8mb4 NOT NULL,
    `teamImage` varchar(255) NOT NULL,
    `teamDescription` text NOT NULL,
    `teamDescriptionSpecial` json DEFAULT NULL,
    `status` enum('APPROVE','REFUSE','WAITING') DEFAULT 'WAITING',
    `isSeleted` char(1) DEFAULT 'N',
    `provinceCodes` json NOT NULL,
    `isActive` char(1) NOT NULL DEFAULT 'Y',
    `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` datetime DEFAULT NULL,
    `createdId` varchar(45) DEFAULT 'SYSTEM',
    `updatedId` varchar(45) DEFAULT NULL,
    `uniqueId` varchar(255) DEFAULT NULL,
    PRIMARY KEY (`seq`),
    UNIQUE KEY `teamCode` (`teamCode`),
    KEY `idx_uniqueId` (`uniqueId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 50. tbl_todo_box_tasks - thiết lập hộp thoại nhiệm vụ
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `tbl_todo_box_tasks` (
    `seq` int NOT NULL AUTO_INCREMENT,
    `taskCode` varchar(45) NOT NULL,
    `sortOrder` int DEFAULT 0,
    `isActive` char(1) NOT NULL DEFAULT 'Y',
    `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` datetime DEFAULT NULL,
    `createdId` varchar(45) DEFAULT 'SYSTEM',
    `updatedId` varchar(45) DEFAULT NULL,
    PRIMARY KEY (`seq`),
    UNIQUE KEY `taskCode_UNIQUE` (`taskCode`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 51. tbl_todo_task_alarm - lịch nhắc nhiệm vụ
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `tbl_todo_task_alarm` (
    `seq` int NOT NULL AUTO_INCREMENT,
    `taskAlarmCode` varchar(45) NOT NULL,
    `taskName` varchar(45) NOT NULL,
    `taskDate` date NOT NULL,
    `taskStatus` enum('WAITING','COMPLETE','CANCEL','SKIP','COMPLETE_SOON') DEFAULT 'WAITING',
    `userCode` varchar(45) NOT NULL,
    `userHomeCode` varchar(45) NOT NULL,
    `taskNote` varchar(255) DEFAULT '',
    `isActive` char(1) NOT NULL DEFAULT 'Y',
    `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` datetime DEFAULT NULL,
    `createdId` varchar(45) DEFAULT 'SYSTEM',
    `updatedId` varchar(45) DEFAULT NULL,
    PRIMARY KEY (`seq`),
    UNIQUE KEY `taskAlarmCode_UNIQUE` (`taskAlarmCode`),
    KEY `idx_taskDate` (`taskDate`),
    KEY `idx_userCode` (`userCode`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 52. tbl_todo_task_harvest - nhiệm vụ thu hoạch
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `tbl_todo_task_harvest` (
    `seq` int NOT NULL AUTO_INCREMENT,
    `seqHarvestPhase` int NOT NULL DEFAULT 0,
    `userCode` varchar(45) NOT NULL,
    `userHomeCode` varchar(45) NOT NULL,
    `floor` int NOT NULL DEFAULT 0,
    `cell` int NOT NULL DEFAULT 0,
    `cellCollected` int NOT NULL DEFAULT 0,
    `cellRemain` int NOT NULL DEFAULT 0,
    `isActive` char(1) NOT NULL DEFAULT 'Y',
    `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` datetime DEFAULT NULL,
    `createdId` varchar(45) DEFAULT 'SYSTEM',
    `updatedId` varchar(45) DEFAULT NULL,
    PRIMARY KEY (`seq`),
    KEY `idx_seqHarvestPhase` (`seqHarvestPhase`),
    KEY `idx_userHomeCode` (`userHomeCode`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 53. tbl_todo_task_harvest_phase - giai đoạn thu hoạch
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `tbl_todo_task_harvest_phase` (
    `seq` int NOT NULL AUTO_INCREMENT,
    `userCode` varchar(45) NOT NULL,
    `taskDate` date DEFAULT NULL,
    `taskStatus` enum('WAITING','COMPLETE','CANCEL') NOT NULL DEFAULT 'WAITING',
    `userHomeCode` varchar(45) NOT NULL,
    `harvestPhase` int DEFAULT 0,
    `harvestYear` int NOT NULL,
    `isUse` enum('Y','N') DEFAULT 'N',
    `isActive` char(1) NOT NULL DEFAULT 'Y',
    `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` datetime DEFAULT NULL,
    `createdId` varchar(45) DEFAULT 'SYSTEM',
    `updatedId` varchar(45) DEFAULT NULL,
    PRIMARY KEY (`seq`),
    KEY `idx_taskDate` (`taskDate`),
    KEY `idx_userHomeCode` (`userHomeCode`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 54. tbl_todo_task_medicine - nhiệm vụ lăn thuốc
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `tbl_todo_task_medicine` (
    `seq` int NOT NULL AUTO_INCREMENT,
    `taskDate` date DEFAULT NULL,
    `taskStatus` enum('WAITING','COMPLETE','CANCEL') NOT NULL DEFAULT 'WAITING',
    `medicineCode` varchar(45) NOT NULL,
    `userCode` varchar(45) NOT NULL,
    `userHomeCode` varchar(45) NOT NULL,
    `medicineOptionCode` varchar(15) NOT NULL,
    `medicineUsage` varchar(45) NOT NULL,
    `medicineOther` varchar(255) NOT NULL,
    `isUse` char(1) NOT NULL DEFAULT 'N',
    `isActive` char(1) NOT NULL DEFAULT 'Y',
    `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` datetime DEFAULT NULL,
    `createdId` varchar(45) DEFAULT 'SYSTEM',
    `updatedId` varchar(45) DEFAULT NULL,
    PRIMARY KEY (`seq`),
    UNIQUE KEY `medicineCode_UNIQUE` (`medicineCode`),
    KEY `idx_taskDate` (`taskDate`),
    KEY `idx_userCode` (`userCode`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 55. tbl_todo_tasks - các nhiệm vụ
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `tbl_todo_tasks` (
    `seq` int NOT NULL AUTO_INCREMENT,
    `taskCode` varchar(45) NOT NULL,
    `taskKeyword` varchar(255) NOT NULL,
    `taskName` varchar(255) NOT NULL,
    `isActive` char(1) DEFAULT 'Y',
    `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` datetime DEFAULT NULL,
    `createdId` varchar(45) DEFAULT 'SYSTEM',
    `updatedId` varchar(45) DEFAULT NULL,
    PRIMARY KEY (`seq`),
    UNIQUE KEY `taskCode_UNIQUE` (`taskCode`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 56. tbl_uploads_audio
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `tbl_uploads_audio` (
    `seq` int NOT NULL AUTO_INCREMENT,
    `seqPay` int DEFAULT NULL,
    `filename` varchar(255) NOT NULL,
    `originalname` text NOT NULL,
    `size` int NOT NULL,
    `mimetype` varchar(45) NOT NULL,
    `isActive` char(1) DEFAULT 'Y',
    `isFree` char(1) DEFAULT 'Y',
    `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` datetime DEFAULT NULL,
    `createdId` varchar(45) DEFAULT 'SYSTEM',
    `updatedId` varchar(45) DEFAULT NULL,
    PRIMARY KEY (`seq`),
    UNIQUE KEY `filename_UNIQUE` (`filename`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 57. tbl_uploads_image
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `tbl_uploads_image` (
    `seq` int NOT NULL AUTO_INCREMENT,
    `filename` varchar(255) NOT NULL,
    `originalname` text NOT NULL,
    `size` int NOT NULL,
    `mimetype` varchar(45) NOT NULL,
    `isActive` char(1) DEFAULT 'Y',
    `isFree` char(1) DEFAULT 'Y',
    `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` datetime DEFAULT NULL,
    `createdId` varchar(45) DEFAULT 'SYSTEM',
    `updatedId` varchar(45) DEFAULT NULL,
    PRIMARY KEY (`seq`),
    UNIQUE KEY `filename_UNIQUE` (`filename`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 58. tbl_uploads_video
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `tbl_uploads_video` (
    `seq` int NOT NULL AUTO_INCREMENT,
    `originalname` text NULL,
    `urlLink` varchar(255) NOT NULL,
    `isActive` char(1) DEFAULT 'Y',
    `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` datetime DEFAULT NULL,
    `createdId` varchar(45) DEFAULT 'SYSTEM',
    `updatedId` varchar(45) DEFAULT NULL,
    PRIMARY KEY (`seq`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 59. tbl_user_admin - tài khoản admin
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `tbl_user_admin` (
    `seq` int NOT NULL AUTO_INCREMENT,
    `userId` varchar(45) NOT NULL,
    `userName` varchar(45) NOT NULL,
    `userPassword` varchar(255) NOT NULL,
    `isActive` char(1) DEFAULT 'Y',
    `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` datetime DEFAULT NULL,
    PRIMARY KEY (`seq`),
    UNIQUE KEY `userId_UNIQUE` (`userId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 60. tbl_user_app - user app
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `tbl_user_app` (
    `seq` int NOT NULL AUTO_INCREMENT,
    `userCode` varchar(45) NOT NULL,
    `userName` varchar(45) NOT NULL,
    `userPassword` varchar(255) NOT NULL,
    `userPhone` varchar(15) NOT NULL,
    `userTypeCode` varchar(45) NOT NULL DEFAULT 'UST000001',
    `countryCode` char(5) NOT NULL DEFAULT '+84',
    `deviceToken` text NOT NULL,
    `isActive` char(1) DEFAULT 'Y',
    `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` datetime DEFAULT NULL,
    `createdId` varchar(45) DEFAULT 'SYSTEM',
    `updatedId` varchar(45) DEFAULT NULL,
    PRIMARY KEY (`seq`),
    UNIQUE KEY `userPhone_UNIQUE` (`userPhone`),
    UNIQUE KEY `userCode_UNIQUE` (`userCode`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 61. tbl_user_app_delete - user bị xóa tài khoản vĩnh viễn
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `tbl_user_app_delete` (
    `seq` int NOT NULL AUTO_INCREMENT,
    `userCode` varchar(45) NOT NULL,
    `userName` varchar(45) NOT NULL,
    `userPassword` varchar(255) NOT NULL,
    `userPhone` varchar(15) NOT NULL,
    `countryCode` char(5) NOT NULL,
    `deviceToken` text NOT NULL,
    PRIMARY KEY (`seq`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 62. tbl_user_home - nhà yến của user
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `tbl_user_home` (
    `seq` int NOT NULL AUTO_INCREMENT,
    `userHomeCode` varchar(45) NOT NULL,
    `userCode` varchar(45) NOT NULL,
    `userHomeName` varchar(255) NOT NULL,
    `userHomeAddress` text NOT NULL,
    `userHomeProvince` char(15) NOT NULL,
    `userHomeDescription` text,
    `userHomeImage` varchar(255) NOT NULL,
    `userHomeLength` float DEFAULT 0,
    `userHomeWidth` float DEFAULT 0,
    `userHomeFloor` int DEFAULT 0,
    `uniqueId` char(255) NOT NULL,
    `isIntegateTempHum` char(1) DEFAULT 'N',
    `isIntegateCurrent` char(1) DEFAULT 'N',
    `isTriggered` char(1) DEFAULT 'N',
    `isMain` char(1) DEFAULT 'N',
    `isActive` char(1) DEFAULT 'Y',
    `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` datetime DEFAULT NULL,
    `createdId` varchar(45) DEFAULT 'SYSTEM',
    `updatedId` varchar(45) DEFAULT NULL,
    PRIMARY KEY (`seq`),
    UNIQUE KEY `uniqueId_UNIQUE` (`uniqueId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 63. tbl_user_home_img - ảnh nhà yến của khách hàng
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `tbl_user_home_img` (
    `seq` int NOT NULL AUTO_INCREMENT,
    `userHomeSeq` int DEFAULT NULL,
    `userCode` varchar(45) NOT NULL,
    `uniqueId` char(255) NOT NULL,
    `filename` varchar(255) NOT NULL,
    `originalname` text NOT NULL,
    `size` int NOT NULL,
    `mimetype` varchar(45) NOT NULL,
    `isActive` char(1) DEFAULT 'Y',
    `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` datetime DEFAULT NULL,
    `createdId` varchar(45) DEFAULT NULL,
    `updatedId` varchar(45) DEFAULT NULL,
    PRIMARY KEY (`seq`),
    UNIQUE KEY `filename_UNIQUE` (`filename`),
    UNIQUE KEY `uniqueId_UNIQUE` (`uniqueId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 64. tbl_user_home_sensor - IOT cảm biến
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `tbl_user_home_sensor` (
    `seq` int NOT NULL AUTO_INCREMENT,
    `userHomeCode` varchar(45) NOT NULL,
    `userCode` varchar(45) NOT NULL,
    `macId` varchar(255) NOT NULL,
    `wifiId` text NOT NULL,
    `wifiPassword` char(15) NOT NULL,
    `isActive` char(1) DEFAULT 'Y',
    `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` datetime DEFAULT NULL,
    `createdId` varchar(45) DEFAULT 'SYSTEM',
    `updatedId` varchar(45) DEFAULT NULL,
    PRIMARY KEY (`seq`),
    UNIQUE KEY `macId_UNIQUE` (`macId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 65. tbl_user_package - gói đăng ký của user
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `tbl_user_package` (
    `seq` int NOT NULL AUTO_INCREMENT,
    `userCode` varchar(45) NOT NULL,
    `packageCode` varchar(45) DEFAULT NULL,
    `startDate` datetime DEFAULT NULL,
    `endDate` datetime DEFAULT NULL,
    `checkout_seq` int DEFAULT NULL,
    `isActive` char(1) NOT NULL DEFAULT 'Y',
    `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` datetime DEFAULT NULL,
    `createdId` varchar(45) DEFAULT 'SYSTEM',
    `updatedId` varchar(45) DEFAULT NULL,
    PRIMARY KEY (`seq`),
    UNIQUE KEY `userCode_UNIQUE` (`userCode`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 66. tbl_user_package_history - lịch sử gói đăng ký
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `tbl_user_package_history` (
    `seq` int NOT NULL AUTO_INCREMENT,
    `userCode` varchar(45) NOT NULL,
    `packageCode` varchar(45) DEFAULT NULL,
    `startDate` datetime DEFAULT NULL,
    `endDate` datetime DEFAULT NULL,
    `checkout_seq` int DEFAULT NULL,
    `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
    `createdId` varchar(45) DEFAULT 'SYSTEM',
    PRIMARY KEY (`seq`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 67. tbl_user_type - loại tài khoản người dùng
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `tbl_user_type` (
    `seq` int NOT NULL AUTO_INCREMENT,
    `userTypeCode` varchar(45) NOT NULL,
    `userTypeKeyWord` varchar(45) NOT NULL,
    `userTypeName` varchar(45) NOT NULL,
    `isActive` char(1) NOT NULL DEFAULT 'Y',
    `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` datetime DEFAULT NULL,
    `createdId` varchar(45) DEFAULT 'SYSTEM',
    `updatedId` varchar(45) DEFAULT NULL,
    PRIMARY KEY (`seq`),
    UNIQUE KEY `userTypeCode_UNIQUE` (`userTypeCode`),
    UNIQUE KEY `userTypeKeyWord_UNIQUE` (`userTypeKeyWord`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 68. tbl_user_type_live - loại người dùng đang active
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `tbl_user_type_live` (
    `userCode` varchar(45) NOT NULL,
    `userTypeCode` varchar(45) NOT NULL,
    `updatedAt` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`userCode`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
