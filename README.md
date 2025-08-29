# Arabic Lexemes Analysis Tool

A comprehensive web application for analyzing, comparing, and managing Arabic lexical data from Wikidata with integration to the Arabic Ontology. [1](#0-0) 

## Features

### Lexical Analysis
- **Morphological Analysis**: Interactive lexeme analysis with morphological table generation [2](#0-1) 
- **Autocomplete Search**: Real-time search with Wikidata integration [3](#0-2) 
- **Category Support**: Analysis for adjectives (Q34698), verbs (Q24905), nouns (Q1084), and roots (Q111029) [4](#0-3) 

### Data Management
- **Lexeme Listing**: Browse and filter lexemes by category with pagination [5](#0-4) 
- **Recent Lexemes**: View newest additions to the Arabic lexeme database [6](#0-5) 
- **Tree Visualization**: Hierarchical display of lexical data with grouping options [7](#0-6) 

### Quality Control
- **Duplicate Detection**: Identify and compare duplicate lexical entries [8](#0-7) 
- **Side-by-Side Comparison**: Compare multiple lexemes with detailed property analysis [9](#0-8) 
- **Arabic Ontology Integration**: Track P11038 property connections and synchronization status [10](#0-9) 

### Data Visualization
- **Statistical Charts**: Visual representation of lexical category distributions [11](#0-10) 
- **Performance Metrics**: Real-time query execution timing and data counts [12](#0-11) 

## Architecture

### Frontend Components
- **PHP Templates**: Jinja2-based template system extending `main.php` base template [13](#0-12) 
- **JavaScript Modules**: Modular client-side processing for SPARQL queries and data visualization [14](#0-13) 
- **Bootstrap UI**: Responsive design with Arabic language support and RTL layout [15](#0-14) 

### Backend Systems
- **Flask Application**: Python web framework handling routing and template rendering [16](#0-15) 
- **Database Integration**: MySQL database operations for lexeme storage and P11038 property management [17](#0-16) 
- **SPARQL Integration**: Direct queries to Wikidata SPARQL endpoint with result processing [18](#0-17) 

### Automated Synchronization
- **Scheduled Jobs**: Hourly synchronization with Wikidata using Toolforge job scheduler [19](#0-18) 
- **Data Processing**: Automated detection of new lexemes and P11038 property updates [20](#0-19) 

## Key Technologies

- **Backend**: Python 3.11, Flask, MySQL
- **Frontend**: JavaScript ES6+, Bootstrap 5, Chart.js, DataTables
- **Data Sources**: Wikidata SPARQL API, Arabic Ontology
- **Infrastructure**: Toolforge hosting with automated job scheduling

## Data Flow

The application processes Arabic lexical data through a multi-stage pipeline: [21](#0-20) 

1. **Data Retrieval**: SPARQL queries fetch lexeme data from Wikidata
2. **Processing**: Client-side JavaScript transforms and groups results by category
3. **Visualization**: Dynamic rendering of tables, charts, and comparison interfaces
4. **Synchronization**: Automated jobs maintain database consistency with external sources

## Development and Operations

### Development Environment Setup

The system requires Python 3.11 with Flask and MySQL dependencies. [1](#1-0)  Development setup includes:

- **Virtual Environment**: Python virtual environment with requirements installation
- **Database Schema**: MySQL database with UTF8MB4 encoding for Arabic text support [2](#1-1) 
- **Testing Framework**: Unit tests for database operations and data validation [3](#1-2) 

### Deployment Process

The deployment system uses automated shell scripts for code updates and service management: [4](#1-3) 

**Deployment Pipeline**:
1. **Backup Creation**: Current source code backed up with timestamp
2. **Git Clone**: Fresh repository clone from specified branch
3. **Dependency Installation**: Virtual environment activation and pip install
4. **Service Restart**: Automatic Python 3.11 webservice restart

The deployment script includes error handling with automatic rollback to previous backup if deployment fails. [5](#1-4) 

### Data Operations

**Bulk Data Ingestion**: The `insert_all.py` script handles large-scale data imports from JSON datasets with batch processing (100 records per batch) and duplicate detection. [6](#1-5) 

**Database Maintenance**: 
- Schema management through SQL scripts for both MySQL and SQLite environments
- Automated data validation and quality control through specialized bot modules
- Performance monitoring with execution time tracking for all database operations

### Monitoring and Performance

The system includes comprehensive performance monitoring: [7](#1-6) 

- **Request Timing**: Flask middleware tracks total request processing time
- **Database Performance**: Individual query execution times measured and reported
- **SPARQL Performance**: External API call timing for Wikidata integration [8](#1-7) 

### Testing and Quality Assurance

The testing framework includes database operation validation and data integrity checks: [9](#1-8) 

- **Unit Tests**: Database insertion and selection operations testing
- **Data Validation**: Automated checks for lemma consistency and P11038 property synchronization
- **Performance Testing**: Query execution time monitoring for optimization

## Notes

The system provides comprehensive Arabic lexical analysis capabilities with real-time Wikidata integration. The modular architecture separates concerns between data processing, visualization, and synchronization components. The application supports both manual analysis workflows and automated data management through scheduled synchronization jobs.
