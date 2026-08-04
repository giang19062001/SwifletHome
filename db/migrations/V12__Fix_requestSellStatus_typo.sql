ALTER TABLE `tbl_qr_request_selling` MODIFY COLUMN `requestSellStatus` enum('SOLD','PURCHARSER','PURCHASED','DELIVERING','PROCESSING','PACKING','RECALL') DEFAULT 'SOLD';
UPDATE `tbl_qr_request_selling` SET `requestSellStatus` = 'PURCHASED' WHERE `requestSellStatus` = 'PURCHARSER';
ALTER TABLE `tbl_qr_request_selling` MODIFY COLUMN `requestSellStatus` enum('SOLD','PURCHASED','DELIVERING','PROCESSING','PACKING','RECALL') DEFAULT 'SOLD';
