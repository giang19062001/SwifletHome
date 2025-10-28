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


CREATE TABLE `tbl_category_ques_ans` (
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

CREATE TABLE `tbl_object_ques_ans` (
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
  `answerContent` text NOT NULL,
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

CREATE TABLE `tbl_uploads` (
  `seq` int NOT NULL AUTO_INCREMENT,
  `filename` varchar(255) DEFAULT NULL,
  `originalname` text NOT NULL,
  `source` varchar(45) NOT NULL,
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


CREATE TABLE `tbl_home` (
  `seq` int NOT NULL AUTO_INCREMENT,
  `homeCode` varchar(45) NOT NULL,
  `homeName` char(10) NOT NULL,
  `location` TEXT NOT NULL,
  `latitude` FLOAT NOT NULL,
  `longitude` FLOAT NOT NULL,
  `seqMainImage` INT NOT NULL,
  `isActive` char(1) DEFAULT 'Y',
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT NULL,
  `createdId` varchar(45) DEFAULT NULL,
  `updatedId` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`seq`),
  UNIQUE KEY `homeCode_UNIQUE` (`homeCode`)
)

CREATE TABLE `tbl_home_img` (
  `seq` int NOT NULL AUTO_INCREMENT,
  `homeCode` varchar(45) NOT NULL,
  `filename` varchar(255) DEFAULT NULL,
  `originalname` text NOT NULL,
  `source` varchar(45) NOT NULL,
  `size` int NOT NULL,
  `mimetype` varchar(45) NOT NULL,
  `isActive` char(1) DEFAULT 'Y',
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT NULL,
  `createdId` varchar(45) DEFAULT NULL,
  `updatedId` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`seq`)
)
