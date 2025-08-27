# pip install sparqlwrapper
# https://rdflib.github.io/sparqlwrapper/

import sys
import time
import socket
import urllib.error
from SPARQLWrapper import SPARQLWrapper, JSON
from ..bots import err_bot
from cachetools import TTLCache

# (3600 s)
sparql_cache = TTLCache(maxsize=100, ttl=3600)

_cache = {}
CACHE_TTL = 60 * 5  # 5 m

endpoint_url = 'https://query.wikidata.org/sparql'


def safe_sparql_query(query, time_out=10):

    if query in sparql_cache and "nocahe" not in sys.argv:
        err_bot.log_error("SPARQL Cache Hit", f"Query retrieved from cache: {query}")
        return sparql_cache[query], ""

    user_agent = "WDQS-example Python/%s.%s" % (sys.version_info[0], sys.version_info[1])
    # ---
    try:
        sparql = SPARQLWrapper(endpoint_url, agent=user_agent)
        sparql.setQuery(query)
        # ---
        sparql.setReturnFormat(JSON)
        sparql.setTimeout(time_out)
        # ---
        data = sparql.query().convert()
        # ---
        sparql_cache[query] = data
        # ---
        return data, ""

    except socket.timeout:
        err_bot.log_error("SPARQL Timeout", f"Connection to {endpoint_url} timed out")
        return {}, "SPARQL Timeout"

    except urllib.error.HTTPError as e:
        err_bot.log_error("SPARQL HTTP Error", f"HTTP Error {e.code}: {e.reason}")
        return {}, "SPARQL HTTP Error"

    except urllib.error.URLError as e:
        err_bot.log_error("SPARQL URL Error", f"Failed to reach {endpoint_url}: {e.reason}")
        return {}, "SPARQL URL Error"

    except ValueError as e:
        err_bot.log_error("SPARQL JSON Error", f"Error converting result to JSON: {e}")
        return {}, "SPARQL JSON Error"

    except Exception as e:
        err_bot.log_error("SPARQL Unknown Error", f"Unexpected error: {str(e)}")
    # ---
    return {}, "SPARQL Unknown Error"


def get_results(query, time_out=10, get_err=False):
    # ---
    now = time.time()
    # ---
    data, err = safe_sparql_query(query, time_out=time_out)
    # ---
    # تنسيق النتائج
    result = []

    items = data.get("results", {}).get("bindings", [])
    vars_list = data.get("head", {}).get("vars", [])

    for row in items:
        new_row = {}
        # ---
        for var in vars_list:
            value = row.get(var, {}).get("value", "")
            # ---
            if value.find("/entity/") != -1:
                value = value.split("/").pop()
            # ---
            new_row[var] = value
        # ---
        result.append(new_row)
    # ---
    if err:
        err_bot.log_error("SPARQL Error", err)
    # ---
    sparql_exec_time = time.time() - now
    # ---
    err_bot.log_error("SPARQL time", sparql_exec_time)
    # ---
    print(f"SPARQL sparql_exec_time: {sparql_exec_time}")
    # ---
    if get_err:
        return result, sparql_exec_time, err
    # ---
    return result, sparql_exec_time


def make_cache_key(term, data_source):
    return f"{term.strip()}|{data_source.strip()}"


def search(args):
    term = args.get('term', 'ا').strip()
    data_source = args.get('data_source', '').strip()

    if not term:
        return {}

    # تحقق من الكاش
    key = make_cache_key(term, data_source)
    now = time.time()
    if key in _cache:
        cached_result, timestamp = _cache[key]
        if now - timestamp < CACHE_TTL:
            return cached_result  # إرجاع النسخة المخبأة

    # تأمين السلسلة للاستخدام في SPARQL
    escaped_term = term.replace('"', '\\"')

    values = "VALUES ?category { wd:Q24905 wd:Q34698 wd:Q1084 } . "
    if data_source:
        values = f"VALUES ?category {{ wd:{data_source} }} . "

    sparql_query = f"""
        SELECT DISTINCT ?lemma ?item ?categoryLabel (count(?form) as ?count) WHERE {{
            {values}
            # ?item a ontolex:LexicalEntry ;
            ?item dct:language wd:Q13955;
                wikibase:lexicalCategory ?category;
                wikibase:lemma ?lemma.
            optional {{ ?item ontolex:lexicalForm ?form }}
            FILTER(CONTAINS(STR(?lemma), "{escaped_term}")) .
            SERVICE wikibase:label {{ bd:serviceParam wikibase:language "ar, en". }}
        }}
        GROUP BY ?lemma ?item ?categoryLabel
        ORDER BY DESC(?count)
        LIMIT 50
    """

    data, sparql_exec_time = get_results(sparql_query)

    # تنسيق النتائج
    result = {
        "search": []
    }

    for row in data:
        item_id = row['item']
        lemma = row['lemma']
        categoryLabel = row['categoryLabel']
        count = row.get('count', 0)
        count = int(count)

        label = f"{lemma} - {categoryLabel}"
        if count and count > 1:
            label += f" - ({count} كلمة)"

        result['search'].append({
            "label": label,
            "value": lemma,
            "id": item_id
        })

    # تخزين النتيجة في الكاش
    _cache[key] = (result, now)

    return result


def all_arabic(limit):
    sparql_query = """
        SELECT DISTINCT ?lemma ?item ?category ?categoryLabel WHERE {
        ?item dct:language wd:Q13955;
                wikibase:lexicalCategory ?category;
                wikibase:lemma ?lemma.
        SERVICE wikibase:label { bd:serviceParam wikibase:language "ar, en". }
        }
    """
    if limit > 0:
        sparql_query += f" limit {limit}"

    data, sparql_exec_time = get_results(sparql_query)

    return data, sparql_exec_time


def all_arabic_with_P11038_grouped(limit=0):

    sparql_query = """
        SELECT DISTINCT ?item ?lemma ?category ?categoryLabel
        (GROUP_CONCAT(DISTINCT ?P11038; separator=", ") AS ?P11038_values)
        WHERE {
        ?item dct:language wd:Q13955 ;
                wikibase:lexicalCategory ?category ;
                wikibase:lemma ?lemma ;
                wdt:P11038 ?P11038 .
        SERVICE wikibase:label { bd:serviceParam wikibase:language "ar,en". }
        }
        GROUP BY ?item ?lemma ?category ?categoryLabel

    """
    if limit > 0:
        sparql_query += f" limit {limit}"

    data, sparql_exec_time = get_results(sparql_query)
    # ---
    new_data = []
    # ---
    for x in data:
        P11038_values = [o.strip() for o in x.get("P11038_values", "").split(",")]
        x["P11038_values"] = P11038_values
        new_data.append(x)
    # ---
    return new_data, sparql_exec_time


def count_arabic_with_P11038():
    sparql_query = """
        SELECT (count(DISTINCT ?item) as ?count)
        WHERE {
        ?item rdf:type ontolex:LexicalEntry;
                dct:language wd:Q13955.
        ?item wdt:P11038 ?P11038
        }
    """
    data, sparql_exec_time = get_results(sparql_query)
    count = 0
    # [ { "count": "1632" } ]
    # ---
    if data:
        count = data[0]['count']
    # ---
    return count, sparql_exec_time


def find_duplicates(LIMIT=100):
    sparql_query = """
        SELECT ?lemma_fixed ?category
        (GROUP_CONCAT(strafter(str(?1_item),"/entity/"); separator=", ") AS ?items)
        (GROUP_CONCAT(?lemma; separator=", ") AS ?lemmas)
        WHERE {
        #service <https://qlever.cs.uni-freiburg.de/api/wikidata> {
            ?1_item dct:language wd:Q13955;
                    wikibase:lemma ?lemma;
                    wikibase:lexicalCategory ?category.
            BIND(REPLACE(STR(?lemma), "[\u064B-\u065F\u066A-\u06EF]", "") AS ?lemma_fixed)
        #}
        }
        GROUP BY ?lemma_fixed ?category
        HAVING(COUNT(?1_item) > 1)
    """
    # ---
    if LIMIT > 0:
        sparql_query += f" LIMIT {LIMIT}"
    # ---
    data, sparql_exec_time, err = get_results(sparql_query, time_out=35, get_err=True)
    # ---
    return data, sparql_exec_time, err
