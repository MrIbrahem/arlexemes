
from bots.sparql_bot import get_results


def test():

    sparql_query = """
        SELECT DISTINCT ?lemma ?item ?category ?categoryLabel ?P11038 WHERE {
        values ?item {wd:L1450900}
        ?item a ontolex:LexicalEntry ;
                wikibase:lexicalCategory ?category ;
                dct:language wd:Q13955 ;
                wikibase:lemma ?lemma .
        SERVICE wikibase:label { bd:serviceParam wikibase:language "ar, en". }
        ?item wdt:P11038 ?P11038
        }

    """

    data = get_results(sparql_query)

    print(data)
