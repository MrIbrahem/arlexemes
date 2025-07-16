# -*- coding: utf-8 -*-

import logs_db

# python3 I:/milion/arlexemes/python/src/test.py
# ---


def test():

    logs_db.insert_lemma(lemma_id=202000713, lemma="آخَرُ", pos="صفة", pos_cat="اسم", Lid="", sama_lemma_id="", sama_lemma="")

    logs_db.insert_lemma(lemma_id=202000713, lemma="آخَرُ", pos="", pos_cat="", Lid="", sama_lemma_id=390010035, sama_lemma="آخَر")

    logs_db.insert_lemma(lemma_id=202000713, lemma="آخَرُ", pos="", pos_cat="", Lid="L13303", sama_lemma_id="", sama_lemma="")
