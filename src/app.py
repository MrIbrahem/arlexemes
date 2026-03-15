"""
Flask application for the Arabic lexemes project
Main entry point for the web application
"""

import sys

from load_env import _env_file_path  # noqa: F401
from main_app import create_app

app = create_app()

if __name__ == "__main__":
    """Run the Flask application"""
    debug = "debug" in sys.argv

    if debug:
        print("Debug mode enabled")
        print("Sample: http://localhost:9001/adminer.php?server=localhost&username=root&db=arlexemes")
    # ---
    app.run(debug=debug)
