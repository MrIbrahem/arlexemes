"""

from pyx.bots.not_in_db_bot import get_not_in_db

# result, sparql_exec_time, db_exec_time = get_not_in_db(limit)

"""
import tqdm
from .match_sparql import in_sql
from ..sparql_bots.render import render_sparql_P11038_grouped


def get_wd_not_insql(tab_P11038, insql_lemma, insql_sama):
    # ---
    if not tab_P11038:
        return []
    # ---
    no_data_tab = []
    # ---
    has_data_multi = 0
    # ---
    for _x, y in tqdm.tqdm(tab_P11038.items(), total=len(tab_P11038)):
        # ---
        has_data_set = []
        has_data = []
        # ---
        P11038_values = y.get("P11038_values", [])
        # ---
        for P11038 in P11038_values:
            data = insql_lemma.get(P11038) or insql_sama.get(P11038)
            # ---
            if not data:
                continue
            # ---
            has_data.append(data)
            # ---
            if data not in has_data_set:
                has_data_set.append(data)
        # ---
        if not has_data:
            no_data_tab.append(y)
        else:
            if len(has_data_set) > 1:
                # print(f"has_data_set: {len(has_data_set)}")
                has_data_multi += 1
    # ---
    print(f"no_data_tab: {len(no_data_tab)}")
    print(f"has_data_multi: {has_data_multi}")
    # ---
    # sort result by len of P11038_values
    no_data_tab = sorted(no_data_tab, key=lambda x: len(x['P11038_values']), reverse=True)
    # ---
    return no_data_tab


def get_not_in_db(limit=0):
    # ---
    sparql_exec_time = 0
    # ---
    result = []
    # ---
    insql_lemma, insql_sama, db_exec_time = in_sql()
    # ---
    if not insql_lemma or not insql_sama:
        return result, sparql_exec_time, db_exec_time
    # ---
    print(f"SPARQL exec_time: {sparql_exec_time}")
    print(f"DB exec_time: {db_exec_time}")
    # ---
    tab_P11038, sparql_exec_time = render_sparql_P11038_grouped()
    # ---
    result = get_wd_not_insql(tab_P11038, insql_lemma, insql_sama)
    # ---
    if limit > 0 and len(result) > limit:
        result = result[:limit]
    # ---
    return result, sparql_exec_time, db_exec_time
