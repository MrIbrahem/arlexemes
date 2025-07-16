# -*- coding: utf-8 -*-

import logs_db

# python3 I:/milion/arlexemes/python/src/tests/test_log.py
# ---


def test():
    x = logs_db.insert_lemma(lemma_id=0, lemma="", pos="", pos_cat="", Lid="", sama_lemma_id=0, sama_lemma="")
    # ---
    print(x)
