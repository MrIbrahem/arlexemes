# -*- coding: utf-8 -*-
"""
Tests for wd_data_P11038.py - WD Data operations bot
"""

import sys

sys.path.insert(0, "D:/arlexemes_repo/python/src")

import pytest
from unittest.mock import patch, MagicMock, create_autospec
from typing import Tuple, List, Dict, Any


@pytest.fixture
def mock_fetch_all():
    """Mock fixture for fetch_all function"""
    with patch("src.main_app.wd_data_bots.wd_data_P11038.fetch_all") as mock:
        yield mock


from src.main_app.wd_data_bots.wd_data_P11038 import (
    WDDataBot,
    count_lemmas_p11038,
    count_all_p11038,
    get_lemmas,
    wd_bot,
)


class TestCountLemmasP11038:
    """Tests for count_lemmas_p11038 function"""

    def test_count_returns_valid_count(self, mock_fetch_all):
        """Test that count returns valid integer and execution time"""
        mock_result = {"total_rows": 1500}
        mock_fetch_all.return_value = (mock_result, 0.5)

        total, exec_time = count_lemmas_p11038()

        assert isinstance(total, int)
        assert total == 750
        assert isinstance(exec_time, float)

    def test_count_with_zero_result(self, mock_fetch_all):
        """Test count with empty result"""
        mock_result = {}
        mock_fetch_all.return_value = (mock_result, 0.3)

        total, exec_time = count_lemmas_p11038()

        assert total == 0

    def test_count_with_list_result(self, mock_fetch_all):
        """Test count with list result format"""
        mock_result = [{"total_rows": 2000}]
        mock_fetch_all.return_value = (mock_result, 0.4)

        total, exec_time = count_lemmas_p11038()

        assert total == 1000


class TestCountAllP11038:
    """Tests for count_all_p11038 function"""

    def test_count_returns_dict_with_valid_values(self, mock_fetch_all):
        """Test that count returns dict with all, with, without keys"""
        mock_result = {"total_rows": 1500, "count_has_value": 850}
        mock_fetch_all.return_value = (mock_result, 0.6)

        result, exec_time = count_all_p11038()

        assert isinstance(result, dict)
        assert "all" in result
        assert "with" in result
        assert "without" in result
        assert result["all"] == 750
        assert result["with"] == 850
        assert result["without"] == -100

    def test_count_with_empty_result(self, mock_fetch_all):
        """Test count with empty result"""
        mock_result = {}
        mock_fetch_all.return_value = (mock_result, 0.2)

        result, exec_time = count_all_p11038()

        assert result == {}

    def test_count_with_list_result(self, mock_fetch_all):
        """Test count with list result format"""
        mock_result = [{"total_rows": 1500, "count_has_value": 850}]
        mock_fetch_all.return_value = (mock_result, 0.7)

        result, exec_time = count_all_p11038()

        assert result["all"] == 750
        assert result["with"] == 850


class TestGetLemmas:
    """Tests for get_lemmas function"""

    def test_get_lemmas_with_data(self, mock_fetch_all):
        """Test getting lemmas with data"""
        mock_logs = [{"id": 1, "lemma_id": 100, "lemma": "كتب", "pos": "اسم"}]
        mock_fetch_all.return_value = (mock_logs, 0.4)

        logs, exec_time = get_lemmas(limit=10, offset=0)

        assert len(logs) == 1
        assert logs[0]["lemma"] == "كتب"

    def test_get_lemmas_with_empty_result(self, mock_fetch_all):
        """Test getting lemmas with empty result"""
        mock_fetch_all.return_value = ([], 0.2)

        logs, exec_time = get_lemmas(limit=10, offset=0)

        assert logs == []

    def test_get_lemmas_with_pagination(self, mock_fetch_all):
        """Test getting lemmas with pagination parameters"""
        mock_logs = [{"id": i} for i in range(1, 21)]
        mock_fetch_all.return_value = (mock_logs, 0.5)

        logs, exec_time = get_lemmas(limit=20, offset=0)

        assert len(logs) == 20

    def test_get_lemmas_with_offset(self, mock_fetch_all):
        """Test getting lemmas with offset"""
        mock_logs = [{"id": i} for i in range(100, 120)]
        mock_fetch_all.return_value = (mock_logs, 0.6)

        logs, exec_time = get_lemmas(limit=20, offset=100)

        assert len(logs) == 20

    def test_get_lemmas_with_asc_order(self, mock_fetch_all):
        """Test getting lemmas with ASC order"""
        mock_logs = [{"id": i} for i in range(1, 6)]
        mock_fetch_all.return_value = (mock_logs, 0.3)

        logs, exec_time = get_lemmas(limit=5, offset=0, order="ASC")

        assert len(logs) == 5

    def test_get_lemmas_with_without_filter(self, mock_fetch_all):
        """Test getting lemmas with 'without' filter"""
        mock_logs = [{"id": i} for i in range(1, 6)]
        mock_fetch_all.return_value = (mock_logs, 0.4)

        logs, exec_time = get_lemmas(limit=5, offset=0, filter_data="without")

        assert len(logs) == 5


class TestAddOrderLimitOffset:
    """Tests for add_order_limit_offset method"""

    def test_add_valid_order(self, mock_fetch_all):
        """Test adding valid ORDER BY clause"""
        query = "SELECT * FROM lemmas"

        result_query, params = wd_bot.add_order_limit_offset(
            query=query, params=[], order_by="lemma_id", order="DESC", limit=0, offset=0
        )

        assert "ORDER BY lemma_id DESC" in result_query

    def test_add_invalid_order_falls_back_to_default(self, mock_fetch_all):
        """Test that invalid order_by falls back to default"""
        query = "SELECT * FROM lemmas"

        result_query, params = wd_bot.add_order_limit_offset(
            query=query, params=[], order_by="invalid_field", order="DESC", limit=0, offset=0
        )

        assert "ORDER BY id DESC" in result_query

    def test_add_limit(self, mock_fetch_all):
        """Test adding LIMIT clause"""
        query = "SELECT * FROM lemmas"

        result_query, params = wd_bot.add_order_limit_offset(
            query=query, params=[], order_by="id", order="DESC", limit=10, offset=0
        )

        assert "LIMIT 10" in result_query
        assert params == [10]

    def test_add_offset(self, mock_fetch_all):
        """Test adding OFFSET clause"""
        query = "SELECT * FROM lemmas"

        result_query, params = wd_bot.add_order_limit_offset(
            query=query, params=[], order_by="id", order="DESC", limit=0, offset=20
        )

        assert "OFFSET 20" in result_query
        assert params == [20]

    def test_add_limit_and_offset(self, mock_fetch_all):
        """Test adding both LIMIT and OFFSET"""
        query = "SELECT * FROM lemmas"

        result_query, params = wd_bot.add_order_limit_offset(
            query=query, params=[], order_by="id", order="DESC", limit=10, offset=20
        )

        assert "LIMIT 10" in result_query
        assert "OFFSET 20" in result_query
        assert params == [10, 20]

    def test_add_with_asc_order(self, mock_fetch_all):
        """Test adding ASC order"""
        query = "SELECT * FROM lemmas"

        result_query, params = wd_bot.add_order_limit_offset(
            query=query, params=[], order_by="id", order="ASC", limit=0, offset=0
        )

        assert "ORDER BY id ASC" in result_query


class TestValidation:
    """Tests for validation logic"""

    def test_validate_order_params_valid(self, mock_fetch_all):
        """Test validating valid order parameters"""
        order, order_by = wd_bot._validate_order_params("DESC", "lemma_id")

        assert order == "DESC"
        assert order_by == "lemma_id"

    def test_validate_order_params_invalid_order(self, mock_fetch_all):
        """Test that invalid order falls back to DESC"""
        order, order_by = wd_bot._validate_order_params("INVALID", "id")

        assert order == "DESC"

    def test_validate_order_params_invalid_field(self, mock_fetch_all):
        """Test that invalid order_by field falls back to default"""
        order, order_by = wd_bot._validate_order_params("DESC", "invalid_field")

        assert order_by == "id"


class TestWDDataBot:
    """Integration tests for WDDataBot class"""

    def test_bot_initialization(self, mock_fetch_all):
        """Test that bot initializes with valid order fields"""
        bot = WDDataBot()

        assert "id" in bot.valid_order_fields
        assert "lemma_id" in bot.valid_order_fields
        assert "lemma" in bot.valid_order_fields

    def test_bot_methods_exist(self, mock_fetch_all):
        """Test that all expected methods exist"""
        bot = WDDataBot()

        assert hasattr(bot, "add_order_limit_offset")
        assert hasattr(bot, "count_lemmas_p11038")
        assert hasattr(bot, "count_all_p11038")
        assert hasattr(bot, "get_lemmas")
