# -*- coding: utf-8 -*-
"""
Logs bot for handling log operations with filtering and pagination
"""

import logging
from typing import Dict, Any, Tuple, List
from dataclasses import dataclass
from flask import Request
# from types import SimpleNamespace

from pyx.wd_data_bots import get_lemmas, count_all_p11038

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# POS category data (could be moved to config)
POS_CAT_DATA = {
    "اسم": 45168,
    "فعل": 12815,
    "كلمة وظيفية": 483
}


@dataclass
class LogQueryParams:
    """Parameters for log queries"""
    page: int = 1
    per_page: int = 200
    order: str = "DESC"
    order_by: str = "lemma_id"
    filter_data: str = "with"

    def __post_init__(self):
        """Validate and normalize parameters"""
        self.page = max(1, self.page)
        self.per_page = max(1, min(5000, self.per_page))
        self.order = self.order.upper()

        if self.order not in ["ASC", "DESC"]:
            self.order = "DESC"


class LogsBot:
    """Bot for handling log operations with filtering and pagination"""

    def __init__(self):
        self.valid_order_fields = [
            "id", "lemma_id", "lemma", "pos", "pos_cat",
            "sama_lemma_id", "sama_lemma", "lemma_id"
        ]
        self.pos_cat_data = POS_CAT_DATA

    def _safe_int(self, value, default=0):
        try:
            return int(value)
        except (TypeError, ValueError):
            return default

    def get_query_params(self, request: Request) -> LogQueryParams:
        """Extract and validate query parameters from request"""
        params = LogQueryParams(
            page=self._safe_int(request.args.get("page", 1), 1),
            per_page=self._safe_int(request.args.get("per_page", 200), 200),
            order=request.args.get("order", "DESC"),
            order_by=request.args.get("order_by", "lemma_id"),
            filter_data=request.args.get("filter_data", "with")

        )
        return params

    def create_pagination_data(self, params: LogQueryParams,
                               total_logs: int) -> Dict[str, int]:
        """Create pagination data based on request arguments and total logs"""
        total_pages = (total_logs + params.per_page - 1) // params.per_page
        start_log = (params.page - 1) * params.per_page + 1
        end_log = min(params.page * params.per_page, total_logs)

        # Calculate page range for display
        num_displayed_pages = 5
        half_displayed = num_displayed_pages // 2

        start_page = max(1, params.page - half_displayed)
        end_page = min(total_pages, start_page + num_displayed_pages - 1)
        start_page = max(1, end_page - num_displayed_pages + 1)

        return {
            "total_pages": total_pages,
            "start_log": start_log,
            "end_log": end_log,
            "start_page": start_page,
            "end_page": end_page,
        }

    def validate_order_by(self, order_by: str) -> str:
        """Validate and normalize order_by parameter"""
        if order_by in self.valid_order_fields:
            return order_by
        else:
            logger.warning(f"Invalid order_by field: {order_by}, using default 'lemma_id'")
            return "lemma_id"

    def get_lemmas_with_params(self, params: LogQueryParams) -> Tuple[List[Dict[str, Any]], float]:
        """Get lemmas with specified parameters"""
        validated_order_by = self.validate_order_by(params.order_by)

        logs, db_exec_time = get_lemmas(
            limit=params.per_page,
            offset=(params.page - 1) * params.per_page,
            order=params.order,
            order_by=validated_order_by,
            filter_data=params.filter_data
        )
        return logs, db_exec_time

    def format_counts(self, counts: Dict[str, int]) -> Dict[str, str]:
        """Format counts with thousand separators"""
        return {key: f"{value:,}" for key, value in counts.items()}

    def find_logs(self, request: Request) -> Tuple[Dict[str, Any], float]:
        """Main method to find logs with filtering and pagination"""
        # Get query parameters
        params = self.get_query_params(request)

        # Get filtered lemmas
        logs, db_exec_time = self.get_lemmas_with_params(params)

        # Get total counts
        total_logs_data, _db_exec_time = count_all_p11038()

        # Get total logs for current filter
        all_logs = total_logs_data.get("all", 0)
        if params.filter_data in total_logs_data:
            all_logs = total_logs_data[params.filter_data]

        # Create pagination data
        pagination_data = self.create_pagination_data(params, all_logs)

        # Prepare request and pagination parameters
        request_and_pagination_params = {
            "order": params.order,
            "order_by": params.order_by,
            "per_page": params.per_page,
            "page": params.page,
            "filter_data": params.filter_data,
        }

        # Add pagination data to parameters
        request_and_pagination_params.update(pagination_data)

        # Format counts for display
        formatted_counts = self.format_counts(total_logs_data)

        # Build result
        result = {
            "count_all_p11038_db_time": _db_exec_time,  # Legacy compatibility
            "logs": logs,
            "valid_order_fields": self.valid_order_fields,
            "tab": request_and_pagination_params,
            "total_logs_data": formatted_counts,
            "status_table": [],
        }

        logger.info(f"Retrieved {len(logs)} logs for page {params.page}")
        return result, db_exec_time


# Global instance for backward compatibility
bot_new = LogsBot()


find_logs = bot_new.find_logs
