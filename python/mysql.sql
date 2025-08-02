
DROP TABLE IF EXISTS `P11038_lemmas`;
CREATE TABLE `P11038_lemmas` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `lemma_id` INT NOT NULL,
    `lemma` VARCHAR(255) NOT NULL,
    `pos` VARCHAR(255) DEFAULT '',
    `pos_cat` VARCHAR(255) DEFAULT '',
    `sama_lemma_id` INT DEFAULT NULL,
    `sama_lemma` VARCHAR(255) DEFAULT '',
    `wd_id` VARCHAR(255) DEFAULT '',
    `wd_id_category` VARCHAR(255) DEFAULT '',
    UNIQUE (`lemma`, `lemma_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- index auto created by UNIQUE (`lemma`, `lemma_id`)

DROP TABLE IF EXISTS `wd_data`;
CREATE TABLE `wd_data` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `wd_id` VARCHAR(255) NOT NULL UNIQUE,
    `wd_id_category` VARCHAR(255) NOT NULL,
    `lemma` VARCHAR(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- unique index auto created by UNIQUE (`wd_id`)

DROP TABLE IF EXISTS `wd_data_P11038`;
CREATE TABLE `wd_data_P11038` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `wd_data_id` VARCHAR(255) NOT NULL,
    `value` VARCHAR(255) NOT NULL,
    CONSTRAINT fk_wd_data FOREIGN KEY (`wd_data_id`) REFERENCES `wd_data`(`wd_id`) ON DELETE CASCADE,
    UNIQUE (`wd_data_id`, `value`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- لا نحتاج sqlite_sequence في MySQL

DROP VIEW IF EXISTS `wd_data_both`;
CREATE VIEW `wd_data_both` AS
SELECT
    d.wd_id AS vi_wd_id,
    d.wd_id_category AS vi_wd_id_category,
    d.lemma AS vi_lemma,
    p.value AS vi_value
FROM wd_data d
LEFT JOIN wd_data_P11038 p ON d.wd_id = p.wd_data_id;

DROP VIEW IF EXISTS `wd_data_view`;
CREATE VIEW `wd_data_view` AS
SELECT
    d.wd_id,
    d.wd_id_category,
    d.lemma,
    GROUP_CONCAT(p.value SEPARATOR ', ') AS P11038_values
FROM wd_data d
LEFT JOIN wd_data_P11038 p ON d.wd_id = p.wd_data_id
GROUP BY d.wd_id, d.wd_id_category, d.lemma;
