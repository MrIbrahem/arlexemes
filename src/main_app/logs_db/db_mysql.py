import logging
import time
from contextlib import contextmanager
from typing import Any, List, Optional, Sequence, Tuple, Union

import pymysql
from pymysql import MySQLError

from .config_db import load_db_config

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

DB_CONFIG = load_db_config()


class DatabaseConnectionError(Exception):
    """Custom exception for database connection errors"""

    pass


class DatabaseQueryError(Exception):
    """Custom exception for database query errors"""

    pass


@contextmanager
def get_connection():
    """Context manager for database connections"""
    conn = None
    cursor = None
    try:
        conn = pymysql.connect(**DB_CONFIG)
        cursor = conn.cursor(pymysql.cursors.DictCursor)
        yield conn, cursor

    except MySQLError as e:
        logger.error(f"Database connection error: {e}")
        raise DatabaseConnectionError("Failed to connect to database") from e

    finally:
        if cursor is not None:
            cursor.close()
        if conn is not None:
            conn.close()


def db_commit(
    query: str,
    params: Optional[Union[Tuple[Any, ...], Sequence[Tuple[Any, ...]]]] = None,
    many: bool = False,
) -> bool:
    """Execute INSERT / UPDATE / DELETE queries with proper error handling"""
    try:
        with get_connection() as (conn, cursor):
            if many:
                cursor.executemany(query, params or [])
            else:
                cursor.execute(query, params or ())
            conn.commit()
            return True
    except MySQLError as e:
        logger.error(f"Database query error: {e}")
        return False
    except DatabaseConnectionError as e:
        logger.error(f"Database connection failed: {e}")
        return False


def init_db() -> bool:
    """Initialize database tables"""
    tables_queries = [
        {
            "name": "lemmas_p11038",
            "query": """
            CREATE TABLE IF NOT EXISTS `lemmas_p11038` (
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
            """,
        },
        {
            "name": "wd_data",
            "query": """
            CREATE TABLE IF NOT EXISTS `wd_data` (
                `id` int NOT NULL AUTO_INCREMENT,
                `wd_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
                `wd_id_category` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
                `lemma` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
                PRIMARY KEY (`id`),
                UNIQUE KEY `wd_id2` (`wd_id`),
                KEY `wd_id` (`wd_id`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            """,
        },
        {
            "name": "wd_data_p11038",
            "query": """
            CREATE TABLE IF NOT EXISTS `wd_data_p11038` (
                `id` int NOT NULL AUTO_INCREMENT,
                `wd_data_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
                `value` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
                PRIMARY KEY (`id`),
                UNIQUE KEY `wd_data_id` (`wd_data_id`,`value`),
                KEY `wd_data_id_value` (`wd_data_id`,`value`),
                CONSTRAINT `fk_wd_data` FOREIGN KEY (`wd_data_id`) REFERENCES `wd_data` (`wd_id`) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            """,
        },
    ]

    success_count = 0
    for table in tables_queries:
        if db_commit(table["query"]):
            success_count += 1
            logger.info(f"Table '{table['name']}' created successfully")
        else:
            logger.error(f"Failed to create table '{table['name']}'")

    return success_count == len(tables_queries)


def _fetch_all(query: str, params: Optional[Tuple] = None, fetch_one: bool = False) -> Union[List[dict], dict, None]:
    """Execute query and fetch results from MySQL database"""
    if params is None:
        params = ()

    try:
        with get_connection() as (_, cursor):
            cursor.execute(query, params)

            if fetch_one:
                result = cursor.fetchone()
                return result if result else None
            else:
                return cursor.fetchall()
    except MySQLError as e:
        logger.error(f"Database query error in _fetch_all: {e}")
        return [] if not fetch_one else None
    except DatabaseConnectionError as e:
        logger.error(f"Database connection failed in _fetch_all: {e}")
        return [] if not fetch_one else None


def fetch_all(
    query: str, params: Optional[Tuple] = None, fetch_one: bool = False
) -> Tuple[Union[List[dict], dict, None], float]:
    """Execute query and fetch results with execution time tracking"""
    # ---
    start_time = time.time()
    # ---
    result = _fetch_all(query, params=params, fetch_one=fetch_one)
    # ---
    db_exec_time = time.time() - start_time
    # ---
    return result, db_exec_time


# Example usage and testing
if __name__ == "__main__":
    # Test database connection and basic queries
    try:
        # Test basic query
        rows, db_exec_time = fetch_all("SELECT COUNT(*) AS total FROM lemmas_p11038")
        if rows:
            print(f"Database test successful. Total rows: {rows[0]['total']}")
            print(f"Query execution time: {db_exec_time:.4f} seconds")
        else:
            print("Database query returned no results")
    except Exception as e:
        print(f"Database test failed: {e}")
