-- Migration to add isIntegateIOT column to tbl_user_home

ALTER TABLE tbl_user_home
    ADD COLUMN `isIntegateIOT` char(1) DEFAULT 'N' AFTER `isIntegateCurrent`;
