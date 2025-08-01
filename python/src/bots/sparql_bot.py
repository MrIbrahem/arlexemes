# pip install sparqlwrapper
# https://rdflib.github.io/sparqlwrapper/

import sys
import time
from SPARQLWrapper import SPARQLWrapper, JSON

# تخزين الكاش في الذاكرة
_cache = {}
CACHE_TTL = 60 * 5  # 5 دقائق

endpoint_url = 'https://query.wikidata.org/sparql'


def make_cache_key(term, data_source):
    return f"{term.strip()}|{data_source.strip()}"


def get_results(query):
    user_agent = "WDQS-example Python/%s.%s" % (sys.version_info[0], sys.version_info[1])
    # TODO adjust user agent; see https://w.wiki/CX6
    sparql = SPARQLWrapper(endpoint_url, agent=user_agent)
    sparql.setQuery(query)
    sparql.setReturnFormat(JSON)
    # ---
    data = sparql.query().convert()
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

    return result


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
            ?item a ontolex:LexicalEntry ;
                wikibase:lexicalCategory ?category ;
                dct:language wd:Q13955 ;
                wikibase:lemma ?lemma .
            optional {{ ?item ontolex:lexicalForm ?form }}
            FILTER(CONTAINS(STR(?lemma), "{escaped_term}")) .
            SERVICE wikibase:label {{ bd:serviceParam wikibase:language "ar, en". }}
        }}
        GROUP BY ?lemma ?item ?categoryLabel
        ORDER BY DESC(?count)
        LIMIT 50
    """

    data = get_results(sparql_query)

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
        SELECT DISTINCT ?lemma ?item ?category ?categoryLabel ?P11038 WHERE {
        ?item a ontolex:LexicalEntry ;
                wikibase:lexicalCategory ?category ;
                dct:language wd:Q13955 ;
                wikibase:lemma ?lemma .
        SERVICE wikibase:label { bd:serviceParam wikibase:language "ar, en". }
        optional { ?item wdt:P11038 ?P11038 }
        }

    """
    if limit > 0:
        sparql_query += f" limit {limit}"

    data = get_results(sparql_query)

    return data


def all_arabic_with_P11038(limit):

    sparql_query = """
        SELECT DISTINCT ?lemma ?item ?category ?categoryLabel ?P11038 WHERE {
        ?item a ontolex:LexicalEntry ;
                wikibase:lexicalCategory ?category ;
                dct:language wd:Q13955 ;
                wikibase:lemma ?lemma .
        SERVICE wikibase:label { bd:serviceParam wikibase:language "ar, en". }
        ?item wdt:P11038 ?P11038
        }

    """
    if limit > 0:
        sparql_query += f" limit {limit}"

    data = get_results(sparql_query)

    return data


def count_arabic_with_P11038():

    sparql_query = """
        SELECT (count(*) as ?count)
        WHERE {
        ?item rdf:type ontolex:LexicalEntry;
                dct:language wd:Q13955.
        ?item wdt:P11038 ?P11038
        }

    """
    data = get_results(sparql_query)
    count = 0
    # [ { "count": "1632" } ]
    # ---
    if data:
        count = data[0]['count']
    # ---
    return count
