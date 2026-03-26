# -*- coding: utf-8 -*-
"""
Shared pytest fixtures for the Arabic Lexemes Analysis Tool
"""

import json
from unittest.mock import MagicMock, patch
import pytest


@pytest.fixture
def mock_sparql_bot():
    """Mock SPARQLBot instance for testing"""
    bot = MagicMock()
    bot.cache_enabled = True
    return bot


@pytest.fixture
def sample_sparql_results():
    """Sample SPARQL query results for testing"""
    return {
        "head": {"vars": ["lemma", "item", "categoryLabel", "count"]},
        "results": {
            "bindings": [
                {
                    "lemma": {"value": "كتب"},
                    "item": {"value": "/entity/Q123456"},
                    "categoryLabel": {"value": "اسم"},
                    "count": {"value": "5"},
                },
                {
                    "lemma": {"value": "قرأت"},
                    "item": {"value": "/entity/Q789012"},
                    "categoryLabel": {"value": "فعل"},
                    "count": {"value": "3"},
                },
            ]
        },
    }


@pytest.fixture
def mock_db_connection():
    """Mock database connection for testing"""
    conn = MagicMock()
    cursor = MagicMock()

    def mock_execute(query, params=None):
        cursor.fetchall.return_value = []
        cursor.fetchone.return_value = None
        return True

    cursor.execute.side_effect = mock_execute
    conn.cursor.return_value = cursor
    conn.commit.return_value = True
    return conn, cursor


@pytest.fixture
def sample_lemmas_data():
    """Sample lemmas data for testing"""
    return [
        {
            "id": 1,
            "lemma_id": 100,
            "lemma": "كتب",
            "pos": "اسم",
            "pos_cat": "45168",
            "sama_lemma_id": "",
            "sama_lemma": "",
        },
        {
            "id": 2,
            "lemma_id": 101,
            "lemma": "قرأت",
            "pos": "فعل",
            "pos_cat": "12815",
            "sama_lemma_id": 200,
            "sama_lemma": "اقرأ",
        },
    ]


@pytest.fixture
def sample_counts_data():
    """Sample count data for testing"""
    return {"all": 1500, "with": 850, "without": 650}


@pytest.fixture
def mock_request():
    """Mock Flask request object"""
    request = MagicMock()
    request.args = {"page": "1", "per_page": "20", "order": "DESC", "order_by": "lemma_id", "filter_data": "with"}
    return request


@pytest.fixture
def sample_pagination_params():
    """Sample pagination parameters"""
    return {"page": 1, "per_page": 20, "order": "DESC", "order_by": "lemma_id", "filter_data": "with"}


@pytest.fixture
def sample_db_response():
    """Sample database response for fetch_all"""
    return [{"total_rows": 1500, "count_has_value": 850}]


@pytest.fixture
def sample_wd_data():
    """Sample WD data for testing"""
    return [
        {"id": 1, "wd_id": "/entity/Q123456", "wd_id_category": "/category/Noun", "lemma": "كتب"},
        {"id": 2, "wd_id": "/entity/Q789012", "wd_id_category": "/category/Verb", "lemma": "قرأت"},
    ]


@pytest.fixture
def sample_p11038_response():
    """Sample P11038 count response"""
    return {"total_rows": 1500}
