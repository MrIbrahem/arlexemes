# -*- coding: utf-8 -*-
import sys
from flask import Flask, render_template, request, Response, session
import json

app = Flask(__name__)
# CORS(app)  # ← لتفعيل CORS

from bots import auto_complete


def jsonify(data : dict) -> str:
    response_json = json.dumps(data, ensure_ascii=False, indent=4)
    return Response(response=response_json, content_type="application/json; charset=utf-8")


@app.route("/autocomplete", methods=["GET"])
def autocomplete():
    return auto_complete.search(request.args)


@app.route("/list", methods=["GET"])
def list_lexemes():
    # ---
    return render_template("list_lexemes.html")


@app.route("/duplicate_lemmas", methods=["GET"])
def duplicate_lemmas():
    # ---
    return render_template("duplicate_lemmas.html")


@app.route("/chart", methods=["GET"])
def chart():
    # ---
    return render_template("chart.html")


@app.route("/lex", methods=["GET"])
def lex():
    # ---
    return render_template("lex.html")


@app.route("/", methods=["GET"])
def index() -> str:
    username = session.get('username', None)
    return render_template("index.html", username=username)


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
    app.run(debug=debug)
