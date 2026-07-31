-- table chứa form 8 mẫu truy xuất nguồn gốc
CREATE TABLE
    tbl_traceability_forms (
        `seq` int NOT NULL AUTO_INCREMENT PRIMARY KEY,
        `formKey` VARCHAR(100) NOT NULL UNIQUE COMMENT 'formKey định danh form, dùng trong /GET API',
        `formName` VARCHAR(255) NOT NULL,
        `sortOrder` INT NOT NULL DEFAULT 0 COMMENT 'Thứ tự hiển thị của các nhóm trong form',
        `isActive` char(1) DEFAULT 'Y',
        `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
        `updatedAt` datetime DEFAULT NULL,
        `createdId` varchar(45) DEFAULT 'SYSTEM',
        `updatedId` varchar(45) DEFAULT NULL,
        UNIQUE KEY `formKey_UNIQUE` (`formKey`)
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- table chứa nhóm của form trong 8 mẫu truy xuất nguồn gốc
CREATE TABLE
    tbl_traceability_forms_groups (
        `seq` int NOT NULL AUTO_INCREMENT PRIMARY KEY,
        `formSeq` int NOT NULL COMMENT 'ID của form chứa group này',
        `groupKey` VARCHAR(100) NOT NULL COMMENT 'Key định danh của group, dùng làm key trong JSON payload nếu cần',
        `groupName` VARCHAR(255) NOT NULL COMMENT 'Tiêu đề của nhóm hiển thị trên UI',
        `sortOrder` INT NOT NULL DEFAULT 0 COMMENT 'Thứ tự hiển thị của các nhóm trong form',
        `isActive` char(1) DEFAULT 'Y',
        `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
        `updatedAt` datetime DEFAULT NULL,
        `createdId` varchar(45) DEFAULT 'SYSTEM',
        `updatedId` varchar(45) DEFAULT NULL,
        UNIQUE KEY uq_form_group_key (formSeq, groupKey)
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- table chứa từng filed của nhóm thuộc form trong 8 mẫu truy xuất nguồn gốc
CREATE TABLE
    tbl_traceability_forms_fields (
        `seq` int NOT NULL AUTO_INCREMENT PRIMARY KEY,
        `formSeq` int NOT NULL,
        `groupSeq` int NOT NULL,
        `fieldKey` VARCHAR(100) NOT NULL COMMENT 'tên field trong payload API',
        `fieldName` VARCHAR(255) NOT NULL,
        `fieldType` ENUM (
            'text',
            'textarea',
            'number',
            'email',
            'phone',
            'date',
            'datetime',
            'select',
            'radio',
            'checkbox',
            'file_single',
            'file_multiple'
        ) NOT NULL,
        `isRequired` char(1) DEFAULT 'N',
        `sortOrder` INT NOT NULL DEFAULT 0,
        `config` JSON NULL,
        `isActive` char(1) DEFAULT 'Y',
        `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
        `updatedAt` datetime DEFAULT NULL,
        `createdId` varchar(45) DEFAULT 'SYSTEM',
        `updatedId` varchar(45) DEFAULT NULL,
        UNIQUE KEY uq_form_group_field_key (formSeq, groupSeq, fieldKey)
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- File đính kèm cho form traceability (hỗ trợ file_single & file_multiple)
-- submissionSeq = 0 nghĩa là file đã upload nhưng form chưa submit (orphan)
-- Khi submit form → UPDATE SET submissionSeq = insertId WHERE uniqueId = ? AND submissionSeq = 0
CREATE TABLE
    IF NOT EXISTS `tbl_traceability_file` (
        `seq` INT NOT NULL AUTO_INCREMENT,
        `submissionSeq` INT DEFAULT 0 COMMENT 'seq của tbl_traceability_submissions (0 = chưa bind)',
        `uniqueId` VARCHAR(255) NOT NULL COMMENT 'UUID của form traceability cha',
        `fieldKey` VARCHAR(100) NOT NULL COMMENT 'fieldKey trong tbl_traceability_forms_fields',
        `fieldType` ENUM ('file_single', 'file_multiple') NOT NULL DEFAULT 'file_single' COMMENT 'Loại field: 1 file hay nhiều file',
        `sortOrder` INT DEFAULT 0 COMMENT 'Thứ tự hiển thị (dùng cho file_multiple)',
        `filename` VARCHAR(255) NOT NULL COMMENT 'Tên file lưu trên server (unique)',
        `originalname` TEXT NOT NULL COMMENT 'Tên file gốc user upload',
        `size` INT NOT NULL COMMENT 'Kích thước file (bytes)',
        `mimetype` VARCHAR(100) NOT NULL COMMENT 'MIME type (image/jpeg, application/pdf, ...)',
        `isActive` CHAR(1) DEFAULT 'Y',
        `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
        `updatedAt` DATETIME DEFAULT NULL,
        `createdId` VARCHAR(45) DEFAULT NULL,
        `updatedId` VARCHAR(45) DEFAULT NULL,
        PRIMARY KEY (`seq`),
        UNIQUE KEY `filename_UNIQUE` (`filename`),
        KEY `idx_uniqueId` (`uniqueId`),
        KEY `idx_uniqueId_fieldKey` (`uniqueId`, `fieldKey`),
        KEY `idx_submissionSeq` (`submissionSeq`)
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- table lưu dữ liệu khi user submit form truy xuất nguồn gốc
-- formData chứa JSON linh hoạt theo từng formKey
-- uniqueId liên kết file đã upload trước đó
CREATE TABLE
    `tbl_traceability_submissions` (
        `seq` INT NOT NULL AUTO_INCREMENT,
        `traceabilityCode` VARCHAR(45) NOT NULL COMMENT 'Mã traceabilityCode (VD: TRC000001)',
        `formSeq` INT NOT NULL COMMENT 'ID của form (tbl_traceability_forms.seq)',
        `userCode` VARCHAR(45) NOT NULL COMMENT 'User submit form',
        `userHomeCode` VARCHAR(45) NOT NULL COMMENT 'Nhà yến liên quan',
        `formData` JSON NOT NULL COMMENT 'Dữ liệu form dạng JSON theo cấu trúc groups/fields',
        `uniqueId` VARCHAR(255) NOT NULL COMMENT 'UUID liên kết file upload',
        `status` ENUM ('WAITING', 'APPROVED', 'REFUSE', 'CANCEL') DEFAULT 'WAITING',
        `isActive` CHAR(1) DEFAULT 'Y',
        `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
        `updatedAt` DATETIME DEFAULT NULL,
        `createdId` VARCHAR(45) DEFAULT NULL,
        `updatedId` VARCHAR(45) DEFAULT NULL,
        PRIMARY KEY (`seq`),
        UNIQUE KEY `traceabilityCode_UNIQUE` (`traceabilityCode`),
        UNIQUE KEY `uniqueId_UNIQUE` (`uniqueId`),
        UNIQUE KEY `uq_user_home_form` (`userCode`, `userHomeCode`, `formSeq`),
        KEY `idx_userCode` (`userCode`),
        KEY `idx_userHomeCode` (`userHomeCode`),
        KEY `idx_formSeq` (`formSeq`)
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;