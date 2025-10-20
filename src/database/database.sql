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