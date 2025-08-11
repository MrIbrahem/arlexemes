"""

from pyx.bots.not_in_db_bot import get_not_in_db

# result, exec_time = get_not_in_db(limit)

"""

from .match_sparql import get_wd_not_insql
from ..sparql_bots.render import render_sparql_P11038_grouped


def get_not_in_db(limit=0):
    # ---
    exec_time = 0
    # ---
    result = []
    # ---
    tab_P11038, exec_time = render_sparql_P11038_grouped()
    # ---
    result = get_wd_not_insql(tab_P11038)
    # ---
    if limit > 0:
        result = result[:limit]
    # ---
    return result, exec_time
