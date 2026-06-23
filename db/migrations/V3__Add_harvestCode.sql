-- Add harvestCode to tbl_todo_task_harvest_phase
ALTER TABLE `tbl_todo_task_harvest_phase` ADD COLUMN `harvestCode` varchar(45) NULL AFTER `taskStatus`;
UPDATE `tbl_todo_task_harvest_phase` SET `harvestCode` = CONCAT('HAR', LPAD(`seq`, 6, '0'));
ALTER TABLE `tbl_todo_task_harvest_phase` MODIFY COLUMN `harvestCode` varchar(45) NOT NULL;
ALTER TABLE `tbl_todo_task_harvest_phase` ADD UNIQUE KEY `harvestCode_UNIQUE` (`harvestCode`);
