# Arabic Lexemes Analysis Tool

A comprehensive web application for analyzing, comparing, and managing Arabic lexical data from Wikidata with integration to the Arabic Ontology.  

## Features

### Lexical Analysis
- **Morphological Analysis**: Interactive lexeme analysis with morphological table generation  
- **Autocomplete Search**: Real-time search with Wikidata integration  
- **Category Support**: Analysis for adjectives (Q34698), verbs (Q24905), nouns (Q1084), and roots (Q111029)  

### Data Management
- **Lexeme Listing**: Browse and filter lexemes by category with pagination  
- **Recent Lexemes**: View newest additions to the Arabic lexeme database  
- **Tree Visualization**: Hierarchical display of lexical data with grouping options  

### Quality Control
- **Duplicate Detection**: Identify and compare duplicate lexical entries  
- **Side-by-Side Comparison**: Compare multiple lexemes with detailed property analysis  
- **Arabic Ontology Integration**: Track P11038 property connections and synchronization status  

### Data Visualization
- **Statistical Charts**: Visual representation of lexical category distributions  
- **Performance Metrics**: Real-time query execution timing and data counts  

## Architecture

### Frontend Components
- **PHP Templates**: Jinja2-based template system extending `main.php` base template  
- **JavaScript Modules**: Modular client-side processing for SPARQL queries and data visualization  
- **Bootstrap UI**: Responsive design with Arabic language support and RTL layout  

### Backend Systems
- **Flask Application**: Python web framework handling routing and template rendering  
- **Database Integration**: MySQL database operations for lexeme storage and P11038 property management  
- **SPARQL Integration**: Direct queries to Wikidata SPARQL endpoint with result processing  

### Automated Synchronization
- **Scheduled Jobs**: Hourly synchronization with Wikidata using Toolforge job scheduler  
- **Data Processing**: Automated detection of new lexemes and P11038 property updates  

## Key Technologies

- **Backend**: Python 3.11, Flask, MySQL
- **Frontend**: JavaScript ES6+, Bootstrap 5, Chart.js, DataTables
- **Data Sources**: Wikidata SPARQL API, Arabic Ontology
- **Infrastructure**: Toolforge hosting with automated job scheduling

## Data Flow

The application processes Arabic lexical data through a multi-stage pipeline:  

1. **Data Retrieval**: SPARQL queries fetch lexeme data from Wikidata
2. **Processing**: Client-side JavaScript transforms and groups results by category
3. **Visualization**: Dynamic rendering of tables, charts, and comparison interfaces
4. **Synchronization**: Automated jobs maintain database consistency with external sources

## Development and Operations

### Development Environment Setup

The system requires Python 3.11 with Flask and MySQL dependencies.   Development setup includes:

- **Virtual Environment**: Python virtual environment with requirements installation
- **Database Schema**: MySQL database with UTF8MB4 encoding for Arabic text support  
- **Testing Framework**: Unit tests for database operations and data validation  

### Deployment Process

The deployment system uses automated shell scripts for code updates and service management:  

**Deployment Pipeline**:
1. **Backup Creation**: Current source code backed up with timestamp
2. **Git Clone**: Fresh repository clone from specified branch
3. **Dependency Installation**: Virtual environment activation and pip install
4. **Service Restart**: Automatic Python 3.11 webservice restart

The deployment script includes error handling with automatic rollback to previous backup if deployment fails.  

### Data Operations

**Bulk Data Ingestion**: The `insert_all.py` script handles large-scale data imports from JSON datasets with batch processing (100 records per batch) and duplicate detection.  

**Database Maintenance**: 
- Schema management through SQL scripts for both MySQL and SQLite environments
- Automated data validation and quality control through specialized bot modules
- Performance monitoring with execution time tracking for all database operations

### Monitoring and Performance

The system includes comprehensive performance monitoring:  

- **Request Timing**: Flask middleware tracks total request processing time
- **Database Performance**: Individual query execution times measured and reported
- **SPARQL Performance**: External API call timing for Wikidata integration  

### Testing and Quality Assurance

The testing framework includes database operation validation and data integrity checks:  

- **Unit Tests**: Database insertion and selection operations testing
- **Data Validation**: Automated checks for lemma consistency and P11038 property synchronization
- **Performance Testing**: Query execution time monitoring for optimization

## Notes

The system provides comprehensive Arabic lexical analysis capabilities with real-time Wikidata integration. The modular architecture separates concerns between data processing, visualization, and synchronization components. The application supports both manual analysis workflows and automated data management through scheduled synchronization jobs.
