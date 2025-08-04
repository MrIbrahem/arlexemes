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
        CREATE TABLE IF NOT EXISTS p11038_lemmas (
            id INT AUTO_INCREMENT PRIMARY KEY,
            lemma_id INT NOT NULL,
            lemma VARCHAR(255) NOT NULL,
            pos VARCHAR(255) DEFAULT '',
            pos_cat VARCHAR(255) DEFAULT '',
            sama_lemma_id INT DEFAULT NULL,
            sama_lemma VARCHAR(255) DEFAULT '',
            wd_id VARCHAR(255) DEFAULT '',
            wd_id_category VARCHAR(255) DEFAULT '',
            UNIQUE (lemma, lemma_id)
        )
        """
    # ---
    db_commit(query)
    # ---
    query = """
        CREATE TABLE IF NOT EXISTS wd_data (
            id INT AUTO_INCREMENT PRIMARY KEY,
            wd_id VARCHAR(255) NOT NULL UNIQUE,
            wd_id_category VARCHAR(255) NOT NULL,
            lemma VARCHAR(255) NOT NULL
        )
        """
    # ---
    db_commit(query)
    # ---
    query = """
        CREATE TABLE IF NOT EXISTS wd_data_P11038 (
            id INT AUTO_INCREMENT PRIMARY KEY,
            wd_data_id VARCHAR(255) NOT NULL,
            value VARCHAR(255) NOT NULL,
            CONSTRAINT fk_wd_data FOREIGN KEY (wd_data_id) REFERENCES wd_data(wd_id) ON DELETE CASCADE,
            UNIQUE (wd_data_id, value)
        )
        """
    # ---
    db_commit(query)


def delete_all(table_name="p11038_lemmas"):
    # ---
    query = f"DELETE FROM {table_name}"
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
    rows = fetch_all("SELECT COUNT(*) AS total FROM p11038_lemmas")
    print(rows)
