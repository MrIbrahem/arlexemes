"""

from pyx.sparql_bots.render import render_sparql_P11038_grouped, render_all_arabic_by_category

"""

from . import sparql_bot


def render_sparql_P11038_grouped():
    # ---
    # ab_P11038, exec_time = render_sparql_P11038_grouped()
    # ---
    print("def render_sparql_P11038_grouped():")
    # ---
    dup = 0
    # ---
    # ?item ?lemma ?category ?categoryLabel ?P11038_values
    result, exec_time = sparql_bot.all_arabic_with_P11038_grouped()
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
    return tab_P11038, exec_time


def render_all_arabic_by_category(limit):
    # ---
    # split_by_category, exec_time = render_all_arabic_by_category(limit)
    # ---
    result, exec_time = sparql_bot.all_arabic(limit)
    # ---
    split_by_category = {}
    # ---
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
    # ---
    return split_by_category, exec_time
