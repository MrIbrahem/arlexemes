# import os
import sys

path1 = __file__.replace("__init__.py", "")

sys.path.append(path1)

'''
HOME = os.getenv("HOME")

if HOME:
    path2 = HOME + "/www/python/bots"
    sys.path.append(str(path2))
else:
    sys.path.append(path1)
'''
