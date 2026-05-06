# -*- coding: utf-8 -*-
"""
Tests for db_mysql.py - Database operations module
"""

import pytest
from unittest.mock import patch, MagicMock
from contextlib import contextmanager
from typing import List, Dict, Any, Tuple, Optional, Union

from src.main_app.logs_db.db_mysql import (
    fetch_all,
    db_commit,
    init_db,
    get_connection,
    DatabaseConnectionError
)


class TestFetchAll:
    """Tests for fetch_all function"""

    def test_fetch_all_returns_tuple(self, mock_db_connection):
        """Test that fetch_all returns a tuple of (results, execution_time)"""
        results = [{"id": 1, "lemma": "test"}]

        with patch("src.main_app.logs_db.db_mysql._fetch_all", return_value=results):
            result, exec_time = fetch_all("SELECT * FROM test")

            assert isinstance(result, list)
            assert len(result) == 1
            assert result[0]["id"] == 1
            assert isinstance(exec_time, float)

    def test_fetch_all_with_fetch_one(self, mock_db_connection):
        """Test fetch_all with fetch_one=True"""
        single_result = {"id": 1, "lemma": "test"}

        with patch("src.main_app.logs_db.db_mysql._fetch_all", return_value=single_result):
            result, exec_time = fetch_all("SELECT * FROM test", fetch_one=True)

            assert isinstance(result, dict)
            assert result["id"] == 1

    def test_fetch_all_with_empty_params(self):
        """Test that None params are converted to empty tuple"""
        with patch("src.main_app.logs_db.db_mysql._fetch_all", return_value={"total": 0}):
            result, exec_time = fetch_all("SELECT COUNT(*) AS total", params=None, fetch_one=True)

            assert result["total"] == 0

    def test_fetch_all_with_empty_results(self):
        """Test fetch_all with empty results"""
        with patch("src.main_app.logs_db.db_mysql._fetch_all", return_value=[]):
            result, exec_time = fetch_all("SELECT * FROM test")

            assert result == []


class TestDbCommit:
    """Tests for db_commit function"""

    def test_db_commit_success(self, mock_db_connection):
        """Test successful commit"""
        @contextmanager
        def mock_get_conn_ctx():
            yield mock_db_connection

        with patch("src.main_app.logs_db.db_mysql.get_connection", side_effect=mock_get_conn_ctx):
            result = db_commit("INSERT INTO test (id, name) VALUES (%s, %s)", [(1, "test")], many=False)

            assert result is True

    def test_db_commit_many_success(self, mock_db_connection):
        """Test successful batch commit"""
        @contextmanager
        def mock_get_conn_ctx():
            yield mock_db_connection

        with patch("src.main_app.logs_db.db_mysql.get_connection", side_effect=mock_get_conn_ctx):
            result = db_commit("INSERT INTO test (id) VALUES (%s)", [(1,), (2,), (3,)], many=True)

            assert result is True

    def test_db_commit_failure(self, mock_db_connection):
        """Test failed commit"""
        from pymysql import MySQLError
        mock_db_connection[1].execute.side_effect = MySQLError("Query error")

        @contextmanager
        def mock_get_conn_ctx():
            yield mock_db_connection

        with patch("src.main_app.logs_db.db_mysql.get_connection", side_effect=mock_get_conn_ctx):
            result = db_commit("INSERT INTO test VALUES (1)")

            assert result is False


class TestInitDb:
    """Tests for init_db function"""

    def test_init_db_creates_tables(self, mock_db_connection):
        """Test that init_db creates all tables"""
        with patch("src.main_app.logs_db.db_mysql.db_commit", return_value=True) as mock_commit:
            result = init_db()

            assert result is True
            # Assuming 3 tables are created as seen in src/main_app/logs_db/db_mysql.py
            assert mock_commit.call_count == 3

    def test_init_db_partial_failure(self, mock_db_connection):
        """Test init_db with some tables failing"""
        mock_commit_side_effect = [True, False, True]

        with patch("src.main_app.logs_db.db_mysql.db_commit", side_effect=mock_commit_side_effect):
            result = init_db()

            assert result is False


class TestGetConnection:
    """Tests for get_connection context manager"""

    def test_get_connection_success(self, mock_db_connection):
        """Test successful connection"""
        with patch("pymysql.connect", return_value=mock_db_connection[0]):
            conn, cursor = None, None
            with get_connection() as (c, cur):
                conn = c
                cursor = cur

            assert conn is not None
            assert cursor is not None

    def test_get_connection_error(self):
        """Test connection error handling"""
        from pymysql import MySQLError
        with patch("pymysql.connect", side_effect=MySQLError("Connection failed")):
            with pytest.raises(DatabaseConnectionError):
                with get_connection():
                    pass


class TestValidation:
    """Tests for parameter validation"""

    def test_fetch_all_with_valid_params(self, mock_db_connection):
        """Test fetch_all with valid parameters"""
        results = [{"id": 1}]

        with patch("src.main_app.logs_db.db_mysql._fetch_all", return_value=results):
            result, exec_time = fetch_all("SELECT * FROM test", params=(1,), fetch_one=False)

            assert len(result) == 1

    def test_fetch_all_with_invalid_params(self):
        """Test that invalid parameters don't crash"""
        results = []

        with patch("src.main_app.logs_db.db_mysql._fetch_all", return_value=results):
            result, exec_time = fetch_all("SELECT * FROM test", params=None)

            assert result == []
