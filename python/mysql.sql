-- Adminer 5.3.0 MySQL 8.0.42 dump

SET NAMES utf8;
SET time_zone = '+00:00';
SET foreign_key_checks = 0;
SET sql_mode = 'NO_AUTO_VALUE_ON_ZERO';

SET NAMES utf8mb4;

DROP TABLE IF EXISTS `lemmas_p11038`;
CREATE TABLE `lemmas_p11038` (
  `id` int NOT NULL AUTO_INCREMENT,
  `lemma_id` bigint NOT NULL,
  `lemma` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `pos` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT '',
  `pos_cat` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT '',
  `sama_lemma_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT '',
  `sama_lemma` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT '',
  PRIMARY KEY (`id`),
  UNIQUE KEY `lemma` (`lemma`,`lemma_id`),
  KEY `sama_lemma_id` (`sama_lemma_id`),
  KEY `lemma_id` (`lemma_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `wd_data`;
CREATE TABLE `wd_data` (
  `id` int NOT NULL AUTO_INCREMENT,
  `wd_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `wd_id_category` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `lemma` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `wd_id2` (`wd_id`),
  KEY `wd_id` (`wd_id`),
  KEY `lemma` (`lemma`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `wd_data_p11038`;
CREATE TABLE `wd_data_p11038` (
  `id` int NOT NULL AUTO_INCREMENT,
  `wd_data_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `wd_data_id_value` (`wd_data_id`,`value`),
  KEY `wd_data_id` (`wd_data_id`),
  KEY `value` (`value`),
  CONSTRAINT `fk_wd_data` FOREIGN KEY (`wd_data_id`) REFERENCES `wd_data` (`wd_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP VIEW IF EXISTS `p11038_lemmas_match`;
CREATE TABLE `p11038_lemmas_match` (`id` int);


DROP VIEW IF EXISTS `wd_data_both`;
CREATE TABLE `wd_data_both` (`vi_wd_id` varchar(255), `vi_wd_id_category` varchar(255), `vi_lemma` varchar(255), `vi_value` bigint);


DROP VIEW IF EXISTS `wd_data_view`;
CREATE TABLE `wd_data_view` (`wd_id` varchar(255), `wd_id_category` varchar(255), `lemma` varchar(255), `P11038_values` text);


DROP TABLE IF EXISTS `p11038_lemmas_match`;
CREATE ALGORITHM=UNDEFINED SQL SECURITY DEFINER VIEW `p11038_lemmas_match` AS select `l`.`id` AS `id` from ((`lemmas_p11038` `l` join `wd_data_p11038` `wdp` on((`l`.`lemma_id` = `wdp`.`value`))) join `wd_data` `w` on((`wdp`.`wd_data_id` = `w`.`wd_id`))) union all select `l`.`id` AS `id` from ((`lemmas_p11038` `l` join `wd_data_p11038` `wdp` on((`l`.`sama_lemma_id` = `wdp`.`value`))) join `wd_data` `w` on((`wdp`.`wd_data_id` = `w`.`wd_id`)));

DROP TABLE IF EXISTS `wd_data_both`;
CREATE ALGORITHM=UNDEFINED SQL SECURITY DEFINER VIEW `wd_data_both` AS select `d`.`wd_id` AS `vi_wd_id`,`d`.`wd_id_category` AS `vi_wd_id_category`,`d`.`lemma` AS `vi_lemma`,`p`.`value` AS `vi_value` from (`wd_data` `d` left join `wd_data_p11038` `p` on((`d`.`wd_id` = `p`.`wd_data_id`)));

DROP TABLE IF EXISTS `wd_data_view`;
CREATE ALGORITHM=UNDEFINED SQL SECURITY DEFINER VIEW `wd_data_view` AS select `d`.`wd_id` AS `wd_id`,`d`.`wd_id_category` AS `wd_id_category`,`d`.`lemma` AS `lemma`,group_concat(`p`.`value` separator ', ') AS `P11038_values` from (`wd_data` `d` left join `wd_data_p11038` `p` on((`d`.`wd_id` = `p`.`wd_data_id`))) group by `d`.`wd_id`,`d`.`wd_id_category`,`d`.`lemma`;

-- 2025-08-12 02:10:00 UTC
