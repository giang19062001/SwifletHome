CREATE TABLE `tbl_user_admin` (
  `seq` int NOT NULL AUTO_INCREMENT,
  `userId` varchar(45) NOT NULL,
  `userName` varchar(45) NOT NULL,
  `userPassword` varchar(255) NOT NULL,
  `isActive` char(1) NOT NULL DEFAULT 'Y',
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`seq`),
  UNIQUE KEY `userId_UNIQUE` (`userId`)
)


CREATE TABLE `tbl_category` (
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
)

CREATE TABLE `tbl_object` (
  `seq` int NOT NULL AUTO_INCREMENT,
  `objectCharacter` enum('SWIFTLET','TEA','COFFEE') NOT NULL DEFAULT 'SWIFTLET',
  `objectName` varchar(45) NOT NULL,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT NULL,
  `createdId` varchar(45) DEFAULT 'SYSTEM',
  `updatedId` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`seq`),
  UNIQUE KEY `objectCharacter_UNIQUE` (`objectCharacter`)
)

CREATE TABLE `tbl_question` (
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
  UNIQUE KEY `questionCode_UNIQUE` (`questionCode`),
)

CREATE TABLE `tbl_answer` (
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
)

CREATE TABLE `tbl_blog` (
  `seq` int NOT NULL AUTO_INCREMENT,
  `blogCode` varchar(45) NOT NULL,
  `blogObject` char(10) NOT NULL,
  `blogCategory` varchar(45) NOT NULL,
  `blogContent` text NOT NULL,
  `blogScreenCode` char(15) DEFAULT ''
  `isActive` char(1) DEFAULT 'Y',
  `isFree` char(1) DEFAULT 'Y',
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT NULL,
  `createdId` varchar(45) DEFAULT 'SYSTEM',
  `updatedId` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`seq`),
  UNIQUE KEY `blogCode_UNIQUE` (`blogCode`)
)

CREATE TABLE `tbl_uploads_image` (
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
)

CREATE TABLE `tbl_uploads_audio` (
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
)


CREATE TABLE `tbl_uploads_video` (
  `seq` int NOT NULL AUTO_INCREMENT,
  `urlLink` varchar(255) NOT NULL,
  `isActive` char(1) DEFAULT 'Y',
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT NULL,
  `createdId` varchar(45) DEFAULT 'SYSTEM',
  `updatedId` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`seq`),
  UNIQUE KEY `videoUrl_UNIQUE` (`urlLink`)
) 

CREATE TABLE `tbl_home` (
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
)

CREATE TABLE `tbl_home_img` (
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
)

CREATE TABLE `tbl_home_submit` (
  `seq` int NOT NULL AUTO_INCREMENT,
  `homeCode` varchar(45) NOT NULL,
  `userCode` varchar(45) NOT NULL,
  `userName` char(10) NOT NULL,
  `userPhone` text NOT NULL,
  `numberAttendCode` char(15) NOT NULL,
  `statusCode` char(15) NOT NULL,
  `note` text,
  `cancelReason` text,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT NULL,
  `createdId` varchar(45) DEFAULT 'SYSTEM',
  `updatedId` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`seq`)
)

CREATE TABLE `tbl_doctor_file` (
  `seq` int NOT NULL AUTO_INCREMENT,
  `doctorSeq` int DEFAULT NULL,
  `uniqueId` char(255) NOT NULL,
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
)

CREATE TABLE `tbl_doctor` (
  `seq` int NOT NULL AUTO_INCREMENT,
  `userCode` varchar(45) NOT NULL,
  `userName` varchar(45) NOT NULL,
  `userPhone` varchar(255) NOT NULL,
  `note` text NOT NULL,
  `noteAnswered` text,
  `statusCode` char(15) NOT NULL,
  `uniqueId` char(255) NOT NULL,
  `isActive` char(1) DEFAULT 'Y',
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT NULL,
  `createdId` varchar(45) DEFAULT 'SYSTEM',
  `updatedId` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`seq`),
  UNIQUE KEY `uniqueId_UNIQUE` (`uniqueId`)
) 

CREATE TABLE `tbl_code_common` (
  `seq` int NOT NULL AUTO_INCREMENT,
  `code` varchar(15) NOT NULL,
  `mainCode` varchar(15) NOT NULL,
  `subCode` varchar(15) NOT NULL,
  `keyCode` varchar(15) NOT NULL,
  `valueCode` varchar(255) NOT NULL,
  `sortOrder` int DEFAULT '0',
  `isActive` char(1) DEFAULT 'Y',
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT NULL,
  `createdId` varchar(45) DEFAULT 'SYSTEM',
  `updatedId` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`seq`),
  UNIQUE KEY `mainCode` (`mainCode`,`subCode`,`keyCode`),
  UNIQUE KEY `code_UNIQUE` (`code`)
) 

CREATE TABLE `tbl_otp` (
  `seq` int NOT NULL AUTO_INCREMENT,
  `userPhone` varchar(15) NOT NULL,
  `otpCode` varchar(6) NOT NULL,
  `purpose` enum('REGISTER','FORGOT_PASSWORD') NOT NULL DEFAULT 'REGISTER',
  `attemptCount` int DEFAULT '0',
  `maxAttempts` int DEFAULT '5',
  `expiresAt` datetime NOT NULL,
  `createdAt` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  `isUsed` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`seq`),
  KEY `idx_phone_number` (`userPhone`),
  KEY `idx_expires_at` (`expiresAt`)
) 

CREATE TABLE `tbl_user_app` (
  `seq` int NOT NULL AUTO_INCREMENT,
  `userCode` varchar(45) NOT NULL,
  `userName` varchar(45) NOT NULL,
  `userPassword` varchar(255) NOT NULL,
  `userPhone` varchar(15) NOT NULL,
  `userDevice` text NOT NULL,
  `isActive` char(1) NOT NULL DEFAULT 'Y',
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT NULL,
  `createdId` varchar(45) DEFAULT 'SYSTEM',
  `updatedId` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`seq`),
  UNIQUE KEY `userPhone_UNIQUE` (`userPhone`),
  UNIQUE KEY `userCode_UNIQUE` (`userCode`)
)
CREATE TABLE `tbl_user_payment` (
  `seq` int NOT NULL AUTO_INCREMENT,
  `userCode` varchar(45) NOT NULL,
  `packageCode` varchar(45) DEFAULT NULL,
  `startDate` datetime DEFAULT NULL,
  `endDate` datetime DEFAULT NULL,
  `isActive` char(1) NOT NULL DEFAULT 'Y',
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT NULL,
  `createdId` varchar(45) DEFAULT 'SYSTEM',
  `updatedId` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`seq`),
  UNIQUE KEY `userPhone_UNIQUE` (`userPhone`),
  UNIQUE KEY `userCode_UNIQUE` (`userCode`)
)

CREATE TABLE `tbl_package` (
  `seq` int NOT NULL AUTO_INCREMENT,
  `packageCode` varchar(45) NOT NULL,
  `packageName` varchar(45) NOT NULL,
  `packagePrice` decimal(10,3) NOT NULL,
  `packageExpireDay` int NOT NULL,
  `packageDescription` varchar(255) NOT NULL,
  `isActive` char(1) NOT NULL DEFAULT 'Y',
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT NULL,
  `createdId` varchar(45) DEFAULT 'SYSTEM',
  `updatedId` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`seq`),
  UNIQUE KEY `packageCode_UNIQUE` (`packageCode`)
)

-- thông tin chuyển khoản, fcm key, s3 key
CREATE TABLE `tbl_config_system` (
  `seq` int NOT NULL AUTO_INCREMENT,
  `configCharacter` enum('BANK') NOT NULL DEFAULT 'BANK',
  `configName` varchar(45) NOT NULL,
  `configContent` json NOT NULL,
  `configDescription` varchar(255) NOT NULL,
  `isActive` char(1) NOT NULL DEFAULT 'Y',
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT NULL,
  `createdId` varchar(45) DEFAULT 'SYSTEM',
  `updatedId` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`seq`)
)

-- giao diện dynamic cho app từ db
-- SIGNUP_SERVICE: đăng kí dịch vụ
CREATE TABLE `tbl_design_system` (
  `seq` int NOT NULL AUTO_INCREMENT,
  `designCharacter` enum('SIGNUP_SERVICE') NOT NULL DEFAULT 'SIGNUP_SERVICE', 
  `designName` varchar(45) NOT NULL,
  `designContent` JSON NOT NULL,
  `designDescription` varchar(255) NOT NULL,
  `isActive` char(1) NOT NULL DEFAULT 'Y',
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT NULL,
  `createdId` varchar(45) DEFAULT 'SYSTEM',
  `updatedId` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`seq`)
)



CREATE TABLE tbl_notification_topics (
  seq INT AUTO_INCREMENT PRIMARY KEY,
  topicCode VARCHAR(45) NOT NULL UNIQUE,
  topicName VARCHAR(45) NOT NULL UNIQUE,
  description TEXT,
  isActive char(1) NOT NULL DEFAULT 'Y',
  createdAt datetime DEFAULT CURRENT_TIMESTAMP,
  updatedAt datetime DEFAULT NULL,
  createdId varchar(45) DEFAULT 'SYSTEM',
  updatedId varchar(45) DEFAULT NULL
);

CREATE TABLE tbl_user_topics (
  seq INT AUTO_INCREMENT PRIMARY KEY,
  userCode varchar(45) NOT NULL,
  topicCode varchar(45) NOT NULL,
  isActive char(1) NOT NULL DEFAULT 'Y',
  createdAt datetime DEFAULT CURRENT_TIMESTAMP,
  updatedAt datetime DEFAULT NULL,
  createdId varchar(45) DEFAULT 'SYSTEM',
  updatedId varchar(45) DEFAULT NULL
);

CREATE TABLE tbl_notifications (
  seq INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  data JSON,
  userCode varchar(45), 
  topicCode varchar(45),
  status ENUM('SENT','READ','FAIL') DEFAULT 'SENT',
  isActive char(1) NOT NULL DEFAULT 'Y',
  createdAt datetime DEFAULT CURRENT_TIMESTAMP,
  updatedAt datetime DEFAULT NULL,
  createdId varchar(45) DEFAULT 'SYSTEM',
  updatedId varchar(45) DEFAULT NULL
);
