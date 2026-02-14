# -*- coding: utf-8 -*-
"""
Data bot for handling WD data operations
Provides database operations for lemmas and P11038 data
"""

import logging
from typing import Dict, List, Tuple, Any
from dataclasses import dataclass
from ..logs_db.db_mysql import fetch_all

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@dataclass
class QueryParams:
    """Parameters for database queries"""

    limit: int = 0
    offset: int = 0
    order: str = "DESC"
    order_by: str = "id"
    filter_data: str = "with"


class DataBotError(Exception):
    """Custom exception for data bot errors"""

    pass


class WDDataBot:
    """Bot for handling WD data operations"""

    def __init__(self):
        self.valid_order_fields = [
            "id",
            "lemma_id",
            "lemma",
            "pos",
            "pos_cat",
            "sama_lemma_id",
            "sama_lemma",
        ]

    def _validate_order_params(self, order: str, order_by: str) -> Tuple[str, str]:
        """Validate and normalize order parameters"""
        order = order.upper()
        if order not in ["ASC", "DESC"]:
            order = "DESC"

        if order_by in self.valid_order_fields:
            return order, order_by
        else:
            logger.warning(f"Invalid order_by field: {order_by}, using default 'id'")
            return order, "id"

    def add_order_limit_offset(
        self,
        query: str,
        params: List,
        order_by: str,
        order: str,
        limit: int,
        offset: int,
    ) -> Tuple[str, List]:
        """Add ORDER BY, LIMIT, and OFFSET to query"""
        order, valid_order_by = self._validate_order_params(order, order_by)

        if valid_order_by:
            query += f" ORDER BY {valid_order_by} {order}"

        if limit > 0:
            query += " LIMIT %s"
            params.append(limit)

        if offset > 0:
            query += " OFFSET %s"
            params.append(offset)

        return query, params

    def count_lemmas_p11038(self) -> Tuple[int, float]:
        """Count total lemmas in P11038 table"""
        query = "SELECT COUNT(*) AS total_rows FROM lemmas_p11038"
        result, db_exec_time = fetch_all(query, [], fetch_one=True)

        if not result:
            return 0, db_exec_time

        # Handle different result formats
        if isinstance(result, list):
            result = result[0]

        total_rows = int(result["total_rows"])
        return total_rows, db_exec_time

    def count_all_p11038(self) -> Tuple[Dict[str, int], float]:
        """Count all P11038 data with different filters"""
        query = """
            SELECT
                SUM(total_rows) AS total_rows,
                SUM(count_has_value) AS count_has_value
            FROM (
                SELECT
                    COUNT(*) AS total_rows,
                    COUNT(CASE WHEN wdp.value IS NOT NULL THEN 1 END) AS count_has_value
                FROM lemmas_p11038 AS l
                LEFT JOIN wd_data_p11038 AS wdp ON l.lemma_id = wdp.value

                UNION ALL

                SELECT
                    COUNT(*) AS total_rows,
                    COUNT(CASE WHEN wdp.value IS NOT NULL THEN 1 END) AS count_has_value
                FROM lemmas_p11038 AS l
                LEFT JOIN wd_data_p11038 AS wdp ON l.sama_lemma_id = wdp.value
            ) AS combined
        """
        # _query_2 has less result
        _query_2 = """
            SELECT
                (SELECT COUNT(*) FROM lemmas_p11038) AS total_rows,
                (
                  SELECT COUNT(DISTINCT l.id)
                  FROM lemmas_p11038 AS l
                  LEFT JOIN wd_data_p11038 AS w1 ON l.lemma_id = w1.value
                  LEFT JOIN wd_data_p11038 AS w2 ON l.sama_lemma_id = w2.value
                  WHERE w1.value IS NOT NULL OR w2.value IS NOT NULL
                ) AS count_has_value
        """
        result, _db_exec_time = fetch_all(query, [], fetch_one=True)

        if not result:
            return {}, _db_exec_time

        # Handle different result formats
        if isinstance(result, list):
            result = result[0]

        total_rows = int(result["total_rows"]) // 2
        count_has_value = int(result["count_has_value"])

        data = {
            "all": total_rows,
            "with": count_has_value,
            "without": total_rows - count_has_value,
        }

        logger.info(
            f"Counts - All: {total_rows}, With: {count_has_value}, Without: {data['without']}"
        )

        return data, _db_exec_time

    def get_lemmas(
        self,
        limit: int = 0,
        offset: int = 0,
        order: str = "DESC",
        order_by: str = "id",
        filter_data: str = "with",
    ) -> Tuple[List[Dict[str, Any]], float]:
        """Get lemmas with optional filtering and pagination"""

        # Base query for data with P11038 values
        base_query = """
            SELECT
                l.id, l.lemma_id, l.lemma, l.pos, l.pos_cat, l.sama_lemma_id, l.sama_lemma,
                w.wd_id as vi_wd_id, w.wd_id_category as vi_wd_id_category,
                w.lemma as vi_lemma, wdp.value as vi_value
            FROM lemmas_p11038 AS l
            JOIN wd_data_p11038 AS wdp ON l.lemma_id = wdp.value
            JOIN wd_data AS w ON wdp.wd_data_id = w.wd_id

            UNION ALL

            SELECT
                l.id, l.lemma_id, l.lemma, l.pos, l.pos_cat, l.sama_lemma_id, l.sama_lemma,
                w.wd_id as vi_wd_id, w.wd_id_category as vi_wd_id_category,
                w.lemma as vi_lemma, wdp.value as vi_value
            FROM lemmas_p11038 AS l
            JOIN wd_data_p11038 AS wdp ON l.sama_lemma_id = wdp.value
            JOIN wd_data AS w ON wdp.wd_data_id = w.wd_id
        """

        # Query for data without P11038 values
        query_without = """
            SELECT
                l.id, l.lemma_id, l.lemma, l.pos, l.pos_cat, l.sama_lemma_id, l.sama_lemma
            FROM lemmas_p11038 AS l
            LEFT JOIN wd_data_p11038 AS wdp ON l.lemma_id = wdp.value
            LEFT JOIN wd_data_p11038 AS wdp2 ON l.sama_lemma_id = wdp2.value
            WHERE wdp.value IS NULL AND wdp2.value IS NULL
        """

        # Select appropriate query based on filter
        query = base_query if filter_data != "without" else query_without

        params = []
        query, params = self.add_order_limit_offset(
            query, params, order_by, order, limit, offset
        )

        logs, db_exec_time = fetch_all(query, params)
        logger.info(f"Retrieved {len(logs)} lemmas in {db_exec_time:.3f}s")
        return logs, db_exec_time


# Global instance for backward compatibility
wd_bot = WDDataBot()

add_order_limit_offset = wd_bot.add_order_limit_offset
count_lemmas_p11038 = wd_bot.count_lemmas_p11038
count_all_p11038 = wd_bot.count_all_p11038
get_lemmas = wd_bot.get_lemmas
