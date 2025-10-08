Writing a business plan for an AI assistant to transition the `lex.php` page from JavaScript to PHP is beyond the scope of this interaction, as that would be a large-scale project management and strategic document.

However, I can provide a **Technical Action Plan** in English detailing the steps and reasoning for the AI agent to refactor the functionality currently in `js/lex.js`, `js/lex_data.js`, and `js/lex_page.js` into server-side PHP code within `index2.php` (or a dedicated PHP file that `index2.php` calls).

This plan focuses on replacing client-side (browser) data fetching and table generation with server-side (PHP) execution, which is the core of the request.

-----

# Technical Action Plan: PHP Migration for Lexeme Display

## 1\. Objective

To eliminate the reliance on client-side JavaScript for fetching Wikidata data, processing grammatical features, and generating the HTML inflected forms table on the `index2.php` page, by migrating all such logic to **server-side PHP**. This will improve initial load performance, enhance SEO, and reduce dependency on the client environment.

-----

## 2\. Scope of Work

The following JavaScript functions and files must be fully migrated to equivalent PHP functions:

| JS File | Target PHP Functionality | Core Logic to Migrate |
| :--- | :--- | :--- |
| `js/lex_page.js` | Data Fetching & Main Flow | `getentity()`, `filter_forms()`, `fetchLexemeById()`, `start_lexeme()` |
| `js/lex.js` | Table Generation & Logic | `Q24905()`, `adj_and_nouns()`, `make_tableData()`, `make_thead()`, `make_tbody()`, `_generateHtmlTable()` |
| `js/data.js` | Data Mapping | `keyLabels`, `en2qid`, `grammaticalFeaturesLabels` (These will become PHP arrays/constants.) |
| `js/lex_data.js` | Data Structure Keys | All constant arrays (e.g., `singular_plural_dual`, `numberKeys_verb`, `adj_and_nouns_keys`) |

-----

## 3\. Detailed Action Steps

### Phase 1: Data and Utility Migration

The goal is to establish the necessary data and helper functions in PHP first.

1.  **Migrate Data Arrays:**
      * Convert all data-defining JavaScript arrays and objects from `js/data.js` and `js/lex_data.js` (e.g., `keyLabels`, `grammaticalFeaturesLabels`, `singular_plural_dual`, `verbs_main_g`) into **PHP associative arrays and constants** (e.g., `\$keyLabels`, `define('FIRST_PERSON', 'Q21714344');`).
2.  **Migrate Utility Functions:**
      * Translate `wdlink_2(key, add_qid)` into a PHP function, utilizing the migrated `\$keyLabels` and the QID mapping logic.
      * Translate `attrFormatter(key)` into a PHP function for formatting attribute labels.
      * Translate `removeKeysIfNotFound(colKeys, forms, keysToRemove)` into a robust PHP function that takes the key array and forms array, performing the filtering logic server-side.

### Phase 2: Core Data Processing Migration

This involves replacing the client-side data fetching and form filtering.

1.  **Replace `getentity()` with Server-Side Fetch:**
      * Create a PHP function, e.g., `fetch_wikidata_entity(\$id)` that uses PHP's **cURL** or `file_get_contents()` (with proper error handling) to make the `wbgetentities` API request to Wikidata. It must return the parsed entity array.
2.  **Migrate Form Filtering:**
      * Translate `filter_forms(forms)` from `js/lex_page.js` into a PHP function, ensuring all exclusion logic (based on `to_dis_tags` and tag length/content) is correctly applied to the forms array *before* table generation.
3.  **Migrate Entry Formatting:**
      * Translate `entryFormatterNew(form)` into a PHP function. This function takes a form object and returns the complete HTML string (`<a>` tags, `<span>` for words, etc.), essentially generating the content for a single cell. *Crucially, it must use the server's current environment for generating URLs, not JavaScript.*

### Phase 3: Table Structure and Generation Migration

This is the most complex phase, involving the table generation logic.

1.  **Migrate Table Data Structure:**
      * Translate `make_tableData(...)` into a PHP function. It will be used to initialize the multi-dimensional array (`\$tableData`) that organizes the forms by **Number, Row, Column, and Gender** (e.g., `\$tableData[\$number][\$row][\$col][\$gender]`).
2.  **Migrate Lexeme Type Logic (Q24905, adj\_and\_nouns):**
      * Create PHP functions `generate_verb_table(\$entity)` and `generate_noun_adj_table(\$entity, \$category)`.
      * These functions must contain the feature lookup logic (`$feats = $form['tags'] ?? $form['grammaticalFeatures'] ?? [];`) to map each form's features to the correct cell coordinates within the `\$tableData` array.
3.  **Migrate HTML Rendering:**
      * Translate `make_thead(...)` and `make_tbody(...)` into PHP functions. These will iterate over the fully populated `\$tableData` array.
      * The `make_tbody` function, particularly the call to `create_gender_tds`, must correctly implement the complex Arabic grammar rowspan logic (e.g., checks for `first-person` and `dual`).
      * Use the PHP-version of `entryFormatterNew` to populate the `<td>` content.
      * The main function `_generateHtmlTable(...)` will orchestrate the call to the header and body functions, wrapping the result in the final Card/Table HTML structure.

### Phase 4: Integration into `index2.php`

1.  **Remove JS References:**
      * Delete the `<script>` tags for `js/lex.js`, `js/lex_data.js`, and `js/lex_page.js` from `index2.php`.
2.  **Integrate PHP Logic:**
      * In `index2.php`, remove the main jQuery/JavaScript block: `$(document).ready(async function() { ... });`.
      * Implement a PHP block to handle the request:
        ```php
        <?php
        $lex_id = $_GET['lex'] ?? $_GET['wd_id'] ?? null;
        if ($lex_id) {
            // 1. Call fetch_wikidata_entity($lex_id)
            // 2. Call filter_forms()
            // 3. Determine category
            // 4. Call generate_verb_table() or generate_noun_adj_table()
            // 5. Echo the final HTML output into the <div id="output">
        }
        ?>
        ```
      * The final HTML will be echoed into the `<div id="output">` directly, making it static and ready on page load.
