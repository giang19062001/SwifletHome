-- ----------------------------------------------------------------------------
-- V16: Remove QR request tables and update isUse column values to 'N'
-- ----------------------------------------------------------------------------

DROP TABLE IF EXISTS `tbl_qr_request_selling_interact`;
DROP TABLE IF EXISTS `tbl_qr_request_selling`;
DROP TABLE IF EXISTS `tbl_qr_request_file`;
DROP TABLE IF EXISTS `tbl_qr_request_blockchain`;
DROP TABLE IF EXISTS `tbl_qr_request`;

-- Update isUse status in related task tables back to 'N'
UPDATE `tbl_todo_task_harvest_phase` SET `isUse` = 'N' WHERE `isUse` = 'Y';
UPDATE `tbl_todo_task_medicine` SET `isUse` = 'N' WHERE `isUse` = 'Y';
