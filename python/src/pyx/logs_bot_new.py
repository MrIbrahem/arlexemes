# -*- coding: utf-8 -*-

from .logs_db import wd_data_P11038
from types import SimpleNamespace

pos_cat_data = {
    "اسم": 45168,
    "فعل": 12815,
    "كلمة وظيفية": 483
}


def get_args(request):
    # ---
    page = request.args.get("page", 1, type=int)
    # ---
    per_page = request.args.get("per_page", 200, type=int)
    order = request.args.get("order", "desc").upper()
    order_by = request.args.get("order_by", "response_count", type=str)
    # ---
    filter_data = request.args.get("filter_data", "with", type=str)
    # ---
    # Validate values
    page = max(1, page)
    per_page = max(1, min(5000, per_page))

    # Offset for pagination
    offset = (page - 1) * per_page
    # ---
    args = {
        "per_page": per_page,
        "page": page,
        "offset": offset,
        "order": order,
        "order_by": order_by,
        "filter_data": filter_data,
    }
    # ---
    return SimpleNamespace(**args)


def make_Pagination(args, total_logs):
    # ---
    number_of_pages = 6
    # ---
    number_start = number_of_pages - 2
    number_end = number_start // 2
    # ---
    total_pages = (total_logs + args.per_page - 1) // args.per_page
    start_log = (args.page - 1) * args.per_page + 1
    end_log = min(args.page * args.per_page, total_logs)
    # ---
    # start_page = max(1, args.page - 4)
    # end_page = min(start_page + 8, total_pages)
    # start_page = max(1, end_page - 8)
    # ---
    start_page = max(1, args.page - number_end)
    end_page = min(start_page + number_start, total_pages)
    start_page = max(1, end_page - number_start)

    return {
        "total_pages": total_pages,
        "start_log": start_log,
        "end_log": end_log,
        "start_page": start_page,
        "end_page": end_page,
    }


def find_logs(request):
    # ---
    args = get_args(request)
    # ---
    order_by_types = [
        "id",
        "lemma_id",
        "lemma",
        "pos",
        "pos_cat",
        "sama_lemma_id",
        "sama_lemma",
        "vi_wd_id",
        "vi_wd_id_category",
        "vi_lemma",
        "vi_value",
    ]
    # ---
    order_by = "lemma_id" if args.order_by not in order_by_types else args.order_by
    # ---
    logs, db_exec_time = wd_data_P11038.get_lemmas(args.per_page, args.offset, args.order, order_by=order_by, filter_data=args.filter_data)
    # ---
    total_logs_data, _db_exec_time = wd_data_P11038.count_all_p11038()
    # ---
    all_logs = total_logs_data.get("all", 0)
    # ---
    if args.filter_data in total_logs_data:
        all_logs = total_logs_data[args.filter_data]
    # ---
    table_new = {
        "order": args.order,
        "order_by": order_by,
        "per_page": args.per_page,
        "page": args.page,
        "filter_data": args.filter_data,
    }
    # ---
    Pagination = make_Pagination(args, all_logs)
    # ---
    table_new.update(Pagination)
    # ---
    total_logs_data_formated = {key: f"{value:,}" for key, value in total_logs_data.items()}
    # ---
    result = {
        "db_exec_time": db_exec_time,
        "logs": logs,
        "order_by_types": order_by_types,
        "tab": table_new,
        "total_logs_data": total_logs_data_formated,
        "status_table": [],
    }
    # ---
    return result
