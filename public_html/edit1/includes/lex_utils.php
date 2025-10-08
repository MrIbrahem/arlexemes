<?php

ini_set("display_errors", 1);
ini_set("display_startup_errors", 1);
error_reporting(E_ALL);

require_once __DIR__ . '/lex_data.php';

// Utility functions migrated from JavaScript

/**
 * Removes keys from colKeys array if they are not found in any form's grammatical features
 * @param array $colKeys Array of column keys
 * @param array $forms Array of forms
 * @param array $keysToRemove Array of keys to check and remove if not found
 * @return array Modified colKeys array
 */
function removeKeysIfNotFound($colKeys, $forms, $keysToRemove)
{


    $featuresSet = [];

    // Collect all grammaticalFeatures from all forms
    foreach ($forms as $form) {
        $feats = $form['tags'] ?? $form['grammaticalFeatures'] ?? [];
        foreach ($feats as $f) {
            $featuresSet[] = $f;
        }
    }
    $featuresSet = array_unique($featuresSet);

    $removed = [];

    // Check each key: is it present in any grammaticalFeatures?
    foreach ($keysToRemove as $key) {
        if (!in_array($key, $featuresSet)) {
            $index = array_search($key, $colKeys);
            if ($index !== false) {
                unset($colKeys[$index]);
                $removed[] = $key;
            }
        }
    }

    error_log("removeKeysIfNotFound removed: " . implode(", ", $removed));

    // Re-index array to maintain numeric order
    return array_values($colKeys);
}

/**
 * Creates a Wikidata link with label
 * @param string $key The key to create a link for
 * @param bool $add_qid Whether to add the QID to the label
 * @return string HTML anchor tag
 */
function wdlink_2($key, $add_qid = false)
{


    if (!$key || $key === "") return "";

    $qid = "";

    // if key starts with Q
    if (strpos($key, "Q") === 0) {
        $qid = $key;
    } else {
        $qid = isset($GLOBALS['en2qid'][strtolower($key)]) ? $GLOBALS['en2qid'][strtolower($key)] : $key;
    }

    $label = isset($GLOBALS['keyLabels'][$qid]) ?
        (($add_qid) ? $GLOBALS['keyLabels'][$qid] . " ($key)" : $GLOBALS['keyLabels'][$qid]) :
        $qid;

    return "<a href=\"https://www.wikidata.org/entity/$qid\" target=\"_blank\" class=\"text-primary\">$label</a>";
}

/**
 * Formats an attribute key with its label
 * @param string $key The key to format
 * @return string Formatted attribute string
 */
function attrFormatter($key)
{


    if (!$key || $key === "") return "";

    $qid = "";

    // if key starts with Q
    if (strpos($key, "Q") === 0) {
        $qid = $key;
    } else {
        $qid = isset($GLOBALS['en2qid'][strtolower($key)]) ? $GLOBALS['en2qid'][strtolower($key)] : $key;
    }

    return isset($GLOBALS['keyLabels'][$qid]) ? "$key - " . $GLOBALS['keyLabels'][$qid] : $key;
}

/**
 * Formats a form entry into HTML
 * @param array $form The form data
 * @return string HTML representation of the form
 */
function entryFormatterNew($form)
{
    $formId = $form['id'] ?? "L000-F0";

    // ar-x-Q775724
    $values = "";
    if (isset($form['representations']) && is_array($form['representations'])) {
        $valueArray = [];
        foreach ($form['representations'] as $r) {
            if (isset($r['value']) && $r['value']) {
                $valueArray[] = "<span class=\"words fs-4\" word=\"{$r['value']}\">{$r['value']}</span>";
            }
        }
        $values = implode(" / ", $valueArray);
    }

    if (empty($values) && isset($form['form'])) {
        $values = "<span class=\"words fs-4\" word=\"{$form['form']}\">{$form['form']}</span>";
    }

    $form_claims = $form['claims'] ?? [];
    $lemma_item = $form_claims['P6254'] ?? [];

    // "claims": { "P6254": [ { "mainsnak": { "snaktype": "value", "property": "P6254", "hash": "af059ae26aed43ea15031db491c9697fa273d0c9", "datavalue": { "value": { "entity-type": "lexeme", "numeric-id": 1490749, "id": "L1490749" }, "type": "wikibase-entityid" }, "datatype": "wikibase-lexeme" }, "type": "statement", "id": "L1485952-F112$51f8aa30-4921-906e-2839-86d2c7c3fc63", "rank": "normal" } ] }
    if (!empty($lemma_item)) {
        $lemma_id = $lemma_item[0]['mainsnak']['datavalue']['value']['id'] ?? null;
        if ($lemma_id) {
            $values = "
            <a href=\"https://www.wikidata.org/entity/$lemma_id\" target=\"_blank\">
                $values
            </a>&nbsp;";
        }
    }

    // Convert formId to a URL-friendly format for linking to Wikidata
    $formIdlink = str_replace("-", "#", $formId);
    $formId_parts = explode("-", $formId);
    $formId_number = $formId_parts[1] ?? "F0"; // Extract F-number part

    $feats = $form['tags'] ?? $form['grammaticalFeatures'] ?? [];
    $attrArray = [];
    foreach ($feats as $feat) {
        $attrArray[] = attrFormatter($feat);
    }
    $attr = implode("\n", $attrArray);

    $link = "
		$values <a title=\"$attr\" href=\"https://www.wikidata.org/entity/$formIdlink\" target=\"_blank\">
			<small>($formId_number)</small>
		</a>";

    $lexemeId = $formId_parts[0] ?? "L000";

    if ($lexemeId === "L000") {
        $link = "
        <span title=\"$attr\">
            $values
			<!-- <small>($formId_number)</small> -->
        </span>
        ";
    }

    $exampleList = $form_claims['P5831'] ?? [];

    $td = "
        $link
    ";

    return $td;
}

/**
 * Creates a multi-dimensional table data structure
 * @param array $number_Keys Array of number keys
 * @param array $row_Keys Array of row keys
 * @param array $col_Keys Array of column keys
 * @param array $gender_Keys Array of gender keys
 * @return array Multi-dimensional table data structure
 */
function make_tableData($number_Keys, $row_Keys, $col_Keys, $gender_Keys)
{


    $tableData = [];

    foreach ($number_Keys as $num) {
        $tableData[$num] = [];
        foreach ($row_Keys as $row) {
            $tableData[$num][$row] = [];
            foreach ($col_Keys as $col) {
                $tableData[$num][$row][$col] = [];
                foreach ($gender_Keys as $gender) {
                    if ($col === $GLOBALS['first_person'] && $gender === $GLOBALS['dual']) continue;
                    $tableData[$num][$row][$col][$gender] = [];
                }
            }
        }
    }

    return $tableData;
}
