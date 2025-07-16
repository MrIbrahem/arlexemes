# pip install sparqlwrapper
# https://rdflib.github.io/sparqlwrapper/

import sys
import time
from SPARQLWrapper import SPARQLWrapper, JSON

# تخزين الكاش في الذاكرة
_cache = {}
CACHE_TTL = 60 * 5  # 5 دقائق


def make_cache_key(term, data_source):
    return f"{term.strip()}|{data_source.strip()}"


def get_results(endpoint_url, query):
    user_agent = "WDQS-example Python/%s.%s" % (sys.version_info[0], sys.version_info[1])
    # TODO adjust user agent; see https://w.wiki/CX6
    sparql = SPARQLWrapper(endpoint_url, agent=user_agent)
    sparql.setQuery(query)
    sparql.setReturnFormat(JSON)
    return sparql.query().convert()


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

    endpoint_url = 'https://query.wikidata.org/sparql'

    # تأمين السلسلة للاستخدام في SPARQL
    escaped_term = term.replace('"', '\\"')

    values = "VALUES ?category { wd:Q24905 wd:Q34698 wd:Q1084 } . "
    if data_source:
        values = f"VALUES ?category {{ wd:{data_source} }} . "

    sparql_query = f"""
        SELECT DISTINCT ?lemma ?item ?categoryLabel (count(*) as ?count) WHERE {{
            {values}
            ?item a ontolex:LexicalEntry ;
                wikibase:lexicalCategory ?category ;
                ontolex:lexicalForm ?form ;
                dct:language wd:Q13955 ;
                wikibase:lemma ?lemma .
            FILTER(CONTAINS(STR(?lemma), "{escaped_term}")) .
            SERVICE wikibase:label {{ bd:serviceParam wikibase:language "ar". }}
        }}
        GROUP BY ?lemma ?item ?categoryLabel
        ORDER BY DESC(?count)
        LIMIT 50
    """

    results = get_results(endpoint_url, sparql_query)

    # تنسيق النتائج
    items = {
        "search": []
    }

    for row in results.get('results', {}).get('bindings', []):
        item_uri = row['item']['value']
        item_id = item_uri.split('/entity/')[-1]
        lemma = row['lemma']['value']
        categoryLabel = row['categoryLabel']['value']
        count = row.get('count', {}).get('value', 0)
        count = int(count)

        label = f"{lemma} - {categoryLabel}"
        if count and count > 1:
            label += f" - ({count} كلمة)"

        items['search'].append({
            "label": label,
            "value": lemma,
            "id": item_id
        })

    # تخزين النتيجة في الكاش
    _cache[key] = (items, now)

    return items
