-- Migration V28: Add DELETED status to tbl_traceability_batches and tbl_traceability_batches_external

ALTER TABLE `tbl_traceability_batches`
    MODIFY COLUMN `status` ENUM('PROCESSING', 'APPROVED', 'REFUSED', 'DELETED') DEFAULT 'PROCESSING';

ALTER TABLE `tbl_traceability_batches_external`
    MODIFY COLUMN `status` ENUM('PROCESSING', 'APPROVED', 'REFUSED', 'DELETED') DEFAULT 'PROCESSING';
