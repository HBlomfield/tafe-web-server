-- phpMyAdmin SQL Dump
-- version 5.1.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Oct 08, 2021 at 03:39 PM
-- Server version: 10.4.21-MariaDB
-- PHP Version: 8.0.10

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `draw`
--

-- --------------------------------------------------------

--
-- Table structure for table `groupmembers`
--

CREATE TABLE `groupmembers` (
  `ID` char(20) NOT NULL,
  `UserID` char(20) NOT NULL,
  `GroupID` char(20) NOT NULL,
  `Status` tinyint(1) UNSIGNED NOT NULL,
  `IsDisabled` tinyint(1) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `groups`
--

CREATE TABLE `groups` (
  `ID` char(20) NOT NULL,
  `CreatorID` char(20) NOT NULL,
  `OwnerID` char(20) NOT NULL,
  `TopicID` char(20) NOT NULL,
  `DisplayName` varchar(45) NOT NULL,
  `DisplayIcon` blob DEFAULT NULL,
  `Description` text DEFAULT NULL,
  `CreateDate` int(10) UNSIGNED NOT NULL,
  `IsPrivate` tinyint(1) UNSIGNED DEFAULT NULL,
  `IsDisabled` tinyint(1) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `groups`
--

INSERT INTO `groups` (`ID`, `CreatorID`, `OwnerID`, `TopicID`, `DisplayName`, `DisplayIcon`, `Description`, `CreateDate`, `IsPrivate`, `IsDisabled`) VALUES
('group1', 'abcdef123456789abcd', 'abcdef123456789abcd', '', 'group1', NULL, 'this is the first group', 1231231231, 0, 0);

-- --------------------------------------------------------

--
-- Table structure for table `posts`
--

CREATE TABLE `posts` (
  `ID` char(20) NOT NULL,
  `UserID` char(20) NOT NULL,
  `GroupID` char(20) DEFAULT NULL,
  `ReplyToID` char(20) DEFAULT NULL,
  `Text` varchar(512) NOT NULL,
  `Drawing` mediumblob DEFAULT NULL,
  `CreationDate` int(10) UNSIGNED NOT NULL,
  `IsSpoiler` tinyint(1) UNSIGNED NOT NULL DEFAULT 0,
  `IsNSFW` tinyint(1) UNSIGNED NOT NULL DEFAULT 0,
  `IsDisabled` tinyint(1) UNSIGNED NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `posts`
--

INSERT INTO `posts` (`ID`, `UserID`, `GroupID`, `ReplyToID`, `Text`, `Drawing`, `CreationDate`, `IsSpoiler`, `IsNSFW`, `IsDisabled`) VALUES
('abcdef123456789abcd', 'f66c5fe86fb0972c3151', 'abcdeabcdeabcdeabcde', 'ad43fae0aa1720c60b63', '', NULL, 0, 0, 0, 0),
('ad43fae0aa1720c60b63', 'ad43fae0aa1720c60b63', 'abcdeabcdeabcdeabcde', 'f66c5fe86fb0972c3151', 'abcdfe', NULL, 10, 0, 0, 0),
('adasdasdasdasdasdfgs', 'f66c5fe86fb0972c3151', 'group2', NULL, 'regege', NULL, 0, 0, 0, 0),
('f66c5fe86fb0972c3151', 'abcdef123456789abcd', 'abcdeabcdeabcdeabcde', 'ad43fae0aa1720c60b63', '', NULL, 0, 0, 0, 0);

-- --------------------------------------------------------

--
-- Table structure for table `userrelations`
--

CREATE TABLE `userrelations` (
  `ID` char(20) NOT NULL,
  `UserID` char(20) DEFAULT NULL,
  `RelationUserID` char(20) DEFAULT NULL,
  `SocialStatus` tinyint(1) DEFAULT NULL COMMENT '0: pending friend request\\n1: friends\\n2: blocked',
  `IsDisabled` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `userrelations`
--

INSERT INTO `userrelations` (`ID`, `UserID`, `RelationUserID`, `SocialStatus`, `IsDisabled`) VALUES
('a00e8530167659caaaf2', 'a00e8530167659caaaf2', 'ad43fae0aa1720c60b63', 1, 0),
('ad43fae0aa1720c60b63', 'ad43fae0aa1720c60b63', 'f66c5fe86fb0972c3151', 1, 0),
('f66c5fe86fb0972c3151', 'ad43fae0aa1720c60b63', 'a00e8530167659caaaf2', 1, 0);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `ID` char(20) NOT NULL,
  `Email` varchar(255) NOT NULL,
  `DisplayName` varchar(30) NOT NULL,
  `DisplayIcon` blob DEFAULT NULL,
  `DisplayBio` text DEFAULT NULL,
  `Password` char(40) NOT NULL,
  `JoinedOn` int(10) UNSIGNED NOT NULL,
  `IsVerified` tinyint(1) UNSIGNED NOT NULL DEFAULT 0,
  `VerificationCode` varchar(6) NOT NULL,
  `LastUsedIP` varchar(39) DEFAULT NULL,
  `IsPrivate` tinyint(1) NOT NULL DEFAULT 0,
  `IsDisabled` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`ID`, `Email`, `DisplayName`, `DisplayIcon`, `DisplayBio`, `Password`, `JoinedOn`, `IsVerified`, `VerificationCode`, `LastUsedIP`, `IsPrivate`, `IsDisabled`) VALUES
('a00e8530167659caaaf2', 'abc@et.not', 'reehehee', NULL, NULL, '03571ebc90852da76a87e67970fd3fec20433b73', 1633514704, 1, '12aed1', NULL, 0, 0),
('abcdef123456789abcd', 'baaba@babebe.rebr', 'Jjojierjq', NULL, NULL, '', 0, 0, '', NULL, 0, 0),
('ad43fae0aa1720c60b63', 'abc@123.xyz', 'hehehe', NULL, NULL, '03571ebc90852da76a87e67970fd3fec20433b73', 1633519160, 1, 'ad69a5', NULL, 0, 0),
('f66c5fe86fb0972c3151', 'abc@easdasdt.not', 'johny', NULL, NULL, '03571ebc90852da76a87e67970fd3fec20433b73', 1633578544, 0, 'b12336', NULL, 0, 0);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `groupmembers`
--
ALTER TABLE `groupmembers`
  ADD PRIMARY KEY (`ID`);

--
-- Indexes for table `groups`
--
ALTER TABLE `groups`
  ADD PRIMARY KEY (`ID`);

--
-- Indexes for table `posts`
--
ALTER TABLE `posts`
  ADD PRIMARY KEY (`ID`),
  ADD KEY `UserID->Users_idx` (`UserID`);

--
-- Indexes for table `userrelations`
--
ALTER TABLE `userrelations`
  ADD PRIMARY KEY (`ID`),
  ADD KEY `UserID_idx` (`UserID`),
  ADD KEY `RelationUserID_idx` (`RelationUserID`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`ID`);

--
-- Constraints for dumped tables
--

--
-- Constraints for table `userrelations`
--
ALTER TABLE `userrelations`
  ADD CONSTRAINT `RelationUserID->Users` FOREIGN KEY (`RelationUserID`) REFERENCES `users` (`ID`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `UserID->Users` FOREIGN KEY (`UserID`) REFERENCES `users` (`ID`) ON DELETE NO ACTION ON UPDATE NO ACTION;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
