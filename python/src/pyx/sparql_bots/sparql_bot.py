# -*- coding: utf-8 -*-
"""
SPARQL bot for interacting with Wikidata API
Handles SPARQL queries with caching and error management
"""

import sys
import time
import socket
import urllib.error
import logging
from typing import Dict, List, Tuple, Optional, Any
from SPARQLWrapper import SPARQLWrapper, JSON
from cachetools import TTLCache
from ..bots import err_bot

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Constants
CACHE_TTL = 60 * 5  # 5 minutes
CACHE_MAX_SIZE = 100
TIMEOUT = 10
ENDPOINT_URL = 'https://query.wikidata.org/sparql'

# Caches
sparql_cache = TTLCache(maxsize=CACHE_MAX_SIZE, ttl=CACHE_TTL)
simple_cache = {}


class SPARQLQueryError(Exception):
    """Custom exception for SPARQL query errors"""
    pass


class SPARQLConnectionError(Exception):
    """Custom exception for SPARQL connection errors"""
    pass


class SPARQLBot:
    """SPARQL bot for Wikidata API interactions"""

    def __init__(self):
        self.user_agent = f"WDQS-example Python/{sys.version_info[0]}.{sys.version_info[1]}"
        self.cache_enabled = "nocahe" not in sys.argv

    def _create_sparql_wrapper(self, query: str) -> SPARQLWrapper:
        """Create and configure SPARQLWrapper instance"""
        sparql = SPARQLWrapper(ENDPOINT_URL, agent=self.user_agent)
        sparql.setQuery(query)
        sparql.setReturnFormat(JSON)
        sparql.setTimeout(TIMEOUT)
        return sparql

    def _execute_query(self, query: str) -> Dict[str, Any]:
        """Execute SPARQL query with proper error handling"""
        try:
            sparql = self._create_sparql_wrapper(query)
            data = sparql.query().convert()
            return data
        except socket.timeout:
            error_msg = f"Connection to {ENDPOINT_URL} timed out"
            logger.error(error_msg)
            raise SPARQLConnectionError(error_msg)
        except urllib.error.HTTPError as e:
            error_msg = f"HTTP Error {e.code}: {e.reason}"
            logger.error(error_msg)
            raise SPARQLQueryError(error_msg)
        except urllib.error.URLError as e:
            error_msg = f"Failed to reach {ENDPOINT_URL}: {e.reason}"
            logger.error(error_msg)
            raise SPARQLConnectionError(error_msg)
        except ValueError as e:
            error_msg = f"Error converting result to JSON: {e}"
            logger.error(error_msg)
            raise SPARQLQueryError(error_msg)
        except Exception as e:
            error_msg = f"Unexpected error: {str(e)}"
            logger.error(error_msg)
            raise SPARQLQueryError(error_msg)

    def safe_sparql_query(self, query: str, timeout: int = TIMEOUT) -> Tuple[Dict[str, Any], str]:
        """Execute SPARQL query with caching and error handling"""
        # Check cache first
        if self.cache_enabled and query in sparql_cache:
            logger.info(f"Cache hit for query: {query[:100]}...")
            err_bot.log_error("SPARQL Cache Hit", f"Query retrieved from cache: {query}")
            return sparql_cache[query], ""

        try:
            data = self._execute_query(query)
            sparql_cache[query] = data
            return data, ""
        except (SPARQLConnectionError, SPARQLQueryError) as e:
            err_bot.log_error("SPARQL Error", str(e))
            return {}, str(e)

    def get_results(self, query: str, timeout: int = TIMEOUT, get_err: bool = False) -> Tuple[List[Dict[str, Any]], float, Optional[str]]:
        """Execute SPARQL query and format results"""
        start_time = time.time()
        data, err = self.safe_sparql_query(query, timeout=timeout)

        # Format results
        result = []
        items = data.get("results", {}).get("bindings", [])
        vars_list = data.get("head", {}).get("vars", [])

        for row in items:
            new_row = {}
            for var in vars_list:
                value = row.get(var, {}).get("value", "")
                # Extract entity ID from URI
                if "/entity/" in value:
                    value = value.split("/").pop()
                new_row[var] = value
            result.append(new_row)

        sparql_exec_time = time.time() - start_time
        logger.info(f"SPARQL execution time: {sparql_exec_time:.3f}s")
        err_bot.log_error("SPARQL time", sparql_exec_time)

        if get_err:
            return result, sparql_exec_time, err
        return result, sparql_exec_time

    @staticmethod
    def make_cache_key(term: str, data_source: str) -> str:
        """Create cache key for search operations"""
        return f"{term.strip()}|{data_source.strip()}"

    def search(self, args: Dict[str, str]) -> Dict[str, Any]:
        """Search for Arabic lexemes with caching"""
        term = args.get('term', 'ا').strip()
        data_source = args.get('data_source', '').strip()

        if not term:
            return {}

        # Check cache
        cache_key = self.make_cache_key(term, data_source)
        current_time = time.time()

        if cache_key in simple_cache:
            cached_result, timestamp = simple_cache[cache_key]
            if current_time - timestamp < CACHE_TTL:
                return cached_result

        # Build SPARQL query
        escaped_term = term.replace('"', '\\"')
        values_clause = self._build_values_clause(data_source)

        sparql_query = f"""
            SELECT DISTINCT ?lemma ?item ?categoryLabel (count(?form) as ?count) WHERE {{
                {values_clause}
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

        data, sparql_exec_time = self.get_results(sparql_query)

        # Format results
        result = {"search": []}
        for row in data:
            item_id = row['item']
            lemma = row['lemma']
            category_label = row['categoryLabel']
            count = int(row.get('count', 0))

            label = f"{lemma} - {category_label}"
            if count and count > 1:
                label += f" - ({count} كلمة)"

            result['search'].append({
                "label": label,
                "value": lemma,
                "id": item_id
            })

        # Cache result
        simple_cache[cache_key] = (result, current_time)

        return result

    def _build_values_clause(self, data_source: str) -> str:
        """Build VALUES clause for SPARQL query"""
        if data_source:
            return f"VALUES ?category {{ wd:{data_source} }} . "
        else:
            return "VALUES ?category { wd:Q24905 wd:Q34698 wd:Q1084 } . "

    def all_arabic(self, limit: int = 0) -> Tuple[List[Dict[str, Any]], float]:
        """Get all Arabic lexemes"""
        sparql_query = """
            SELECT DISTINCT ?lemma ?item ?category ?categoryLabel WHERE {
                ?item dct:language wd:Q13955;
                    wikibase:lexicalCategory ?category;
                    wikibase:lemma ?lemma.
                SERVICE wikibase:label { bd:serviceParam wikibase:language "ar, en". }
            }
        """
        if limit > 0:
            sparql_query += f" LIMIT {limit}"

        return self.get_results(sparql_query)

    def all_arabic_with_P11038_grouped(self, limit: int = 0) -> Tuple[List[Dict[str, Any]], float]:
        """Get Arabic lexemes with P11038 values, grouped"""
        sparql_query = """
            SELECT DISTINCT ?item ?lemma ?category ?categoryLabel
            (GROUP_CONCAT(DISTINCT ?P11038; separator=", ") AS ?P11038_values)
            WHERE {
                ?item dct:language wd:Q13955;
                    wikibase:lexicalCategory ?category;
                    wikibase:lemma ?lemma;
                    wdt:P11038 ?P11038.
                SERVICE wikibase:label { bd:serviceParam wikibase:language "ar,en". }
            }
            GROUP BY ?item ?lemma ?category ?categoryLabel
        """
        if limit > 0:
            sparql_query += f" LIMIT {limit}"

        data, sparql_exec_time = self.get_results(sparql_query)

        # Process P11038 values
        new_data = []
        for x in data:
            p11038_values = [o.strip() for o in x.get("P11038_values", "").split(",")]
            x["P11038_values"] = p11038_values
            new_data.append(x)

        return new_data, sparql_exec_time

    def count_arabic_with_P11038(self) -> Tuple[int, float]:
        """Count Arabic lexemes with P11038"""
        sparql_query = """
            SELECT (count(DISTINCT ?item) as ?count)
            WHERE {
                ?item rdf:type ontolex:LexicalEntry;
                    dct:language wd:Q13955.
                ?item wdt:P11038 ?P11038
            }
        """
        data, sparql_exec_time = self.get_results(sparql_query)

        if data:
            return int(data[0]['count']), sparql_exec_time
        return 0, sparql_exec_time

    def find_duplicates(self, limit: int = 100) -> Tuple[List[Dict[str, Any]], float, str]:
        """Find duplicate lemmas"""
        sparql_query = """
            SELECT ?lemma_fixed ?category
            (GROUP_CONCAT(strafter(str(?1_item),"/entity/"); separator=", ") AS ?items)
            (GROUP_CONCAT(?lemma; separator=", ") AS ?lemmas)
            WHERE {
                ?1_item dct:language wd:Q13955;
                    wikibase:lemma ?lemma;
                    wikibase:lexicalCategory ?category.
                BIND(REPLACE(STR(?lemma), "[\u064B-\u065F\u066A-\u06EF]$", "") AS ?lemma_fixed)
            }
            GROUP BY ?lemma_fixed ?category
            HAVING(COUNT(?1_item) > 1)
        """

        if limit > 0:
            sparql_query += f" LIMIT {limit}"

        return self.get_results(sparql_query, timeout=35, get_err=True)


# Global instance for backward compatibility
s_bot = SPARQLBot()

safe_sparql_query = s_bot.safe_sparql_query
get_results = s_bot.get_results
search = s_bot.search
all_arabic = s_bot.all_arabic
all_arabic_with_P11038_grouped = s_bot.all_arabic_with_P11038_grouped
count_arabic_with_P11038 = s_bot.count_arabic_with_P11038
find_duplicates = s_bot.find_duplicates
