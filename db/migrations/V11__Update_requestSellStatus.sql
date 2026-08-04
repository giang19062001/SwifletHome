ALTER TABLE `tbl_qr_request_selling` MODIFY COLUMN `requestSellStatus` enum('WAITING','APPROVED','REFUSE','SOLD','PURCHARSER') DEFAULT 'SOLD';
UPDATE `tbl_qr_request_selling` SET `requestSellStatus` = 'SOLD';
ALTER TABLE `tbl_qr_request_selling` MODIFY COLUMN `requestSellStatus` enum('SOLD','PURCHARSER') DEFAULT 'SOLD';
