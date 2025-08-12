# -*- coding: utf-8 -*-

from pyx.logs_db.bot import select as _select
from pyx.logs_db.insert import insert_lemma

# python3 I:/milion/arlexemes/python/src/test.py
# ---


def select(key, value):
    # ---
    data = {key: value}
    # ---
    result = _select(data=data, table_name="P11038_lemmas", limit=0, offset=0, order="DESC", order_by="id")
    # ---
    return result


def test():

    insert_lemma(lemma_id=202000713, lemma="آخَرُ", pos="صفة", pos_cat="اسم", sama_lemma_id="", sama_lemma="", wd_id="")
    print(select(key="lemma_id", value="202000713"))

    insert_lemma(lemma_id=202000713, lemma="آخَرُ", pos="", pos_cat="", sama_lemma_id=390010035, sama_lemma="آخَر", wd_id="")
    print(select(key="sama_lemma_id", value="390010035"))

    insert_lemma(lemma_id=202000713, lemma="آخَرُ", pos="", pos_cat="", sama_lemma_id="", sama_lemma="", wd_id="L13303")
    print(select(key="wd_id", value="L13303"))
