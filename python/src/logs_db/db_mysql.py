# -*- coding: utf-8 -*-
import pymysql
from .config_db import load_db_config

DB_CONFIG = load_db_config()


def get_connection():
    """إنشاء اتصال جديد مع قاعدة البيانات MySQL"""
    return pymysql.connect(**DB_CONFIG)


def db_commit(query, params=None, many=False):
    """تنفيذ أوامر INSERT / UPDATE / DELETE"""
    conn = None
    cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor()

        if params is None:
            params = ()

        if many:
            cursor.executemany(query, params)
        else:
            cursor.execute(query, params)

        conn.commit()
        return True
    except pymysql.MySQLError as e:
        print(f"MySQL Database error: {e}")
        return e
    finally:
        if cursor is not None:
            cursor.close()
        if conn is not None:
            conn.close()


def init_db():
    query = """
        CREATE TABLE `lemmas_p11038` (
            `id` int NOT NULL AUTO_INCREMENT,
            `lemma_id` int NOT NULL,
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
        """
    # ---
    db_commit(query)
    # ---
    query = """
        CREATE TABLE `wd_data` (
            `id` int NOT NULL AUTO_INCREMENT,
            `wd_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
            `wd_id_category` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
            `lemma` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
            PRIMARY KEY (`id`),
            UNIQUE KEY `wd_id2` (`wd_id`),
            KEY `wd_id` (`wd_id`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        """
    # ---
    db_commit(query)
    # ---
    query = """
        CREATE TABLE `wd_data_p11038` (
            `id` int NOT NULL AUTO_INCREMENT,
            `wd_data_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
            `value` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
            PRIMARY KEY (`id`),
            UNIQUE KEY `wd_data_id` (`wd_data_id`,`value`),
            KEY `wd_data_id_value` (`wd_data_id`,`value`),
            CONSTRAINT `fk_wd_data` FOREIGN KEY (`wd_data_id`) REFERENCES `wd_data` (`wd_id`) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    """
    # ---
    db_commit(query)

def fetch_all(query, params=None, fetch_one=False):
    """جلب بيانات من قاعدة MySQL"""
    conn = None
    cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor()

        if params is None:
            params = ()

        cursor.execute(query, params)

        if fetch_one:
            row = cursor.fetchone()
            return row if row else None
        else:
            rows = cursor.fetchall()
            return rows
    except pymysql.MySQLError as e:
        print(f"MySQL Database error in fetch_all: {e}")
        return []
    finally:
        if cursor is not None:
            cursor.close()
        if conn is not None:
            conn.close()


# مثال
if __name__ == "__main__":
    rows = fetch_all("SELECT COUNT(*) AS total FROM lemmas_p11038")
    print(rows)
