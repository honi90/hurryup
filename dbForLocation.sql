Create DATABASE IF NOT EXISTS Hurryup;

use Hurryup;




-- MySQL dump 10.13  Distrib 5.7.9, for Win64 (x86_64)
--
-- Host: localhost    Database: hurryup
-- ------------------------------------------------------
-- Server version	5.7.10-log

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `location`
--

DROP TABLE IF EXISTS `location`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `location` (
  `latitude` double NOT NULL DEFAULT '0',
  `longitude` double NOT NULL DEFAULT '0',
  `id` varchar(50) NOT NULL,
  `updated_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `location`
--

LOCK TABLES `location` WRITE;
/*!40000 ALTER TABLE `location` DISABLE KEYS */;
INSERT INTO `location` VALUES (123,123,'user1','1999-12-31 14:59:59'),(1231,1231,'user2','1997-12-31 12:39:59');
INSERT INTO `location` VALUES (144,444,'user3','1999-12-30 22:30:20'),(777,123,'user6','1939-12-20 18:39:59');
INSERT INTO `location` VALUES (155,343,'user4','1999-12-31 11:11:10'),(123,143,'user7','1979-12-30 16:39:59');
INSERT INTO `location` VALUES (123,453,'user5','1999-12-31 14:59:59'),(1441,551,'user8','2014-02-31 23:33:29');

/*!40000 ALTER TABLE `location` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `meeting`
--

DROP TABLE IF EXISTS `meeting`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `meeting` (
  `m_id` int(11) NOT NULL AUTO_INCREMENT,
  `m_title` varchar(45) NOT NULL,
  `m_location` varchar(100) NOT NULL,
  `m_latitude` double NOT NULL,
  `m_longitude` double NOT NULL,
  `m_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `m_host` varchar(50) NOT NULL,
  PRIMARY KEY (`m_id`),
  KEY `meet_host_idx` (`m_host`),
  CONSTRAINT `meet_host` FOREIGN KEY (`m_host`) REFERENCES `member` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `meeting`
--

LOCK TABLES `meeting` WRITE;
/*!40000 ALTER TABLE `meeting` DISABLE KEYS */;
INSERT INTO `meeting` VALUES (1,'meeting1','잠실',0,0,'2016-01-03 07:01:56','host1');
INSERT INTO `meeting` VALUES (2,'meeting2','강남',0,0,'2016-01-04 07:01:56','host2');
INSERT INTO `meeting` VALUES (3,'meeting3','신림',0,0,'2016-01-05 07:01:56','host3');
INSERT INTO `meeting` VALUES (4,'meeting4','사당',0,0,'2016-01-06 07:01:56','host4');

/*!40000 ALTER TABLE `meeting` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `meeting_members`
--

DROP TABLE IF EXISTS `meeting_members`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `meeting_members` (
  `meeting_id` int(11) NOT NULL,
  `meeting_member` varchar(50) NOT NULL,
  PRIMARY KEY (`meeting_id`,`meeting_member`),
  KEY `meeting_member_for_idx` (`meeting_member`),
  CONSTRAINT `meeting_id_for` FOREIGN KEY (`meeting_id`) REFERENCES `meeting` (`m_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `meeting_member_for` FOREIGN KEY (`meeting_member`) REFERENCES `member` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `meeting_members`
--

LOCK TABLES `meeting_members` WRITE;
/*!40000 ALTER TABLE `meeting_members` DISABLE KEYS */;
INSERT INTO `meeting_members` VALUES (1,'user1'),(1,'user2');
INSERT INTO `meeting_members` VALUES (2,'user1'),(2,'user2');
INSERT INTO `meeting_members` VALUES (2,'user3'),(2,'user4');
INSERT INTO `meeting_members` VALUES (3,'user1'),(1,'user5');

/*!40000 ALTER TABLE `meeting_members` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `member`
--

DROP TABLE IF EXISTS `member`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `member` (
  `id` varchar(50) NOT NULL,
  `pw` varchar(100) NOT NULL,
  `credit` int(11) NOT NULL DEFAULT '0',
  `phoneNumber` varchar(20) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `member`
--

LOCK TABLES `member` WRITE;
/*!40000 ALTER TABLE `member` DISABLE KEYS */;
INSERT INTO `member` VALUES ('user1','1111',0,'010-1111-1111'),('user2','2222',0,'010-2222-2222');
INSERT INTO `member` VALUES ('user3','3333',0,'010-3333-3333'),('user6','6666',0,'010-6666-6666');
INSERT INTO `member` VALUES ('user4','4444',0,'010-4444-4444'),('user7','7777',0,'010-7777-7777');
INSERT INTO `member` VALUES ('user5','5555',0,'010-5555-5555'),('user8','8888',0,'010-8888-8888');
/*!40000 ALTER TABLE `member` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2016-01-03 19:16:35
