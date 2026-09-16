-- Migration V19: Add harvestPhases column to tbl_traceability_submissions and update uq_user_home_form
ALTER TABLE `tbl_traceability_submissions`
  ADD COLUMN `harvestPhases` VARCHAR(255) DEFAULT NULL COMMENT 'Các đợt thu hoạch (VD: 2,3,4)' AFTER `traceabilityId`;

ALTER TABLE `tbl_traceability_submissions`
  DROP KEY `uq_user_home_form`,
  ADD UNIQUE KEY `uq_user_home_form` (`userCode`, `userHomeCode`, `formSeq`, `harvestPhases`);
