# -*- coding: utf-8 -*-
import sys
from flask import Flask, render_template, request, Response, session
import json

app = Flask(__name__)
# CORS(app)  # ← لتفعيل CORS

import logs_bot
from bots import sparql_bot
from bots.match_sparql import get_wd_not_in_sql


@app.route("/api/logs", methods=["GET"])
def logs_api():
    # ---
    result = logs_bot.find_logs(request)
    # ---
    return jsonify(result)


@app.route("/api/wd_not_in_sql", methods=["GET"])
def api_wd_not_in_sql():
    # ---
    result = get_wd_not_in_sql()
    # ---
    return jsonify(result)


@app.route("/not_in_sql", methods=["GET"])
def not_in_sql():
    # ---
    limit = request.args.get('limit', 100, type=int)
    # ---
    result = get_wd_not_in_sql()
    # ---
    # sort result by len of P11038_list
    result = sorted(result, key=lambda x: len(x['P11038_list']), reverse=True)
    # ---
    if limit > 0:
        result = result[:limit]
    # ---
    len_of_ids = max([len(x['P11038_list']) for x in result if x['P11038_list']])
    # ---
    return render_template("not_in_sql.html", data=result, len_of_ids=len_of_ids, limit=limit)


@app.route("/logs1", methods=["GET"])
def view_logs():
    # ---
    result = logs_bot.find_logs(request)
    # ---
    return render_template("logs.php", result=result)


def jsonify(data : dict) -> str:
    response_json = json.dumps(data, ensure_ascii=False, indent=4)
    return Response(response=response_json, content_type="application/json; charset=utf-8")


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
    limit = request.args.get('limit', 100, type=int)

    result = sparql_bot.all_arabic(limit)
    split_by_category = {}
    for item in result:
        category = item['category']
        # ---
        if category not in split_by_category:
            split_by_category[category] = {
                'category': category,
                'categoryLabel': item['categoryLabel'],
                'members': []
            }
        # ---
        split_by_category[category]['members'].append(item)

    return render_template("P11038.html", limit=limit, result=split_by_category)


@app.route("/wd.php", methods=["GET"])
def wd():
    return render_template("wd.php")


@app.route("/duplicate_lemmas.php", methods=["GET"])
def duplicate_lemmas():
    return render_template("duplicate_lemmas.php")


@app.route("/chart.php", methods=["GET"])
def chart():
    return render_template("chart.php")


@app.route("/lex.php", methods=["GET"])
def lex():
    return render_template("lex.php")


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
        url = "http://localhost:3000/core/himo/public_html/s/u.php?sqlite=&username=&db=I%3A%5Cmilion%5Carlexemes%5Cpython%5Cnew_logs.db&table=P11038_lemmas"
        # ---
        print(url)
    # ---
    app.run(debug=debug)
