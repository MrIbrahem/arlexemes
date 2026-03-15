import os

from pymysql.cursors import DictCursor


def load_db_config():  # -> dict[str, Any]:
    TOOL_REPLICA_PASSWORD = os.environ.get("TOOL_REPLICA_PASSWORD", "root11")
    TOOL_REPLICA_USER = os.environ.get("TOOL_REPLICA_USER", "root")
    DB_HOST_TOOLS = os.environ.get("DB_HOST_TOOLS", "localhost")
    TOOL_DB_NAME = os.environ.get("TOOL_DB_NAME", "arlexemes")

    return {
        "host": DB_HOST_TOOLS,
        "user": TOOL_REPLICA_USER,
        "password": TOOL_REPLICA_PASSWORD,
        "database": TOOL_DB_NAME,
        "charset": "utf8mb4",
        "cursorclass": DictCursor,
    }
