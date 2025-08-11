# -*- coding: utf-8 -*-
import sys
from flask import Flask, render_template, request, Response, session
import json
import time
from flask import g

from pyx import logs_bot_new
from pyx.logs_db import wd_data_P11038
from pyx.sparql_bots import sparql_bot
from pyx.sparql_bots.render import render_all_arabic_by_category
from pyx.bots.not_in_db_bot import get_not_in_db


app = Flask(__name__)
# CORS(app)  # ← لتفعيل CORS


@app.before_request
def before_request():
    g.start_time = time.time()


@app.after_request
def after_request(response):
    if hasattr(g, 'start_time'):
        g.load_time = time.time() - g.start_time
    return response


@app.context_processor
def inject_load_time():
    # نحسب الوقت الحالي - وقت البداية
    load_time = 0
    if hasattr(g, 'start_time'):
        load_time = time.time() - g.start_time
    return dict(load_time=load_time)


def jsonify(data : dict) -> str:
    response_json = json.dumps(data, ensure_ascii=False, indent=4)
    return Response(response=response_json, content_type="application/json; charset=utf-8")


@app.route("/api/wd_data_count", methods=["GET"])
def wd_data_api_count():
    # ---
    _filter_data = request.args.get("filter_data", "all", type=str)
    # ---
    counts = wd_data_P11038.count_all()
    # ---
    return jsonify(counts)


@app.route("/api/wd_data", methods=["GET"])
def wd_data_api():
    # ---
    limit = request.args.get('limit', 10000, type=int)
    offset = request.args.get('offset', 0, type=int)
    order = request.args.get("order", "desc").upper()
    order_by = request.args.get("order_by", "id", type=str)
    filter_data = request.args.get("filter_data", "with", type=str)
    # ---
    all_result = wd_data_P11038.get_lemmas(limit=limit, offset=offset, order=order, order_by=order_by, filter_data=filter_data)
    # ---
    return jsonify(all_result)


@app.route("/api/wd_not_in_sql", methods=["GET"])
def api_wd_not_in_sql():
    # ---
    result, _exec_time = get_not_in_db()
    # ---
    data = {
        "result": result,
        "exec_time": _exec_time,
    }
    # ---
    return jsonify(data)


@app.route("/logs_new", methods=["GET"])
def view_logs_new():
    # ---
    result = logs_bot_new.find_logs(request)
    # ---
    return render_template("logs_new.php", result=result)


@app.route("/autocomplete.php", methods=["GET"])
def autocomplete():
    return sparql_bot.search(request.args)


@app.route("/list.php", methods=["GET"])
def list_lexemes():
    return render_template("list.php")


@app.route("/new.php", methods=["GET"])
def new_lexemes():
    return render_template("new.php")


@app.route("/P11038", methods=["GET"])
def P11038():
    return render_template("P11038.html")


@app.route("/P11038_wd", methods=["GET"])
def P11038_wd():
    # ---
    limit = request.args.get('limit', 100, type=int)
    # ---
    wd_count, _ = sparql_bot.count_arabic_with_P11038()
    # ---
    split_by_category, exec_time = render_all_arabic_by_category(limit)
    # ---
    return render_template(
        "P11038_wd.html",
        limit=limit,
        result=split_by_category,
        wd_count=wd_count,
        exec_time=exec_time,
    )


@app.route("/not_in_db", methods=["GET"])
def not_in_db():
    # ---
    limit = request.args.get('limit', 100, type=int)
    # ---
    result, exec_time = get_not_in_db(limit)
    # ---
    return render_template("not_in_db.html", data=result, limit=limit, exec_time=exec_time)


@app.route("/not_in_db1", methods=["GET"])
def not_in_db1():
    return render_template("not_in_db.html", data={}, limit=0)


@app.route("/chart.php", methods=["GET"])
def chart():
    return render_template("chart.php")


@app.route("/wd_tree.php", methods=["GET"])
def wd_tree():
    return render_template("wd_tree.php")


@app.route("/duplicate_lemmas.php", methods=["GET"])
def duplicate_lemmas():
    return render_template("duplicate_lemmas.php")


@app.route("/lex.php", methods=["GET"])
def lex():
    return render_template("lex.php")


@app.route("/lex2.php", methods=["GET"])
def lex2():
    return render_template("lex2.php")


@app.route("/", methods=["GET"])
def index() -> str:
    username = session.get('username', None)
    return render_template("index.php", username=username)


@app.errorhandler(404)
def page_not_found(e):
    return render_template("error.html", tt="invalid_url", error=str(e)), 404


@app.errorhandler(500)
def internal_server_error(e):
    return render_template("error.html", tt="unexpected_error", error=str(e)), 500


if __name__ == "__main__":
    # ---
    debug = "debug" in sys.argv
    # ---
    if debug:
        print("http://localhost:3000/core/himo/public_html/s/u.php?sqlite=&username=&db=I%3A%5Cmilion%5Carlexemes%5Cpython%5Cnew_logs.db&table=lemmas_p11038")
        # ---
        print("http://localhost:9001/adminer.php?server=localhost&username=root&db=arlexemes")
    # ---
    app.run(debug=debug)
