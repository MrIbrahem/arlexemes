# -*- coding: utf-8 -*-

import logs_db  # logs_db.change_db_path(file)
from types import SimpleNamespace

db_tables = ["P11038_lemmas"]

pos_cat_data = {
    "اسم": 45168,
    "فعل": 12815,
    "كلمة وظيفية": 483
}


def get_args(request):
    db_path = request.args.get("db_path")
    # ---
    page = request.args.get("page", 1, type=int)
    # ---
    per_page = request.args.get("per_page", 10, type=int)
    order = request.args.get("order", "desc").upper()
    order_by = request.args.get("order_by", "response_count")
    # ---
    filter_data = request.args.get("filter_data", "")
    # ---
    table_name = request.args.get("table_name", "")
    # ---
    if table_name not in db_tables:
        table_name = "P11038_lemmas"
    # ---
    # Validate values
    page = max(1, page)
    per_page = max(1, min(200, per_page))

    # Offset for pagination
    offset = (page - 1) * per_page
    # ---
    dbs = []
    # ---
    if db_path:
        dbs = logs_db.change_db_path(db_path)
        db_path = db_path if db_path in dbs else "new_logs.db"
    # ---
    args = {
        "dbs": dbs,
        "db_path": db_path,
        "per_page": per_page,
        "page": page,
        "offset": offset,
        "order": order,
        "order_by": order_by,
        "table_name": table_name,
        "filter_data": filter_data,
    }
    # ---
    return SimpleNamespace(**args)


def make_Pagination(args, total_logs):
    total_pages = (total_logs + args.per_page - 1) // args.per_page
    start_log = (args.page - 1) * args.per_page + 1
    end_log = min(args.page * args.per_page, total_logs)
    start_page = max(1, args.page - 2)
    end_page = min(start_page + 4, total_pages)
    start_page = max(1, end_page - 4)

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
        "Lid",
        "sama_lemma_id",
        "sama_lemma",
    ]
    # ---
    order_by = "lemma_id" if args.order_by not in order_by_types else args.order_by
    # ---
    logs = logs_db.get_all(args.per_page, args.offset, args.order, order_by=order_by, table_name=args.table_name)
    # ---
    # Convert to list of dicts
    log_list = logs
    # ---
    total_logs = logs_db.count_all(table_name=args.table_name)
    # ---
    table_new = {
        "db_path": args.db_path,
        "table_name": args.table_name,
        "total_logs": f"{total_logs:,}",
        "order": args.order,
        "order_by": order_by,
        "per_page": args.per_page,
        "page": args.page,
        "filter_data": args.filter_data,
    }
    # ---
    # Pagination calculations
    Pagination = make_Pagination(args, total_logs)
    # ---
    table_new.update(Pagination)
    # ---
    # if "All" not in status_table: status_table.append("All")
    # ---
    # if "Category" not in status_table: status_table.append("Category")
    # ---
    result = {
        "dbs": args.dbs,
        "logs": log_list,
        "order_by_types": order_by_types,
        "tab": table_new,
        "status_table": [],
    }
    # ---
    return result
