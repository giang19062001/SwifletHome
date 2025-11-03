CREATE TABLE `tbl_user_admin` (
  `seq` int NOT NULL AUTO_INCREMENT,
  `userId` varchar(45) DEFAULT NULL,
  `userName` varchar(45) DEFAULT NULL,
  `userPassword` varchar(255) NOT NULL,
  `isActive` char(1) NOT NULL DEFAULT 'Y',
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`seq`),
  UNIQUE KEY `userId_UNIQUE` (`userId`)
)


CREATE TABLE `tbl_category_faq` (
  `seq` int NOT NULL AUTO_INCREMENT,
  `categoryCode` varchar(45) NOT NULL,
  `categoryName` varchar(45) NOT NULL,
  `isActive` char(1) DEFAULT 'Y',
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT NULL,
  `createdId` varchar(45) DEFAULT NULL,
  `updatedId` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`seq`),
  UNIQUE KEY `categoryCode_UNIQUE` (`categoryCode`)
)

CREATE TABLE `tbl_object_faq` (
  `seq` int NOT NULL AUTO_INCREMENT,
  `objectCharacter` varchar(45) NOT NULL,
  `objectName` varchar(45) NOT NULL,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT NULL,
  `createId` varchar(45) DEFAULT NULL,
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
  `categoryQuesCode` varchar(45) NOT NULL,
  `isActive` char(1) DEFAULT 'Y',
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT NULL,
  `createdId` varchar(45) DEFAULT NULL,
  `updatedId` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`seq`),
  UNIQUE KEY `questionCode_UNIQUE` (`questionCode`)
)

CREATE TABLE `tbl_answer` (
  `seq` int NOT NULL AUTO_INCREMENT,
  `answerCode` varchar(45) NOT NULL,
  `answerObject` char(10) NOT NULL,
  `answerContentRaw` text NOT NULL,
  `categoryAnsCode` varchar(45) NOT NULL,
  `isActive` char(1) DEFAULT 'Y',
  `isFree` char(1) DEFAULT 'Y',
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT NULL,
  `createdId` varchar(45) DEFAULT NULL,
  `updatedId` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`seq`),
  UNIQUE KEY `answerCode_UNIQUE` (`answerCode`)
)

CREATE TABLE `tbl_uploads_image` (
  `seq` int NOT NULL AUTO_INCREMENT,
  `filename` varchar(255) DEFAULT NULL,
  `originalname` text NOT NULL,
  `size` int NOT NULL,
  `mimetype` varchar(45) NOT NULL,
  `isActive` char(1) DEFAULT 'Y',
  `isFree` char(1) DEFAULT 'Y',
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT NULL,
  `createdId` varchar(45) DEFAULT NULL,
  `updatedId` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`seq`),
  UNIQUE KEY `filename_UNIQUE` (`filename`)
)

CREATE TABLE `tbl_uploads_audio` (
  `seq` int NOT NULL AUTO_INCREMENT,
  `seqPay` int, 
  `filename` varchar(255) DEFAULT NULL,
  `originalname` text NOT NULL,
  `size` int NOT NULL,
  `mimetype` varchar(45) NOT NULL,
  `isActive` char(1) DEFAULT 'Y',
  `isFree` char(1) DEFAULT 'Y',
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT NULL,
  `createdId` varchar(45) DEFAULT NULL,
  `updatedId` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`seq`),
  UNIQUE KEY `filename_UNIQUE` (`filename`)
)


CREATE TABLE `tbl_uploads_video` (
  `seq` int NOT NULL AUTO_INCREMENT,
  `urlLink` varchar(255) DEFAULT NULL,
  `isActive` char(1) DEFAULT 'Y',
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT NULL,
  `createdId` varchar(45) DEFAULT NULL,
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
  `createdId` varchar(45) DEFAULT NULL,
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
  `createdId` varchar(45) DEFAULT NULL,
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
  `createdId` varchar(45) DEFAULT NULL,
  `updatedId` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`seq`)
)


CREATE TABLE `tbl_user_app` (
  `seq` int NOT NULL AUTO_INCREMENT,
  `userCode` varchar(45) DEFAULT NULL,
  `userName` varchar(45) DEFAULT NULL,
  `userPhone` varchar(255) NOT NULL,
  `isActive` char(1) NOT NULL DEFAULT 'Y',
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`seq`),
  UNIQUE KEY `userCode_UNIQUE` (`userCode`)
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
  `createdId` varchar(45) DEFAULT NULL,
  `updatedId` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`seq`),
  UNIQUE KEY `mainCode` (`mainCode`,`subCode`,`keyCode`),
  UNIQUE KEY `code_UNIQUE` (`code`)
) 