from pathlib import Path

from dotenv import load_dotenv

_env_file_path = Path(__file__).parent / ".env"

if _env_file_path.exists():
    load_dotenv(str(_env_file_path))
