DELIMITER $$
CREATE PROCEDURE convert_collat_all_tables()
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE t VARCHAR(255);

    DECLARE cur CURSOR FOR 
        SELECT TABLE_NAME 
        FROM information_schema.TABLES 
        WHERE TABLE_SCHEMA = 'swiftlet';

    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

    OPEN cur;

    read_loop: LOOP
        FETCH cur INTO t;
        IF done THEN
            LEAVE read_loop;
        END IF;

        SET @s = CONCAT(
            'ALTER TABLE `', t, 
            '` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci'
        );

        PREPARE stmt FROM @s;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    END LOOP;

    CLOSE cur;
END$$

DELIMITER ;


CALL convert_collat_all_tables();
