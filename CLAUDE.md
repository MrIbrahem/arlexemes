# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Arabic Lexemes Analysis Tool - A Flask web application for analyzing, comparing, and managing Arabic lexical data from Wikidata with integration to the Arabic Ontology.

**Tech Stack**: Python 3.11 (Flask), JavaScript ES6+, Bootstrap 5, MySQL, Chart.js, DataTables

## Development Commands

```bash
# Run development server
cd python/src
python app.py debug

# Install dependencies
pip install -r python/src/requirements.txt

# Run tests
cd python/src
python -m pytest tests/
python tests/test_db.py  # single test

# Run scheduled jobs manually
python3 python/src/jobs/update_wd/wd_data.py
python3 python/src/jobs/insert_data/insert_all.py
```

## Architecture

### Backend Structure
- **Entry Point**: `python/src/app.py` - Flask application with all routes
- **Core Modules**: `python/src/pyx/`
  - `logs_db/` - MySQL database operations (db_mysql.py)
  - `sparql_bots/` - Wikidata SPARQL query handling
  - `wd_data_bots/` - Wikidata data operations
  - `bots/` - Error handling and matching utilities
- **Jobs**: `python/src/jobs/` - Scheduled tasks for Wikidata sync and bulk imports

### Frontend Structure
- **Templates**: `python/src/templates/` - Jinja2 templates extending `main.html`
- **JavaScript**: `python/src/static/js/`
  - `sparql.js` - SPARQL client utilities
  - `render.js` - DOM rendering helpers
  - `chart.js` - Chart.js integration
  - `lex/` and `lexemes/` - Lexeme analysis modules

### Database
- MySQL with UTF8MB4 encoding for Arabic text
- Schema: `python/mysql.sql` (MySQL) and `python/SQLite.sql` (SQLite)
- Key tables: `lemmas_p11038`, `wd_data`, `wd_data_p11038`

### API Pattern
- API endpoints under `/api/` prefix return JSON with structure:
  ```json
  {
    "load_time": 0.123,
    "data": { ... }
  }
  ```
- Page routes render Jinja2 templates

## Deployment

- **Platform**: Toolforge (Wikimedia Cloud Services)
- **Method**: GitHub Actions on push to main branch (`.github/workflows/`)
- **Manual deploy**: `~/sh/update_py.sh` and `~/sh/update_html.sh`
- **After deploy**: `toolforge-webservice python3.11 restart`

## Scheduled Jobs

Configured in `jobs.yaml`:
- SPARQL sync runs hourly (`'1 * * * *'`)
- Job command: `$HOME/sh/sparql.sh`

## Code Conventions

- Python files use UTF-8 encoding header: `# -*- coding: utf-8 -*-`
- Use dataclasses for structured data (see `RequestParams` in app.py)
- Database connections via context managers
- Performance tracking with `@track_performance` decorator
- JavaScript modules organized by feature
