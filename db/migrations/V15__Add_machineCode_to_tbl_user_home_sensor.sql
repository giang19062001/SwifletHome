-- Migration to add machineCode and make wifiId, wifiPassword optional in tbl_user_home_sensor

ALTER TABLE tbl_user_home_sensor
    ADD COLUMN `machineCode` varchar(100) DEFAULT NULL AFTER `macId`,
    MODIFY COLUMN `wifiId` text DEFAULT NULL,
    MODIFY COLUMN `wifiPassword` varchar(255) DEFAULT NULL;
