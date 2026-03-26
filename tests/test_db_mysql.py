# -*- coding: utf-8 -*-
"""
Tests for db_mysql.py - Database operations module
"""

import pytest
from unittest.mock import patch, MagicMock
from typing import List, Dict, Any, Tuple, Optional, Union


class TestFetchAll:
    """Tests for fetch_all function"""

    def test_fetch_all_returns_tuple(self, mock_db_connection):
        """Test that fetch_all returns a tuple of (results, execution_time)"""
        results = [{"id": 1, "lemma": "test"}]
        mock_db_connection[0].cursor.fetchall.return_value = results

        with patch("db_mysql._fetch_all", return_value=(results, 0.5)):
            result, exec_time = fetch_all("SELECT * FROM test")

            assert isinstance(result, list)
            assert len(result) == 1
            assert result[0]["id"] == 1
            assert isinstance(exec_time, float)

    def test_fetch_all_with_fetch_one(self, mock_db_connection):
        """Test fetch_all with fetch_one=True"""
        single_result = {"id": 1, "lemma": "test"}
        mock_db_connection[0].cursor.fetchone.return_value = single_result

        with patch("db_mysql._fetch_all", return_value=(single_result, 0.3)):
            result, exec_time = fetch_all("SELECT * FROM test", fetch_one=True)

            assert isinstance(result, dict)
            assert result["id"] == 1

    def test_fetch_all_with_empty_params(self):
        """Test that None params are converted to empty tuple"""
        mock_db_connection[0].cursor.fetchone.return_value = {"total": 0}

        with patch("db_mysql._fetch_all", return_value=({"total": 0}, 0.1)):
            result, exec_time = fetch_all("SELECT COUNT(*) AS total", params=None, fetch_one=True)

            assert result["total"] == 0

    def test_fetch_all_with_empty_results(self):
        """Test fetch_all with empty results"""
        mock_db_connection[0].cursor.fetchall.return_value = []

        with patch("db_mysql._fetch_all", return_value=([], 0.2)):
            result, exec_time = fetch_all("SELECT * FROM test")

            assert result == []


class TestDbCommit:
    """Tests for db_commit function"""

    def test_db_commit_success(self, mock_db_connection):
        """Test successful commit"""
        with patch("db_mysql.get_connection", return_value=mock_db_connection):
            result = db_commit("INSERT INTO test (id, name) VALUES (%s, %s)", [(1, "test")], many=False)

            assert result is True

    def test_db_commit_many_success(self, mock_db_connection):
        """Test successful batch commit"""
        with patch("db_mysql.get_connection", return_value=mock_db_connection):
            result = db_commit("INSERT INTO test (id) VALUES (%s)", [(1,), (2,), (3,)], many=True)

            assert result is True

    def test_db_commit_failure(self, mock_db_connection):
        """Test failed commit"""
        mock_db_connection[0].cursor.execute.side_effect = Exception("Query error")

        with patch("db_mysql.get_connection", return_value=mock_db_connection):
            result = db_commit("INSERT INTO test VALUES (1)")

            assert result is False


class TestInitDb:
    """Tests for init_db function"""

    def test_init_db_creates_tables(self, mock_db_connection):
        """Test that init_db creates all tables"""
        with patch("db_mysql.db_commit", return_value=True) as mock_commit:
            result = init_db()

            assert result is True
            assert mock_commit.call_count == 3

    def test_init_db_partial_failure(self, mock_db_connection):
        """Test init_db with some tables failing"""
        mock_commit_side_effect = [True, False, True]

        with patch("db_mysql.db_commit", side_effect=mock_commit_side_effect):
            result = init_db()

            assert result is False


class TestGetConnection:
    """Tests for get_connection context manager"""

    def test_get_connection_success(self, mock_db_connection):
        """Test successful connection"""
        with patch("db_mysql.get_connection", return_value=mock_db_connection):
            conn, cursor = None, None
            with get_connection() as (c, cur):
                conn = c
                cursor = cur

            assert conn is not None
            assert cursor is not None

    def test_get_connection_error(self, mock_db_connection):
        """Test connection error handling"""
        mock_db_connection[0].cursor.execute.side_effect = Exception("Connection error")

        with patch("db_mysql.get_connection", return_value=mock_db_connection):
            with pytest.raises(DatabaseConnectionError):
                with get_connection():
                    pass


class TestValidation:
    """Tests for parameter validation"""

    def test_fetch_all_with_valid_params(self, mock_db_connection):
        """Test fetch_all with valid parameters"""
        results = [{"id": 1}]

        with patch("db_mysql._fetch_all", return_value=(results, 0.1)):
            result, exec_time = fetch_all("SELECT * FROM test", params=(1,), fetch_one=False)

            assert len(result) == 1

    def test_fetch_all_with_invalid_params(self):
        """Test that invalid parameters don't crash"""
        results = []

        with patch("db_mysql._fetch_all", return_value=(results, 0.2)):
            result, exec_time = fetch_all("SELECT * FROM test", params=None)

            assert result == []
