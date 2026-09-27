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
        'list_readonly',
        'list_canwrite'
    ) NOT NULL;


INSERT INTO `tbl_traceability_forms` (`formKey`, `formName`, `formDescription`, `sortOrder`, `displayActorType`, `isActive`, `createdId`) VALUES ('PRODUCTION_ORIGIN', 'Nguồn gốc sản xuất', 'Nguồn gốc sản xuất', '4', 'EXTERNAL', 'Y', 'SYSTEM');
UPDATE `tbl_traceability_forms` SET `sortOrder` = '5' WHERE (`seq` = '4');
UPDATE `tbl_traceability_forms` SET `sortOrder` = '6' WHERE (`seq` = '5');
UPDATE `tbl_traceability_forms` SET `sortOrder` = '7' WHERE (`seq` = '6');
UPDATE `tbl_traceability_forms` SET `sortOrder` = '8' WHERE (`seq` = '7');
UPDATE `tbl_traceability_forms` SET `sortOrder` = '9' WHERE (`seq` = '8');
