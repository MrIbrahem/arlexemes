from pathlib import Path
from configparser import ConfigParser
from pymysql.cursors import DictCursor


def load_db_config():
    # --- 1) تحقق من ملف الإنتاج ~/replica.my.cnf ---
    replica_cnf_path = Path.home() / "replica.my.cnf"
    if replica_cnf_path.exists():
        parser = ConfigParser()
        parser.read(replica_cnf_path)

        user = parser.get("client", "user", fallback=None)
        password = parser.get("client", "password", fallback=None)

        return {
            "host": "tools.db.svc.wikimedia.cloud",
            "user": user,
            "password": password,
            "database": f"{user}__arlexemes",
            "charset": "utf8mb4",
            "cursorclass": DictCursor
        }

    return {
        "host": "localhost",
        "user": "root",
        "password": "root11",
        "database": "arlexemes",
        "charset": "utf8mb4",
        "cursorclass": DictCursor
    }
