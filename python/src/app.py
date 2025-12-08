# -*- coding: utf-8 -*-
"""
Flask application for the Arabic lexemes project
Main entry point for the web application
"""

import sys
import time
from typing import Dict, Tuple, Any
from dataclasses import dataclass
from functools import wraps
from flask import Flask, render_template, request, Response, session, g
import json

from pyx import logs_bot_new
from pyx.wd_data_bots.wd_data_P11038 import get_lemmas, count_all_p11038
from pyx.sparql_bots import sparql_bot
from pyx.sparql_bots.render import render_duplicate_by_category, render_duplicate, render_sparql_P11038_grouped
from pyx.bots.not_in_db_bot import get_not_in_db


@dataclass
class RequestParams:
    """Data class for request parameters"""
    limit: int = 10000
    offset: int = 0
    order: str = "desc"
    order_by: str = "id"
    filter_data: str = "with"


class AppConfig:
    """Configuration constants for the application"""
    DEFAULT_LIMIT = 10000
    DEFAULT_OFFSET = 0
    DEFAULT_ORDER = "desc"
    DEFAULT_ORDER_BY = "id"
    DEFAULT_FILTER_DATA = "with"


def track_performance(func):
    """Decorator to track function execution time"""
    @wraps(func)
    def wrapper(*args, **kwargs):
        if hasattr(g, 'start_time'):
            start_time = time.time()
            result = func(*args, **kwargs)
            execution_time = time.time() - start_time
            g.load_time = execution_time
            return result
        return func(*args, **kwargs)
    return wrapper


app = Flask(__name__)


@app.before_request
def before_request() -> None:
    """Initialize request start time for performance tracking"""
    g.start_time = time.time()
    g.load_time = 0.0


@app.after_request
def after_request(response: Response) -> Response:
    """Add performance metrics to response"""
    if hasattr(g, 'start_time'):
        g.load_time = time.time() - g.start_time
    return response


@app.context_processor
def inject_load_time() -> Dict[str, float]:
    """Inject load time into template context"""
    load_time = getattr(g, 'load_time', 0.0)
    return dict(load_time=load_time)


def jsonify(data: Dict[str, Any], **kwargs) -> Response:
    """Create JSON response with performance metrics"""
    execution_time = 0.0
    if hasattr(g, 'start_time'):
        execution_time = time.time() - g.start_time

    result = {
        'load_time': round(execution_time, 3),
        'data': data
    }

    result.update(kwargs)

    response_json = json.dumps(result, ensure_ascii=False, indent=2, separators=(',', ':'))
    return Response(response=response_json, content_type="application/json; charset=utf-8")


# API Endpoints
@app.route("/api/duplicate2", methods=["GET"])
@track_performance
def duplicate2_api() -> Response:
    """API endpoint for duplicate data"""
    data, sparql_exec_time = render_duplicate()
    return jsonify(data, sparql_exec_time=sparql_exec_time, len_result=len(data))


@app.route("/api/wd_data_count", methods=["GET"])
@track_performance
def wd_data_api_count() -> Response:
    """API endpoint for WD data counts"""
    _filter_data = request.args.get("filter_data", "all", type=str)
    counts, db_exec_time = count_all_p11038()
    return jsonify(counts, db_exec_time=db_exec_time)


@app.route("/api/wd_data", methods=["GET"])
@track_performance
def wd_data_api() -> Response:
    """API endpoint for WD data with pagination"""
    params = RequestParams(
        limit=int(request.args.get('limit', AppConfig.DEFAULT_LIMIT)),
        offset=int(request.args.get('offset', AppConfig.DEFAULT_OFFSET)),
        order=request.args.get("order", AppConfig.DEFAULT_ORDER).upper(),
        order_by=request.args.get("order_by", AppConfig.DEFAULT_ORDER_BY),
        filter_data=request.args.get("filter_data", AppConfig.DEFAULT_FILTER_DATA)
    )

    all_result, db_exec_time = get_lemmas(
        limit=params.limit,
        offset=params.offset,
        order=params.order,
        order_by=params.order_by,
        filter_data=params.filter_data
    )
    return jsonify(all_result, db_exec_time=db_exec_time)


@app.route("/api/not_in_db", methods=["GET"])
@track_performance
def not_in_db_api() -> Response:
    """API endpoint for items not in database"""
    result, sparql_exec_time, db_exec_time = get_not_in_db()
    return jsonify(result, db_exec_time=db_exec_time, sparql_exec_time=sparql_exec_time)


@app.route("/api/logs_new", methods=["GET"])
@track_performance
def logs_new_api() -> Response:
    """API endpoint for logs with filtering"""
    result, db_exec_time = logs_bot_new.find_logs(request)
    return jsonify(result, db_exec_time=db_exec_time)


# Page Routes
@app.route("/logs_new", methods=["GET"])
def view_logs_new() -> str:
    """Page for viewing logs with filtering"""
    result, db_exec_time = logs_bot_new.find_logs(request)
    time_tab = {"db_exec_time": db_exec_time}
    return render_template("logs_new.html", result=result, time_tab=time_tab)


@app.route("/autocomplete", methods=["GET"])
def autocomplete() -> Response:
    """Autocomplete endpoint for search functionality"""
    return sparql_bot.search(request.args)


@app.route("/features_chart", methods=["GET"])
def features_chart() -> str:
    """Page for features chart"""
    return render_template("features_chart.html")


@app.route("/list", methods=["GET"])
def list_lexemes() -> str:
    """Page for listing lexemes"""
    return render_template("list.html")


@app.route("/new", methods=["GET"])
def new_lexemes() -> str:
    """Page for creating new lexemes"""
    return render_template("new.html")


@app.route("/P11038", methods=["GET"])
def P11038() -> str:
    """Page for P11038 data"""
    return render_template("P11038.html")


@app.route("/P11038_wd", methods=["GET"])
def P11038_wd() -> str:
    """Page for P11038 data with grouping"""
    limit = int(request.args.get('limit', 100))
    wd_count, _ = sparql_bot.count_arabic_with_P11038()
    split_by_cat, sparql_exec_time = render_sparql_P11038_grouped(limit=limit, group_it=True)

    time_tab = {"sparql_exec_time": sparql_exec_time}
    return render_template(
        "P11038_wd.html",
        limit=limit,
        result=split_by_cat,
        wd_count=wd_count,
        time_tab=time_tab,
    )


@app.route("/duplicate2.html", methods=["GET"])
def duplicate2() -> str:
    """Page for duplicate data display"""
    limit = int(request.args.get('limit', AppConfig.DEFAULT_LIMIT))
    data, sparql_exec_time = render_duplicate(limit)

    time_tab = {"sparql_exec_time": sparql_exec_time}
    return render_template(
        "duplicate2.html",
        result=data,
        time_tab=time_tab,
    )


@app.route("/duplicate.html", methods=["GET"])
def duplicate() -> str:
    """Page for duplicate data by category"""
    limit = int(request.args.get('limit', 50000))
    data, sparql_exec_time = render_duplicate_by_category(limit)

    time_tab = {"sparql_exec_time": sparql_exec_time}
    return render_template(
        "duplicate.html",
        result=data,
        time_tab=time_tab,
    )


@app.route("/not_in_db", methods=["GET"])
def not_in_db() -> str:
    """Page for items not in database"""
    limit = int(request.args.get('limit', 100))
    result, sparql_exec_time, db_exec_time = get_not_in_db(limit)

    time_tab = {
        "db_exec_time": db_exec_time,
        "sparql_exec_time": sparql_exec_time,
    }
    return render_template("not_in_db.html", data=result, limit=limit, time_tab=time_tab)


@app.route("/not_in_db1", methods=["GET"])
def not_in_db1() -> str:
    """Page for items not in database (empty state)"""
    return render_template("not_in_db.html", data={}, limit=0)


@app.route("/lex_just_table", methods=["GET"])
def lex_just_table() -> str:
    """Page for lexeme table display"""
    return render_template("lex_just_table.html")


@app.route("/chart", methods=["GET"])
def chart() -> str:
    """Page for chart visualization"""
    return render_template("chart.html")


@app.route("/wd_tree", methods=["GET"])
def wd_tree() -> str:
    """Page for Wikidata tree visualization"""
    return render_template("wd_tree.html")


@app.route("/compare", methods=["GET"])
def compare() -> str:
    """Page for comparing QIDs"""
    qids = [x.strip() for x in request.args.get('qids', '').split(",") if x.strip()]
    return render_template("compare.html", qids=qids)


@app.route("/duplicate_lemmas", methods=["GET"])
def duplicate_lemmas() -> str:
    """Page for duplicate lemmas display"""
    return render_template("duplicate_lemmas.html")


@app.route("/lex", methods=["GET"])
def lex() -> str:
    """Page for lexeme management"""
    return render_template("lex.html")


@app.route("/lex2", methods=["GET"])
def lex2() -> str:
    """Page for lexeme management (alternative view)"""
    return render_template("lex2.html")


@app.route("/", methods=["GET"])
def index() -> str:
    """Home page"""
    username = session.get('username', None)
    return render_template("index.html", username=username)


@app.errorhandler(404)
def page_not_found(e) -> Tuple[str, int]:
    """Handle 404 errors"""
    return render_template("error.html", tt="invalid_url", error=str(e)), 404


@app.errorhandler(500)
def internal_server_error(e) -> Tuple[str, int]:
    """Handle 500 errors"""
    return render_template("error.html", tt="unexpected_error", error=str(e)), 500


if __name__ == "__main__":
    """Run the Flask application"""
    debug = "debug" in sys.argv

    if debug:
        print("Debug mode enabled")
        print("Adminer: http://localhost:3000/core/himo/public_html/s/u.php?sqlite=&username=&db=I%3A%5Cmilion%5Carlexemes%5Cpython%5Cnew_logs.db&table=lemmas_p11038")
        # ---
        print("Sample: http://localhost:9001/adminer.php?server=localhost&username=root&db=arlexemes")
    # ---
    app.run(debug=debug)
