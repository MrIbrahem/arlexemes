-- Adminer 4.8.1 SQLite 3 3.46.0 dump
DROP TABLE IF EXISTS "p11038_lemmas";
CREATE TABLE p11038_lemmas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            lemma_id INTEGER NOT NULL,
            lemma TEXT NOT NULL,
            pos TEXT NULL DEFAULT '',
            pos_cat TEXT NULL DEFAULT '',
            sama_lemma_id INTEGER NULL  DEFAULT '',
            sama_lemma TEXT NULL  DEFAULT '',
            wd_id TEXT NULL DEFAULT '',
            wd_id_category TEXT NULL DEFAULT '',
            UNIQUE(lemma, lemma_id)
        );

CREATE UNIQUE INDEX "sqlite_autoindex_p11038_lemmas_1" ON "p11038_lemmas" ("lemma", "lemma_id");


DROP TABLE IF EXISTS "sqlite_sequence";
CREATE TABLE sqlite_sequence(name,seq);


DROP TABLE IF EXISTS "wd_data";
CREATE TABLE wd_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    wd_id TEXT NOT NULL UNIQUE,
    wd_id_category TEXT NOT NULL,
    lemma TEXT NOT NULL
);

CREATE UNIQUE INDEX "sqlite_autoindex_wd_data_1" ON "wd_data" ("wd_id");


DROP TABLE IF EXISTS "wd_data_P11038";
CREATE TABLE wd_data_P11038 (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    wd_data_id TEXT NOT NULL,
    value TEXT NOT NULL,
    FOREIGN KEY(wd_data_id) REFERENCES wd_data(wd_id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX "wd_data_P11038_wd_data_id_value" ON "wd_data_P11038" ("wd_data_id", "value");


DROP VIEW IF EXISTS "wd_data_both";
CREATE TABLE "wd_data_both" ("vi_wd_id" text, "vi_wd_id_category" text, "vi_lemma" text, "vi_value" text);


DROP VIEW IF EXISTS "wd_data_view";
CREATE TABLE "wd_data_view" ("wd_id" text, "wd_id_category" text, "lemma" text, "P11038_values" );


DROP TABLE IF EXISTS "wd_data_both";
CREATE VIEW "wd_data_both" AS

SELECT
	d.wd_id as vi_wd_id,
	d.wd_id_category as vi_wd_id_category,
	d.lemma as vi_lemma,
	p.value as vi_value
FROM wd_data d
LEFT JOIN wd_data_P11038 p ON d.wd_id = p.wd_data_id;

DROP TABLE IF EXISTS "wd_data_view";
CREATE VIEW "wd_data_view" AS
        SELECT
            d.wd_id,
            d.wd_id_category,
            d.lemma,
            GROUP_CONCAT(p.value, ', ') AS P11038_values
        FROM wd_data d
        LEFT JOIN wd_data_P11038 p ON d.wd_id = p.wd_data_id
        GROUP BY d.wd_id, d.wd_id_category, d.lemma;
