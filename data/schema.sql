/*
SQLyog Community
MySQL - 5.7.17-log : Database - vihuela
*********************************************************************
*/

/*!40101 SET NAMES utf8 */;

/*!40101 SET SQL_MODE=''*/;

/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
CREATE DATABASE /*!32312 IF NOT EXISTS*/`vihuela` /*!40100 DEFAULT CHARACTER SET utf8 */;

USE `vihuela`;

/*Table structure for table `authors` */

CREATE TABLE `authors` (
  `author_id` smallint(6) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`author_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

/*Table structure for table `books` */

CREATE TABLE `books` (
  `book_id` smallint(6) NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`book_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

/*Table structure for table `chapters` */

CREATE TABLE `chapters` (
  `book_id` smallint(6) NOT NULL,
  `chapter_id` smallint(6) NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`book_id`,`chapter_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

/*Table structure for table `items` */

CREATE TABLE `items` (
  `book_id` smallint(6) NOT NULL,
  `item_id` smallint(6) NOT NULL,
  `author_id` smallint(6) DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `notes` varchar(2048) DEFAULT NULL,
  `type_id` smallint(6) DEFAULT NULL,
  `chapter_id` smallint(6) DEFAULT NULL,
  PRIMARY KEY (`book_id`,`item_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

/*Table structure for table `pages` */

CREATE TABLE `pages` (
  `book_id` smallint(6) NOT NULL,
  `item_id` smallint(6) NOT NULL,
  `page_id` smallint(6) NOT NULL,
  `filename` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`book_id`,`item_id`,`page_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

/*Table structure for table `types` */

CREATE TABLE `types` (
  `book_id` smallint(6) NOT NULL,
  `type_id` smallint(6) NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `global_type_id` smallint(6) DEFAULT NULL,
  PRIMARY KEY (`book_id`,`type_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
