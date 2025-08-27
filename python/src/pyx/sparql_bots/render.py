"""

from pyx.sparql_bots.render import render_sparql_P11038_grouped

"""
import re
import copy
from collections import defaultdict
from . import sparql_bot


def split_data_by_category_list(data):
    # ---
    split_by_category = {}
    # ---
    for item in data:
        # ---
        category = item['category']
        # ---
        if category not in split_by_category:
            split_by_category[category] = {
                'category': category,
                'categoryLabel': item['categoryLabel'],
                'members': []
            }
        # ---
        members = split_by_category[category]['members']
        # ---
        members.append(item)
    # ---
    return split_by_category


def split_data_by_category_dict(data):
    # ---
    split_by_category = {}
    # ---
    for key, item in data.items():
        # ---
        category = item['category']
        # ---
        if category not in split_by_category:
            split_by_category[category] = {
                'category': category,
                'categoryLabel': item['categoryLabel'],
                'members': {}
            }
        # ---
        split_by_category[category]['members'][key] = item
    # ---
    return split_by_category


def render_sparql_P11038_grouped(limit=0, group_it=False):
    # ---
    # ab_P11038, sparql_exec_time = render_sparql_P11038_grouped()
    # ---
    print("def render_sparql_P11038_grouped():")
    # ---
    dup = 0
    # ---
    # ?item ?lemma ?category ?categoryLabel ?P11038_values
    result, sparql_exec_time = sparql_bot.all_arabic_with_P11038_grouped(limit=limit)
    # ---
    tab_P11038 = {}
    # ---
    for x in result:
        item = x.get("item", "")
        P11038_values = x.get("P11038_values", [])
        # ---
        if not item or not P11038_values:
            continue
        # ---
        if item not in tab_P11038:
            tab_P11038[x['item']] = x
        else:
            dup += 1
    # ---
    print(f"\t render_sparql_P11038_grouped: result: {len(result)}, tab_P11038: {len(tab_P11038)}, dup: {dup}")
    # ---
    if group_it:
        tab_P11038 = split_data_by_category_dict(tab_P11038)
    # ---
    return tab_P11038, sparql_exec_time


def find_duplicates(members):
    # ---
    duplicates = defaultdict(list)
    # ---
    members = copy.deepcopy(members)
    # ---
    for qid, x in members.items():
        # ---
        lemma = re.sub(r"[\u064B-\u065F\u066A-\u06EF]", "", x['lemma'])
        # ---
        if x not in duplicates[lemma]:
            # ---
            duplicates[lemma].append(x)
    # ---
    duplicates = {k: v for k, v in duplicates.items() if len(v) > 1}
    # ---
    return duplicates


def render_duplicate_by_category(limit):
    # ---
    result, sparql_exec_time = sparql_bot.all_arabic(limit)
    # ---
    result = {x['item']: x for x in result}
    # ---
    split_by_category = split_data_by_category_dict(result)
    # ---
    new = {}
    # ---
    for cat, tab in split_by_category.items():
        # ---
        members = find_duplicates(tab["members"])
        # ---
        if members:
            tab["lemmas"] = members
            # ---
            new[cat] = tab
    # ---
    return new, sparql_exec_time
