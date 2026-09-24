-- Migration V22: Add isLoop column to tbl_traceability_forms_groups and ensure list_readonly fieldType

-- 1. Add isLoop column to tbl_traceability_forms_groups
ALTER TABLE `tbl_traceability_forms_groups`
ADD COLUMN `isLoop` CHAR(1) NOT NULL DEFAULT 'N' COMMENT 'Y: nhóm form lặp lại được nhiều lần (array), N: nhóm form đơn lẻ (object)' AFTER `sortOrder`;

-- 2. Update DIARY_PROCESS to isLoop = 'Y'
UPDATE `tbl_traceability_forms_groups`
SET `isLoop` = 'Y'
WHERE `groupKey` = 'DIARY_PROCESS';

-- 3. Ensure list_readonly in tbl_traceability_forms_fields
ALTER TABLE `tbl_traceability_forms_fields` 
    MODIFY COLUMN `fieldType` ENUM(
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
        'file_multiple',
        'link_download',
        'list_readonly'
    ) NOT NULL;

-- 4. change 'HOST' to 'INTERNAL' in tbl_traceability_forms
ALTER TABLE `tbl_traceability_forms`
MODIFY COLUMN `displayActorType`
ENUM('HOST', 'INTERNAL', 'EXTERNAL', 'BOTH')
NOT NULL
DEFAULT 'BOTH';

UPDATE `tbl_traceability_forms`
SET `displayActorType` = 'INTERNAL'
WHERE `displayActorType` = 'HOST';

ALTER TABLE `tbl_traceability_forms`
MODIFY COLUMN `displayActorType`
ENUM('INTERNAL', 'EXTERNAL', 'BOTH')
NOT NULL
DEFAULT 'BOTH';

-- 5. Add lotcode to tbl_traceability_batches
ALTER TABLE `tbl_traceability_batches`
    ADD COLUMN `lotcode` VARCHAR(100) DEFAULT NULL COMMENT 'Mã lô' AFTER `harvestPhases`;

-- 6. Add lotcode to tbl_traceability_batches_external
ALTER TABLE `tbl_traceability_batches_external`
    ADD COLUMN `lotcode` VARCHAR(100) DEFAULT NULL COMMENT 'Mã lô do người dùng nhập' AFTER `qrUrl`;