# -*- coding: utf-8 -*-
"""

from .db import db_commit, init_db, fetch_all

"""
import os
import sqlite3
from pathlib import Path

HOME = os.getenv("HOME")

main_path = Path(__file__).parent.parent.parent
# ---
if HOME:
    main_path = HOME + "/www/python/dbs"
# ---
db_path = f"{str(main_path)}/new_logs.db"

db_path_main = {1: str(db_path)}


def db_commit(query, params=[], many=False):
    try:
        with sqlite3.connect(db_path_main[1]) as conn:
            cursor = conn.cursor()

            if many:  # في حالة إذا كانت هناك العديد من المدخلات
                cursor.executemany(query, params)  # استخدام executemany لإدخال العديد من السجلات
            else:
                cursor.execute(query, params)  # استخدام execute للإدخال الفردي

        conn.commit()
        return True

    except sqlite3.Error as e:
        print(f"init_db Database error: {e}")
        return e


def init_db():
    query = """
        CREATE TABLE IF NOT EXISTS p11038_lemmas (
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
        )
        """
    # ---
    db_commit(query)
    # ---
    query = """
        CREATE TABLE IF NOT EXISTS wd_data (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            wd_id TEXT NOT NULL UNIQUE,
            wd_id_category TEXT NOT NULL,
            lemma TEXT NOT NULL
        )
        """
    # ---
    db_commit(query)
    # ---
    query = """
        CREATE TABLE IF NOT EXISTS wd_data_p11038 (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            wd_data_id TEXT NOT NULL,
            value TEXT NOT NULL,
            FOREIGN KEY(wd_data_id) REFERENCES wd_data(wd_id) ON DELETE CASCADE,
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


def fetch_all(query, params=[], fetch_one=False):
    try:
        with sqlite3.connect(db_path_main[1]) as conn:
            # Set row factory to return rows as dictionaries
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()

            # Execute the query
            cursor.execute(query, params)

            # Fetch results
            if fetch_one:
                row = cursor.fetchone()
                logs = dict(row) if row else None  # Convert to dictionary
            else:
                rows = cursor.fetchall()
                logs = [dict(row) for row in rows]  # Convert all rows to dictionaries

    except sqlite3.Error as e:
        print(f"Database error in fetch_all: {e}")
        if "no such table" in str(e):
            init_db()
        else:
            print(query)
        logs = []

    return logs
