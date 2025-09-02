"""
Test runner for the application.

This script runs tests from different modules.
You can run all tests or specify a single test to run.

Usage:
    python3 test.py [test_name]

Example:
    python3 test.py sparql
"""
import sys
import types
from pathlib import Path

# Add the project root to the Python path
project_root = Path(__file__).parent.parent
sys.path.append(str(project_root))

# Import test modules

import test_db
import test_log
import sparql

def main() -> None:
    """
    Runs the tests.
    """
    test_modules = {
        "test_db": test_db,
        "test_log": test_log,
        "sparql": sparql,
    }

    selected_tests = get_selected_tests(test_modules)

    for test_name, module in selected_tests.items():
        print("-----------------------")
        print(f"Running test: {test_name}")
        if hasattr(module, "test") and callable(module.test):
            module.test()
        else:
            print(f"Warning: No 'test' function found in module {test_name}")

def get_selected_tests(available_tests: dict[str, types.ModuleType]) -> dict[str, types.ModuleType]:
    """
    Gets the selected tests based on command-line arguments.
    """
    args = sys.argv[1:]
    if not args:
        return available_tests

    selected = {
        arg: available_tests[arg]
        for arg in args
        if arg in available_tests
    }

    if not selected:
        print("No valid tests selected. Running all tests.")
        return available_tests

    return selected

if __name__ == "__main__":
    main()
