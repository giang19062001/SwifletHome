-- tỉnh thành vn
CREATE TABLE
  `tbl_provinces` (
    `seq` int NOT NULL AUTO_INCREMENT,
    `provinceCode` char(15) NOT NULL,
    `provinceName` varchar(45) NOT NULL,
    `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`seq`),
    UNIQUE KEY `provinceCode_UNIQUE` (`provinceCode`)
  ); 

--  admin
CREATE TABLE
  `tbl_user_admin` (
    `seq` int NOT NULL AUTO_INCREMENT,
    `userId` varchar(45) NOT NULL,
    `userName` varchar(45) NOT NULL,
    `userPassword` varchar(255) NOT NULL,
    `isActive` char(1) NOT NULL DEFAULT 'Y',
    `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` datetime DEFAULT NULL,
    PRIMARY KEY (`seq`),
    UNIQUE KEY `userId_UNIQUE` (`userId`)
  );

CREATE TABLE
  `tbl_category` (
    `seq` int NOT NULL AUTO_INCREMENT,
    `categoryCode` varchar(45) NOT NULL,
    `categoryName` varchar(45) NOT NULL,
    `isActive` char(1) DEFAULT 'Y',
    `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` datetime DEFAULT NULL,
    `createdId` varchar(45) DEFAULT 'SYSTEM',
    `updatedId` varchar(45) DEFAULT NULL,
    PRIMARY KEY (`seq`),
    UNIQUE KEY `categoryCode_UNIQUE` (`categoryCode`)
  );

CREATE TABLE
  `tbl_object` (
    `seq` int NOT NULL AUTO_INCREMENT,
    `objectKeyword` enum ('SWIFTLET', 'TEA', 'COFFEE') NOT NULL DEFAULT 'SWIFTLET',
    `objectName` varchar(45) NOT NULL,
    `isActive` char(1) DEFAULT 'Y',
    `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` datetime DEFAULT NULL,
    `createdId` varchar(45) DEFAULT 'SYSTEM',
    `updatedId` varchar(45) DEFAULT NULL,
    PRIMARY KEY (`seq`),
    UNIQUE KEY `objectCharacter_UNIQUE` (`objectKeyword`)
  );

CREATE TABLE
  `tbl_question` (
    `seq` int NOT NULL AUTO_INCREMENT,
    `questionCode` varchar(45) NOT NULL,
    `answerCode` varchar(45) DEFAULT NULL,
    `questionObject` char(10) NOT NULL,
    `questionContent` text NOT NULL,
    `questionCategory` varchar(45) NOT NULL,
    `isActive` char(1) DEFAULT 'Y',
    `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` datetime DEFAULT NULL,
    `createdId` varchar(45) DEFAULT 'SYSTEM',
    `updatedId` varchar(45) DEFAULT NULL,
    PRIMARY KEY (`seq`),
    UNIQUE KEY `questionCode_UNIQUE` (`questionCode`)
  );

CREATE TABLE
  `tbl_answer` (
    `seq` int NOT NULL AUTO_INCREMENT,
    `answerCode` varchar(45) NOT NULL,
    `answerContent` text NOT NULL,
    `answerObject` char(10) NOT NULL,
    `answerCategory` varchar(45) NOT NULL,
    `isActive` char(1) DEFAULT 'Y',
    `isFree` char(1) DEFAULT 'Y',
    `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` datetime DEFAULT NULL,
    `createdId` varchar(45) DEFAULT 'SYSTEM',
    `updatedId` varchar(45) DEFAULT NULL,
    PRIMARY KEY (`seq`),
    UNIQUE KEY `answerCode_UNIQUE` (`answerCode`)
  );

CREATE TABLE
  `tbl_blog` (
    `seq` int NOT NULL AUTO_INCREMENT,
    `blogCode` varchar(45) NOT NULL,
    `blogName` varchar(45) NOT NULL,
    `blogObject` char(10) NOT NULL,
    `blogCategory` varchar(45) NOT NULL,
    `blogContent` text NOT NULL,
    `blogScreenCode` char(15) DEFAULT '', -- màn hình code trên app
    `isActive` char(1) DEFAULT 'Y',
    `isFree` char(1) DEFAULT 'Y',
    `isMain` varchar(45) DEFAULT 'N',
    `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` datetime DEFAULT NULL,
    `createdId` varchar(45) DEFAULT 'SYSTEM',
    `updatedId` varchar(45) DEFAULT NULL,
    PRIMARY KEY (`seq`),
    UNIQUE KEY `blogCode_UNIQUE` (`blogCode`)
  )

CREATE TABLE
  `tbl_uploads_image` (
    `seq` int NOT NULL AUTO_INCREMENT,
    `filename` varchar(255) NOT NULL,
    `originalname` text NOT NULL,
    `size` int NOT NULL,
    `mimetype` varchar(45) NOT NULL,
    `isActive` char(1) DEFAULT 'Y',
    `isFree` char(1) DEFAULT 'Y',
    `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` datetime DEFAULT NULL,
    `createdId` varchar(45) DEFAULT 'SYSTEM',
    `updatedId` varchar(45) DEFAULT NULL,
    PRIMARY KEY (`seq`),
    UNIQUE KEY `filename_UNIQUE` (`filename`)
  );

CREATE TABLE
  `tbl_uploads_audio` (
    `seq` int NOT NULL AUTO_INCREMENT,
    `seqPay` int,
    `filename` varchar(255) NOT NULL,
    `originalname` text NOT NULL,
    `size` int NOT NULL,
    `mimetype` varchar(45) NOT NULL,
    `isActive` char(1) DEFAULT 'Y',
    `isFree` char(1) DEFAULT 'Y',
    `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` datetime DEFAULT NULL,
    `createdId` varchar(45) DEFAULT 'SYSTEM',
    `updatedId` varchar(45) DEFAULT NULL,
    PRIMARY KEY (`seq`),
    UNIQUE KEY `filename_UNIQUE` (`filename`)
  );

CREATE TABLE
  `tbl_uploads_video` (
    `seq` int NOT NULL AUTO_INCREMENT,
    `originalname` text NULL,
    `urlLink` varchar(255) NOT NULL,
    `isActive` char(1) DEFAULT 'Y',
    `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` datetime DEFAULT NULL,
    `createdId` varchar(45) DEFAULT 'SYSTEM',
    `updatedId` varchar(45) DEFAULT NULL,
    PRIMARY KEY (`seq`)
  );

-- nhà yến SCT
CREATE TABLE
  `tbl_home_sale` (
    `seq` int NOT NULL AUTO_INCREMENT,
    `homeCode` varchar(45) NOT NULL,
    `homeName` varchar(255) NOT NULL,
    `homeAddress` text NOT NULL,
    `homeDescription` text NOT NULL,
    `latitude` float NOT NULL,
    `longitude` float NOT NULL,
    `homeImage` varchar(255) NOT NULL,
    `isActive` char(1) DEFAULT 'Y',
    `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` datetime DEFAULT NULL,
    `createdId` varchar(45) DEFAULT 'SYSTEM',
    `updatedId` varchar(45) DEFAULT NULL,
    PRIMARY KEY (`seq`),
    UNIQUE KEY `homeCode_UNIQUE` (`homeCode`),
    UNIQUE KEY `homeImage_UNIQUE` (`homeImage`)
  );


CREATE TABLE
  `tbl_home_sale_img` (
    `seq` int NOT NULL AUTO_INCREMENT,
    `homeSeq` int NOT NULL,
    `filename` varchar(255) NOT NULL,
    `originalname` text NOT NULL,
    `size` int NOT NULL,
    `mimetype` varchar(45) NOT NULL,
    `isActive` char(1) DEFAULT 'Y',
    `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` datetime DEFAULT NULL,
    `createdId` varchar(45) DEFAULT 'SYSTEM',
    `updatedId` varchar(45) DEFAULT NULL,
    PRIMARY KEY (`seq`),
    UNIQUE KEY `filename_UNIQUE` (`filename`)
  );

-- đăng ký tham quan nha yến
CREATE TABLE
  `tbl_home_sale_sightseeing` (
    `seq` int NOT NULL AUTO_INCREMENT,
    `homeCode` varchar(45) NOT NULL,
    `userCode` varchar(45) NOT NULL,
    `userName` VARCHAR(45) NOT NULL,
    `userPhone` text NOT NULL,
    `numberAttendCode` char(15) NOT NULL,
    `status` ENUM ('WAITING', 'APPROVED', 'CANCEL') DEFAULT 'WAITING',
    `note` text,
    `cancelReason` text,
    `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` datetime DEFAULT NULL,
    `createdId` varchar(45) DEFAULT 'SYSTEM',
    `updatedId` varchar(45) DEFAULT NULL,
    PRIMARY KEY (`seq`)
  );

-- nhàn yến của khách hàng
CREATE TABLE
  `tbl_user_home_img` (
    `seq` int NOT NULL AUTO_INCREMENT,
    `userHomeSeq` int DEFAULT NULL,
    `userCode` varchar(45) NOT NULL,
    `uniqueId` char(255) NOT NULL,
    `filename` varchar(255) NOT NULL,
    `originalname` text NOT NULL,
    `size` int NOT NULL,
    `mimetype` varchar(45) NOT NULL,
    `isActive` char(1) DEFAULT 'Y',
    `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` datetime DEFAULT NULL,
    `createdId` varchar(45) DEFAULT NULL,
    `updatedId` varchar(45) DEFAULT NULL,
    PRIMARY KEY (`seq`),
    UNIQUE KEY `filename_UNIQUE` (`filename`),
    UNIQUE KEY `uniqueId_UNIQUE` (`uniqueId`)
  )

-- NHÀ YẾN CỦA USER
CREATE TABLE `tbl_user_home` (
  `seq` int NOT NULL AUTO_INCREMENT,
  `userHomeCode` varchar(45)  NOT NULL,
  `userCode` varchar(45)  NOT NULL,
  `userHomeName` varchar(255)  NOT NULL,
  `userHomeAddress` text  NOT NULL,
  `userHomeProvince` char(15)  NOT NULL,
  `userHomeDescription` text ,
  `userHomeImage` varchar(255)  NOT NULL,
  `userHomeLength` float DEFAULT '0',
  `userHomeWidth` float DEFAULT '0',
  `userHomeFloor` int DEFAULT '0',
  `uniqueId` char(255)  NOT NULL,
  `isIntegateTempHum` char(1)  DEFAULT 'N',
  `isIntegateCurrent` char(1)  DEFAULT 'N',
  `isTriggered` char(1)  DEFAULT 'N',
  `isMain` char(1)  DEFAULT 'N',
  `isActive` char(1)  DEFAULT 'Y',
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT NULL,
  `createdId` varchar(45)  DEFAULT 'SYSTEM',
  `updatedId` varchar(45)  DEFAULT NULL,
  PRIMARY KEY (`seq`),
  UNIQUE KEY `uniqueId_UNIQUE` (`uniqueId`)
) 

-- IOT cảm biến với nhà yến
CREATE TABLE
  `tbl_user_home_sensor` (
    `seq` int NOT NULL AUTO_INCREMENT,
    `userHomeCode` varchar(45) NOT NULL,
    `userCode` varchar(45) NOT NULL,
    `macId` varchar(255) NOT NULL,
    `wifiId` text NOT NULL,
    `wifiPassword` char(15) NOT NULL,
    `isActive` char(1) DEFAULT 'Y',
    `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` datetime DEFAULT NULL,
    `createdId` varchar(45) DEFAULT 'SYSTEM',
    `updatedId` varchar(45) DEFAULT NULL,
    PRIMARY KEY (`seq`),
    UNIQUE KEY `uniqueId_UNIQUE` (`uniqueId`)
  );




-- khám bệnh nhà yến
CREATE TABLE
  `tbl_doctor_file` (
    `seq` int NOT NULL AUTO_INCREMENT,
    `doctorSeq` int DEFAULT NULL,
    `userCode` varchar(45) NOT NULL,
    `uniqueId` char(255) NOT NULL,
    `filename` varchar(255) NOT NULL,
    `originalname` text NOT NULL,
    `size` int NOT NULL,
    `mimetype` varchar(45) NOT NULL,
    `isActive` char(1) DEFAULT 'Y',
    `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` datetime DEFAULT NULL,
    `createdId` varchar(45) DEFAULT NULL,
    `updatedId` varchar(45) DEFAULT NULL,
    PRIMARY KEY (`seq`),
    UNIQUE KEY `filename_UNIQUE` (`filename`)
  );




CREATE TABLE
  `tbl_doctor` (
    `seq` int NOT NULL AUTO_INCREMENT,
    `userCode` varchar(45) NOT NULL,
    `userName` varchar(45) NOT NULL,
    `userPhone` varchar(255) NOT NULL,
    `note` text NOT NULL,
    `noteAnswered` text,
    `status` ENUM ('WAITING', 'ANSWERED', 'CANCEL') DEFAULT 'WAITING',
    `uniqueId` char(255) NOT NULL,
    `isActive` char(1) DEFAULT 'Y',
    `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` datetime DEFAULT NULL,
    `createdId` varchar(45) DEFAULT 'SYSTEM',
    `updatedId` varchar(45) DEFAULT NULL,
    PRIMARY KEY (`seq`),
    UNIQUE KEY `uniqueId_UNIQUE` (`uniqueId`)
  );




-- mã code dùng chung
CREATE TABLE
  `tbl_option_common` (
    `seq` int NOT NULL AUTO_INCREMENT,
    `code` varchar(15) NOT NULL,
    `mainOption` varchar(15) NOT NULL,
    `subOption` varchar(15) NOT NULL,
    `keyOption` varchar(15) NOT NULL,
    `valueOption` varchar(255) NOT NULL,
    `sortOrder` int DEFAULT '0',
    `isActive` char(1) DEFAULT 'Y',
    `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` datetime DEFAULT NULL,
    `createdId` varchar(45) DEFAULT 'SYSTEM',
    `updatedId` varchar(45) DEFAULT NULL,
    PRIMARY KEY (`seq`),
    UNIQUE KEY `mainOption` (`mainOption`, `subOption`, `keyOption`),
    UNIQUE KEY `code_UNIQUE` (`code`)
  );




-- khách hàng
CREATE TABLE
  `tbl_otp` (
    `seq` int NOT NULL AUTO_INCREMENT,
    `userPhone` varchar(15) NOT NULL,
    `otpCode` varchar(6) NOT NULL,
    `purpose` enum ('REGISTER', 'FORGOT_PASSWORD') NOT NULL DEFAULT 'REGISTER',
    `attemptCount` int DEFAULT '0',
    `maxAttempts` int DEFAULT '5',
    `expiresAt` datetime NOT NULL,
    `createdAt` datetime NULL DEFAULT CURRENT_TIMESTAMP,
    `isUsed` tinyint (1) DEFAULT '0',
    PRIMARY KEY (`seq`),
    KEY `idx_phone_number` (`userPhone`),
    KEY `idx_expires_at` (`expiresAt`)
  );




CREATE TABLE
  `tbl_user_app` (
    `seq` int NOT NULL AUTO_INCREMENT,
    `userCode` varchar(45) NOT NULL,
    `userName` varchar(45) NOT NULL,
    `userPassword` varchar(255) NOT NULL,
    `userPhone` varchar(15) NOT NULL,
    `deviceToken` text NOT NULL,
    `isActive` char(1) NOT NULL DEFAULT 'Y',
    `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` datetime DEFAULT NULL,
    `createdId` varchar(45) DEFAULT 'SYSTEM',
    `updatedId` varchar(45) DEFAULT NULL,
    PRIMARY KEY (`seq`),
    UNIQUE KEY `userPhone_UNIQUE` (`userPhone`),
    UNIQUE KEY `userCode_UNIQUE` (`userCode`)
  ) ENGINE = InnoDB;

CREATE TABLE
  `tbl_user_app_delete` (
    `seq` int NOT NULL AUTO_INCREMENT,
    `userCode` varchar(45) NOT NULL,
    `userName` varchar(45) NOT NULL,
    `userPassword` varchar(255) NOT NULL,
    `userPhone` varchar(15) NOT NULL,
    `deviceToken` text NOT NULL,
    PRIMARY KEY (`seq`)
  ) ENGINE = InnoDB;


-- GÓI
CREATE TABLE `tbl_package` (
  `seq` int NOT NULL AUTO_INCREMENT,
  `packageCode` varchar(45)  NOT NULL,
  `packageName` varchar(45)  NOT NULL,
  `packagePrice` decimal(10,3) NOT NULL,
  `packageItemSamePrice` varchar(255)  DEFAULT NULL,
  `packageExpireDay` int NOT NULL,
  `packageOptionType` enum('MONEY','ITEM','BOTH')  DEFAULT 'MONEY',
  `packageDescription` varchar(255)  NOT NULL,
  `isActive` char(1)  DEFAULT 'Y',
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT NULL,
  `createdId` varchar(45)  DEFAULT 'SYSTEM',
  `updatedId` varchar(45)  DEFAULT NULL,
  PRIMARY KEY (`seq`),
  UNIQUE KEY `packageCode_UNIQUE` (`packageCode`)
)

-- GÓI


CREATE TABLE
  `tbl_user_package_delete` (
    `seq` int NOT NULL AUTO_INCREMENT,
    `userCode` varchar(45) NOT NULL,
    `packageCode` varchar(45) DEFAULT NULL,
    `startDate` datetime DEFAULT NULL,
    `endDate` datetime DEFAULT NULL,
    PRIMARY KEY (`seq`)
  ) ENGINE = InnoDB;





CREATE TABLE
  `tbl_user_package_history` (
    `seq` int NOT NULL AUTO_INCREMENT,
    `userCode` varchar(45) NOT NULL,
    `packageCode` varchar(45) DEFAULT NULL,
    `startDate` datetime DEFAULT NULL,
    `endDate` datetime DEFAULT NULL,
    `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
    `createdId` varchar(45) DEFAULT 'SYSTEM',
    PRIMARY KEY (`seq`)
  ) ENGINE = InnoDB;




CREATE TABLE
  `tbl_package` (
    `seq` int NOT NULL AUTO_INCREMENT,
    `packageCode` varchar(45) NOT NULL,
    `packageName` varchar(45) NOT NULL,
    `packagePrice` decimal(10, 3) NOT NULL,
    `packageExpireDay` int NOT NULL,
    `packageDescription` varchar(255) NOT NULL,
    `isActive` char(1) NOT NULL DEFAULT 'Y',
    `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` datetime DEFAULT NULL,
    `createdId` varchar(45) DEFAULT 'SYSTEM',
    `updatedId` varchar(45) DEFAULT NULL,
    PRIMARY KEY (`seq`),
    UNIQUE KEY `packageCode_UNIQUE` (`packageCode`)
  );




-- thông tin chuyển khoản, fcm key, s3 key
CREATE TABLE
  `tbl_info_config` (
    `seq` int NOT NULL AUTO_INCREMENT,
    `infoKeyword` enum ('BANK') NOT NULL DEFAULT 'BANK',
    `infoName` varchar(45) NOT NULL,
    `infoContent` json NOT NULL,
    `infoDescription` varchar(255) NOT NULL,
    `isActive` char(1) NOT NULL DEFAULT 'Y',
    `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` datetime DEFAULT NULL,
    `createdId` varchar(45) DEFAULT 'SYSTEM',
    `updatedId` varchar(45) DEFAULT NULL,
    PRIMARY KEY (`seq`)
  );




-- noi dung giao diện dynamic cho app từ db
-- SIGNUP_SERVICE: đăng kí dịch vụ
CREATE TABLE
  `tbl_screen_config` (
    `seq` int NOT NULL AUTO_INCREMENT,
    `screenKeyword` enum ('SIGNUP_SERVICE','REQUEST_DOCTOR') NOT NULL DEFAULT 'SIGNUP_SERVICE',
    `screenName` varchar(45) NOT NULL,
    `screenContent` JSON NOT NULL,
    `screenDescription` varchar(255) NOT NULL,
    `isActive` char(1) NOT NULL DEFAULT 'Y',
    `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` datetime DEFAULT NULL,
    `createdId` varchar(45) DEFAULT 'SYSTEM',
    `updatedId` varchar(45) DEFAULT NULL,
    PRIMARY KEY (`seq`)
  );




-- thông báo
CREATE TABLE
  tbl_notification_topics (
    seq INT AUTO_INCREMENT PRIMARY KEY,
    topicCode VARCHAR(45) NOT NULL UNIQUE,
    topicKeyword char(255) NOT NULL,
    topicName VARCHAR(45) NOT NULL UNIQUE,
    topicDescription TEXT,
    isActive CHAR(1) NOT NULL DEFAULT 'Y',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT NULL,
    createdId VARCHAR(45) DEFAULT 'SYSTEM',
    updatedId VARCHAR(45) DEFAULT NULL
  ) ENGINE = InnoDB;




CREATE TABLE
  tbl_user_notification_topics (
    seq INT AUTO_INCREMENT PRIMARY KEY,
    userCode VARCHAR(45) NOT NULL,
    topicCode VARCHAR(45) NOT NULL,
    isActive CHAR(1) NOT NULL DEFAULT 'Y',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT NULL,
    createdId VARCHAR(45) DEFAULT 'SYSTEM',
    updatedId VARCHAR(45) DEFAULT NULL,
    UNIQUE KEY uniq_user_topic (userCode, topicCode) -- chống trùng
  ) ENGINE = InnoDB;

-- thông tin thông báo
CREATE TABLE
  tbl_notifications (
    seq INT AUTO_INCREMENT PRIMARY KEY,
    notificationId CHAR(36) NOT NULL UNIQUE, -- UUID v4 lưu dạng string
    messageId VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    data JSON,
    targetScreen CHAR(255) NOT NULL,
    userCode VARCHAR(45) DEFAULT NULL, -- có thể null nếu notifications gửi bằng topic thay vì riêng user,
    userCodesMuticast JSON DEFAULT NULL, -- mảng user code nếu gửi multicase
    topicCode VARCHAR(45) DEFAULT NULL, -- có thể null
    notificationType ENUM ('ADMIN', 'TODO') DEFAULT 'ADMIN',
    isActive CHAR(1) NOT NULL DEFAULT 'Y',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT NULL,
    createdId VARCHAR(45) DEFAULT 'SYSTEM',
    updatedId VARCHAR(45) DEFAULT NULL
  ) ENGINE = InnoDB;

-- thông tin thông báo cho user
CREATE TABLE
  tbl_notifications_user (
    seq INT AUTO_INCREMENT PRIMARY KEY,
    notificationId CHAR(36) NOT NULL, -- UUID v4 lưu dạng string
    userCode VARCHAR(45) DEFAULT NULL, -- có thể null nếu notifications gửi bằng topic thay vì riêng user,
    notificationStatus ENUM ('SENT', 'READ') DEFAULT 'SENT',
    isActive CHAR(1) NOT NULL DEFAULT 'Y',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT NULL,
    createdId VARCHAR(45) DEFAULT 'SYSTEM',
    updatedId VARCHAR(45) DEFAULT NULL,
    UNIQUE KEY uk_notification_user (notificationId, userCode)
  ) ENGINE = InnoDB;

-- to do list
CREATE TABLE
  tbl_todo_box_tasks (
    seq INT AUTO_INCREMENT PRIMARY KEY,
    taskCode VARCHAR(45) UNIQUE NOT NULL,
    sortOrder int DEFAULT 0,
    isActive CHAR(1) NOT NULL DEFAULT 'Y',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT NULL,
    createdId VARCHAR(45) DEFAULT 'SYSTEM',
    updatedId VARCHAR(45) DEFAULT NULL
  )
CREATE TABLE
  tbl_todo_tasks (
    seq INT AUTO_INCREMENT PRIMARY KEY,
    taskCode VARCHAR(45) UNIQUE NOT NULL,
    taskName VARCHAR(255) NOT NULL,
    taskKeyword CHAR(255) NOT NULL DEFAULT '',
    isActive CHAR(1) NOT NULL DEFAULT 'Y',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT NULL,
    createdId VARCHAR(45) DEFAULT 'SYSTEM',
    updatedId VARCHAR(45) DEFAULT NULL
  )

CREATE TABLE
  tbl_todo_home_task_period (
    seq INT AUTO_INCREMENT PRIMARY KEY,
    taskPeriodCode VARCHAR(45) NOT NULL UNIQUE,
    taskCode VARCHAR(45) DEFAULT NULL, -- task chọn từ list
    userCode VARCHAR(45) NOT NULL,
    userHomeCode VARCHAR(45) NOT NULL,
    isCustomTask CHAR(1) NOT NULL DEFAULT 'Y', -- N chọn task hoặc Y nhập task
    taskCustomName VARCHAR(255) DEFAULT "", -- task nhập từ input
    isPeriod CHAR(1) NOT NULL DEFAULT 'Y', -- dạng chu kỳ và dạng tùy chỉnh
    periodType ENUM ('WEEK', 'MONTH') DEFAULT NULL, -- NULL nếu là tùy chỉnh
    periodValue INT DEFAULT NULL, --  week ( 1 - 6 : T2 - CN); month (1-31)
    specificValue DATE DEFAULT NULL, -- date cụ thể nếu isPeriod  là 'N'
    taskNote VARCHAR(255) DEFAULT '',
    isActive CHAR(1) NOT NULL DEFAULT 'Y',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT NULL,
    createdId VARCHAR(45) DEFAULT 'SYSTEM',
    updatedId VARCHAR(45) DEFAULT NULL
  );

CREATE TABLE
  tbl_todo_home_task_alarm (
    seq INT AUTO_INCREMENT PRIMARY KEY,
    taskAlarmCode VARCHAR(45) NOT NULL UNIQUE,
    taskPeriodCode VARCHAR(45) DEFAULT NULL, -- có thể null nếu ko phải là periodType
    taskCode VARCHAR(45) NULL DEFAULT NULL,
    taskName VARCHAR(45) NOT NULL, -- taskCode hoặc taskCustomName
    taskDate DATE NOT NULL, -- render từ periodValue Hoặc specificValue của tbl_todo_home_task_period
    taskStatus ENUM ('WAITING', 'COMPLETE', 'CANCEL', 'SKIP', 'COMPLETE_SOON') DEFAULT 'WAITING',
    userCode VARCHAR(45) NOT NULL,
    userHomeCode VARCHAR(45) NOT NULL,
    taskNote VARCHAR(255) DEFAULT '',
    isActive CHAR(1) NOT NULL DEFAULT 'Y',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT NULL,
    createdId VARCHAR(45) DEFAULT 'SYSTEM',
    updatedId VARCHAR(45) DEFAULT NULL
  )
  
  -- talbe hoàn thành task lăn thuốc
    CREATE TABLE
  tbl_todo_home_task_medicine (
    seq INT AUTO_INCREMENT PRIMARY KEY,
    seqNextTime INT,
    userCode VARCHAR(45) NOT NULL,
    userHomeCode VARCHAR(45) NOT NULL,
    medicineOptionCode VARCHAR(15) NOT NULL,
    medicineOrther VARCHAR(255) NOT NULL,
    medicineUsage VARCHAR(45) NOT NULL,
    isActive CHAR(1) NOT NULL DEFAULT 'Y',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT NULL,
    createdId VARCHAR(45) DEFAULT 'SYSTEM',
    updatedId VARCHAR(45) DEFAULT NULL
  )



  -- talbe task thu hoạch THEO ĐỢT
CREATE TABLE `tbl_todo_home_task_harvest_phase` (
  `seq` int NOT NULL AUTO_INCREMENT,
  `seqAlarm` int NOT NULL  DEFAULT '0',
  `userHomeCode` VARCHAR(45) NOT NULL, 
  `harvestPhase` INT DEFAULT 0,
  `harvestYear` INT NOT NULL,
  `isDone`  CHAR(1) NOT NULL DEFAULT 'Y',
    `isActive` CHAR(1) NOT NULL DEFAULT 'Y',
    `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` DATETIME DEFAULT NULL,
    `createdId` VARCHAR(45) DEFAULT 'SYSTEM',
    `updatedId` VARCHAR(45) DEFAULT NULL,
  PRIMARY KEY (`seq`)
) 

  -- talbe task thu hoạch 
CREATE TABLE `tbl_todo_home_task_harvest` (
  `seq` int NOT NULL AUTO_INCREMENT,
  `seqAlarm` int NOT NULL  DEFAULT '0',
  `userCode` varchar(45) NOT NULL,
  `userHomeCode` varchar(45) NOT NULL,
  `floor` int NOT NULL DEFAULT '0',
  `cell` int NOT NULL DEFAULT '0',
  `cellCollected` int NOT NULL DEFAULT '0',
  `cellRemain` int NOT NULL DEFAULT '0',
  `isActive` char(1) NOT NULL DEFAULT 'Y',
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT NULL,
  `createdId` varchar(45) DEFAULT 'SYSTEM',
  `updatedId` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`seq`)
) 
-- CREATE TABLE `tbl_todo_home_task_complete_harvest` (
--   `seq` int NOT NULL AUTO_INCREMENT,
--   `taskAlarmCode` varchar(45) NOT NULL,
--   `userCode` varchar(45) NOT NULL,
--   `userHomeCode` varchar(45) NOT NULL,
--   `floor` int NOT NULL DEFAULT '0',
--   `cell` int NOT NULL DEFAULT '0',
--   `cellCollected` int NOT NULL DEFAULT '0',
--   `cellRemain` int NOT NULL DEFAULT '0',
--   `isActive` char(1) NOT NULL DEFAULT 'Y',
--   `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
--   `updatedAt` datetime DEFAULT NULL,
--   `createdId` varchar(45) DEFAULT 'SYSTEM',
--   `updatedId` varchar(45) DEFAULT NULL,
--   PRIMARY KEY (`seq`)
-- ) 

-- media
CREATE TABLE
  `tbl_media_video` (
    `seq` int NOT NULL AUTO_INCREMENT,
    `originalname` text NULL,
    `urlLink` varchar(255) NOT NULL,
    `isActive` char(1) DEFAULT 'Y',
    `badge` ENUM('NEW') DEFAULT 'NORMAL'
    `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` datetime DEFAULT NULL,
    `createdId` varchar(45) DEFAULT 'SYSTEM',
    `updatedId` varchar(45) DEFAULT NULL,
    PRIMARY KEY (`seq`)
  );



CREATE TABLE
  `tbl_media_audio` (
    `seq` int NOT NULL AUTO_INCREMENT,
    `seqPay` int,
    `filename` varchar(255) NOT NULL,
    `originalname` text NOT NULL,
    `size` int NOT NULL,
    `mimetype` varchar(45) NOT NULL,
    `isActive` char(1) DEFAULT 'Y',
    `isFree` char(1) DEFAULT 'Y',
    `isCoupleFree` char(1) DEFAULT 'Y',
    `badge` ENUM('NEW') DEFAULT 'NORMAL',
    `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` datetime DEFAULT NULL,
    `createdId` varchar(45) DEFAULT 'SYSTEM',
    `updatedId` varchar(45) DEFAULT NULL,
    PRIMARY KEY (`seq`),
    UNIQUE KEY `filename_UNIQUE` (`filename`)
  );

  -- INSERT
INSERT INTO
  `tbl_user_admin` (
    `userId`,
    `userName`,
    `userPassword`,
    `isActive`,
    `createdAt`,
    `updatedAt`
  )
VALUES
  (
    'admin',
    'Boss',
    '$2b$10$f6Kw1Pc6YmdahVRjq8CVvO2HREVU/Cavc1mdwvopBovzptak3bvkm',
    'Y',
    '2025-10-20 10:39:20',
    NULL
  ),


INSERT INTO
  `swiftlet`.`tbl_provinces` (
    `seq`,
    `provinceCode`,
    `provinceName`,
    `createdAt`
  )
VALUES
  (1, 91, 'An Giang', CURRENT_TIMESTAMP),
  (2, 24, 'Bắc Ninh', CURRENT_TIMESTAMP),
  (3, 04, 'Cao Bằng', CURRENT_TIMESTAMP),
  (4, 96, 'Cà Mau', CURRENT_TIMESTAMP),
  (5, 52, 'Gia Lai', CURRENT_TIMESTAMP),
  (6, 42, 'Hà Tĩnh', CURRENT_TIMESTAMP),
  (7, 33, 'Hưng Yên', CURRENT_TIMESTAMP),
  (8, 56, 'Khánh Hòa', CURRENT_TIMESTAMP),
  (9, 12, 'Lai Châu', CURRENT_TIMESTAMP),
  (10, 15, 'Lào Cai', CURRENT_TIMESTAMP),
  (11, 68, 'Lâm Đồng', CURRENT_TIMESTAMP),
  (12, 20, 'Lạng Sơn', CURRENT_TIMESTAMP),
  (13, 40, 'Nghệ An', CURRENT_TIMESTAMP),
  (14, 37, 'Ninh Bình', CURRENT_TIMESTAMP),
  (15, 25, 'Phú Thọ', CURRENT_TIMESTAMP),
  (16, 51, 'Quảng Ngãi', CURRENT_TIMESTAMP),
  (17, 22, 'Quảng Ninh', CURRENT_TIMESTAMP),
  (18, 44, 'Quảng Trị', CURRENT_TIMESTAMP),
  (19, 14, 'Sơn La', CURRENT_TIMESTAMP),
  (20, 38, 'Thanh Hóa', CURRENT_TIMESTAMP),
  (21, 92, 'Cần Thơ', CURRENT_TIMESTAMP),
  (22, 46, 'Huế', CURRENT_TIMESTAMP),
  (23, 01, 'Hà Nội', CURRENT_TIMESTAMP),
  (24, 31, 'Hải Phòng', CURRENT_TIMESTAMP),
  (25, 79, 'Hồ Chí Minh', CURRENT_TIMESTAMP),
  (26, 48, 'Đà Nẵng', CURRENT_TIMESTAMP),
  (27, 19, 'Thái Nguyên', CURRENT_TIMESTAMP),
  (28, 08, 'Tuyên Quang', CURRENT_TIMESTAMP),
  (29, 80, 'Tây Ninh', CURRENT_TIMESTAMP),
  (30, 86, 'Vĩnh Long', CURRENT_TIMESTAMP),
  (31, 11, 'Điện Biên', CURRENT_TIMESTAMP),
  (32, 66, 'Đắk Lắk', CURRENT_TIMESTAMP),
  (33, 75, 'Đồng Nai', CURRENT_TIMESTAMP),
  (34, 82, 'Đồng Tháp', CURRENT_TIMESTAMP);




