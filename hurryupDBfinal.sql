-- MySQL dump 10.13  Distrib 5.7.9, for Win64 (x86_64)
--
-- Host: localhost    Database: hurryup
-- ------------------------------------------------------
-- Server version	5.5.46-0ubuntu0.14.04.2

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
-- Table structure for table `invitation`
--

DROP TABLE IF EXISTS `invitation`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `invitation` (
  `phoneNumber` varchar(20) NOT NULL,
  `m_id` int(11) NOT NULL,
  `is_accepted` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`phoneNumber`,`m_id`),
  KEY `m_idFromMeeting_idx` (`m_id`),
  CONSTRAINT `m_idFromMeeting` FOREIGN KEY (`m_id`) REFERENCES `meeting` (`m_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `invitation`
--

LOCK TABLES `invitation` WRITE;
/*!40000 ALTER TABLE `invitation` DISABLE KEYS */;
INSERT INTO `invitation` VALUES ('010-2222-2222',40,1),('010-2222-2222',41,1),('010-2222-2222',42,1),('010-2222-2222',43,1),('01022222222',39,1),('01033333333',38,1),('01033333333',39,1),('11111111112',38,0);
/*!40000 ALTER TABLE `invitation` ENABLE KEYS */;
UNLOCK TABLES;

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
  `updated_time` timestamp NOT NULL DEFAULT '1999-12-31 23:59:59',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `location`
--

LOCK TABLES `location` WRITE;
/*!40000 ALTER TABLE `location` DISABLE KEYS */;
INSERT INTO `location` VALUES (0,0,'ineedsleep','1999-12-31 23:59:59'),(0,0,'pppop','1999-12-31 23:59:59'),(73.3,27.3,'user1','2016-01-16 04:14:29'),(0,0,'user2','1999-12-31 23:59:59'),(0,0,'user3','1999-12-31 23:59:59'),(0,0,'user4','1999-12-31 23:59:59'),(0,0,'user5','1999-12-31 23:59:59'),(0,0,'user6','1999-12-31 23:59:59'),(0,0,'user7','1999-12-31 23:59:59');
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
  `board` varchar(5000) NOT NULL,
  PRIMARY KEY (`m_id`),
  KEY `meet_host_idx` (`m_host`),
  CONSTRAINT `meet_host` FOREIGN KEY (`m_host`) REFERENCES `member` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=44 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `meeting`
--

LOCK TABLES `meeting` WRITE;
/*!40000 ALTER TABLE `meeting` DISABLE KEYS */;
INSERT INTO `meeting` VALUES (1,'서버개발 스터디','사당역',37.476662,126.981935,'2016-01-15 22:15:17','user6','/[세영] 집에 가고 싶어요.../[세영] ??/[세영] 재혁이형 죄송해요..../[세영] 전 여기까지인가봐요../[재혁] ?/[재혁] ??/[재혁] ?/[세영] ??/[세영] ??/[세영] ? ????/[세영] hi/[재혁] hi/[재혁] hi/[세영] hi/[재혁] bye/[세영] hello/[세영] ??/[재혁] ??/[재혁] ?????/[세영] ??/[재혁] hiyo/[세영] hello/[세영] ??'),(2,'UX/UI 정기모임','홍대입구역',37.55717,126.923023,'2016-01-16 10:00:00','user2',''),(3,'Chicken&Beer','',22,124,'2016-01-15 18:38:27','user2','/[류혜원] 5기 개발 류혜원 면담으로 지각예정입니다/[오세영] 5기개발 오세영 회사일정으로 불참 예정입니다'),(4,'sGen moim','',123.1,123.1,'2016-01-10 09:00:00','user1',''),(38,'dodododododo','babasdbbs',222.2,111.1,'1997-03-21 19:00:00','user1',''),(39,'4:33 입사준비','KangNam',123,22,'2016-01-15 21:52:21','user1',''),(40,'사법고시 2차 스터디','노량진 카페베네',37.5351266,127.094678,'2016-01-15 21:49:02','user1',''),(41,'임용고시 1차 스터디','노량진 파스쿠치',37.5351266,127.094678,'2016-01-15 22:04:16','user1',''),(42,'뀨','뀨뀨',37.5351266,127.094678,'2016-01-15 22:04:16','user1',''),(43,'hello','???[2??]',37.5351266,127.094678,'2016-01-15 22:06:27','user1','');
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
  `is_arrived` tinyint(1) NOT NULL DEFAULT '0',
  `arrived_time` timestamp NOT NULL DEFAULT '1999-12-31 23:59:50',
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
INSERT INTO `meeting_members` VALUES (1,'user1',0,'1999-12-31 23:59:50'),(1,'user5',0,'1999-12-31 23:59:50'),(1,'user6',0,'1999-12-31 23:59:50'),(2,'user2',0,'1999-12-31 23:59:50'),(2,'user7',0,'1999-12-31 23:59:50'),(3,'user1',1,'2016-01-16 04:25:24'),(3,'user2',0,'1999-12-31 23:59:50'),(4,'user1',1,'2016-01-10 19:42:15'),(4,'user2',0,'2016-01-10 18:00:00'),(4,'user3',0,'2016-01-10 18:00:00'),(38,'user1',0,'1999-12-31 23:59:50'),(38,'user3',0,'1999-12-31 23:59:50'),(39,'user1',1,'2016-01-16 04:35:20'),(39,'user2',0,'1999-12-31 23:59:50'),(39,'user3',0,'1999-12-31 23:59:50'),(40,'user1',0,'1999-12-31 23:59:50'),(40,'user2',0,'1999-12-31 23:59:50'),(41,'user1',0,'1999-12-31 23:59:50'),(41,'user2',0,'1999-12-31 23:59:50'),(42,'user1',0,'1999-12-31 23:59:50'),(42,'user2',0,'1999-12-31 23:59:50'),(43,'user1',0,'1999-12-31 23:59:50'),(43,'user2',0,'1999-12-31 23:59:50');
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
  `name` varchar(45) NOT NULL,
  `email` varchar(45) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `phoneNumber_UNIQUE` (`phoneNumber`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `member`
--

LOCK TABLES `member` WRITE;
/*!40000 ALTER TABLE `member` DISABLE KEYS */;
INSERT INTO `member` VALUES ('ineedsleep','1111',0,'01044436380','졸린아이','bb'),('pppop','pppop',0,'9919187','928181',''),('test3','tmeeting_membersest3',0,'112345','chicken',''),('user1','1234',160,'010-1111-1111','세영','tpdud@gmail.com'),('user2','1234',0,'010-2222-2222','재혁','wogur@gmail.com'),('user3','1234',0,'010-3333-3333','대빈','eoqls@gmail.com'),('user4','1234',0,'010-4444-4444','흥식','gmdtlr@gmail.com'),('user5','1234',0,'010-5555-5555','혜원','gPdnjs@gmail.com'),('user6','1234',0,'010-6666-6666','재훈','wogns@gmail.com'),('user7','1234',0,'010-7777-7777','혜지','gPwl@gmail.com');
/*!40000 ALTER TABLE `member` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `member_lateness`
--

DROP TABLE IF EXISTS `member_lateness`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `member_lateness` (
  `member_id` varchar(50) NOT NULL,
  `date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `late_time` int(11) NOT NULL,
  PRIMARY KEY (`member_id`,`date`),
  CONSTRAINT `member-member_lateness` FOREIGN KEY (`member_id`) REFERENCES `member` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `member_lateness`
--

LOCK TABLES `member_lateness` WRITE;
/*!40000 ALTER TABLE `member_lateness` DISABLE KEYS */;
INSERT INTO `member_lateness` VALUES ('user1','2016-01-10 23:29:49',50),('user1','2016-01-11 23:29:49',23),('user1','2016-01-12 19:35:20',5),('user1','2016-01-13 19:35:20',60),('user1','2016-01-14 19:35:20',17),('user1','2016-01-15 19:35:20',5);
/*!40000 ALTER TABLE `member_lateness` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2016-01-16  7:21:37
