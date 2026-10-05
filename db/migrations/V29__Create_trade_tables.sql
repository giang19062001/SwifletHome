-- Migration V29: Create trade tables (tbl_trade, tbl_trade_file, tbl_trade_interact)

-- 1. Table tbl_trade: lưu dữ liệu đăng bán tổ yến
CREATE TABLE IF NOT EXISTS `tbl_trade` (
    `seq` INT NOT NULL AUTO_INCREMENT,
    `userCode` VARCHAR(45) NOT NULL COMMENT 'Mã user đăng bán',
    `sellerName` VARCHAR(255) NOT NULL COMMENT 'Tên người bán',
    `sellerPhone` VARCHAR(20) NOT NULL COMMENT 'Số điện thoại người bán',
    `price` VARCHAR(50) NOT NULL COMMENT 'Đơn giá theo gram (number string)',
    `mass` DECIMAL(10,2) NOT NULL COMMENT 'Khối lượng cần bán (gram)',
    `nestQuantity` INT NOT NULL COMMENT 'Số lượng tổ yến',
    `uniqueId` VARCHAR(255) NOT NULL COMMENT 'UUID liên kết với file ảnh upload',
    `status` ENUM('SELLING', 'SOLD', 'CANCEL') NOT NULL DEFAULT 'SELLING' COMMENT 'Trạng thái đăng bán',
    `isActive` CHAR(1) NOT NULL DEFAULT 'Y',
    `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` DATETIME DEFAULT NULL,
    `createdId` VARCHAR(45) DEFAULT NULL,
    `updatedId` VARCHAR(45) DEFAULT NULL,
    PRIMARY KEY (`seq`),
    KEY `idx_trade_userCode` (`userCode`),
    KEY `idx_trade_uniqueId` (`uniqueId`),
    KEY `idx_trade_status` (`status`),
    KEY `idx_trade_createdAt` (`createdAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Table tbl_trade_file: lưu file upload khi đăng bán tổ yến
CREATE TABLE IF NOT EXISTS `tbl_trade_file` (
    `seq` INT NOT NULL AUTO_INCREMENT,
    `tradeSeq` INT NOT NULL DEFAULT 0 COMMENT 'seq của tbl_trade (0 = chưa bind)',
    `userCode` VARCHAR(45) NOT NULL COMMENT 'Mã user upload',
    `uniqueId` VARCHAR(255) NOT NULL COMMENT 'UUID liên kết với thông tin đăng bán',
    `filename` VARCHAR(255) NOT NULL COMMENT 'Đường dẫn file lưu trữ trên server',
    `originalname` TEXT NOT NULL COMMENT 'Tên gốc của file',
    `size` INT NOT NULL COMMENT 'Dung lượng file (bytes)',
    `mimetype` VARCHAR(45) NOT NULL COMMENT 'Mime type của file',
    `isActive` CHAR(1) NOT NULL DEFAULT 'Y',
    `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` DATETIME DEFAULT NULL,
    `createdId` VARCHAR(45) DEFAULT NULL,
    `updatedId` VARCHAR(45) DEFAULT NULL,
    PRIMARY KEY (`seq`),
    UNIQUE KEY `trade_file_filename_UNIQUE` (`filename`),
    KEY `idx_trade_file_tradeSeq` (`tradeSeq`),
    KEY `idx_trade_file_uniqueId` (`uniqueId`),
    KEY `idx_trade_file_userCode` (`userCode`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Table tbl_trade_interact: lưu tương tác SAVED, SEEN của người dùng
CREATE TABLE IF NOT EXISTS `tbl_trade_interact` (
    `seq` INT NOT NULL AUTO_INCREMENT,
    `tradeSeq` INT NOT NULL COMMENT 'seq của bản ghi tbl_trade',
    `userCode` VARCHAR(45) NOT NULL COMMENT 'Mã user tương tác',
    `type` ENUM('SAVED', 'SEEN') NOT NULL COMMENT 'Loại tương tác (SAVED hoặc SEEN)',
    `isActive` CHAR(1) NOT NULL DEFAULT 'Y',
    `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` DATETIME DEFAULT NULL,
    `createdId` VARCHAR(45) DEFAULT NULL,
    `updatedId` VARCHAR(45) DEFAULT NULL,
    PRIMARY KEY (`seq`),
    UNIQUE KEY `uq_trade_user_type` (`tradeSeq`, `userCode`, `type`),
    KEY `idx_trade_interact_userCode` (`userCode`),
    KEY `idx_trade_interact_tradeSeq` (`tradeSeq`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
