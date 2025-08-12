
'''
print(f"path1: {path1}")

from . import logs_db

__all__ = [
    "logs_db"
]
'''
'''
HOME = os.getenv("HOME")

if HOME:
    path2 = HOME + "/www/python/bots"
    sys.path.append(str(path2))
else:
    sys.path.append(path1)
'''
