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
        'link_share',
        'list_readonly',
        'list_canwrite'
    ) NOT NULL;
