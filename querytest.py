# pip install sparqlwrapper
# https://rdflib.github.io/sparqlwrapper/

import sys
import time
from SPARQLWrapper import SPARQLWrapper, JSON

endpoint_url = "https://query.wikidata.org/sparql"


def get_results(endpoint_url, query):
    user_agent = "WDQS-example Python/%s.%s" % (sys.version_info[0], sys.version_info[1])
    sparql = SPARQLWrapper(endpoint_url, agent=user_agent)
    sparql.setQuery(query)
    sparql.setReturnFormat(JSON)
    return sparql.query().convert()


queries = [
    """
    SELECT ?prop ?usage ?propLabel
        WHERE {
        {
            SELECT
            ?wdtProp
            (COUNT(?item) AS ?usage)
            WHERE {
            #${VALUES}
            ?item dct:language wd:Q13955.
            ?item ?wdtProp ?value.
            FILTER(STRSTARTS(STR(?wdtProp), STR(wdt:)))
            }
            GROUP BY ?wdtProp
        }
        BIND(IRI(REPLACE(STR(?wdtProp), STR(wdt:), STR(wd:))) AS ?prop)
        SERVICE wikibase:label { bd:serviceParam wikibase:language "ar,en". }
        }
        ORDER BY DESC(?usage)
    """
    ,
    """
            SELECT ?prop ?usage ?propLabel
        WHERE {
        {
            SELECT
            ?wdtProp

            (COUNT(?item) AS ?usage)
            WHERE {
            #${VALUES}
            ?item dct:language wd:Q13955.
            ?item ?wdtProp ?value.
            FILTER(STRSTARTS(STR(?wdtProp), STR(wdt:)))
            }
            GROUP BY ?wdtProp
        }
        BIND(IRI(REPLACE(STR(?wdtProp), STR(wdt:), STR(wd:))) AS ?prop)
        SERVICE wikibase:label { bd:serviceParam wikibase:language "ar,en". }
        }
        ORDER BY DESC(?usage)
    """
]

for query in queries:

    start_time = time.time()

    results = get_results(endpoint_url, query)

    end_time = time.time()
    elapsed_time = end_time - start_time

    count_results = len(results["results"]["bindings"])

    print(f" results: {count_results}")
    print(f"time : {elapsed_time:.2f} s")
