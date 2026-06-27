ALTER TABLE `tbl_ads_banner` DROP COLUMN `bannerUrl`;
ALTER TABLE `tbl_ads_banner` ADD COLUMN `uniqueId` char(255) DEFAULT NULL;

CREATE TABLE IF NOT EXISTS `tbl_ads_file` (
    `seq` int NOT NULL AUTO_INCREMENT,
    `adsSeq` int DEFAULT 0,
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
