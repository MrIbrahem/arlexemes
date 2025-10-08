<?php

ini_set("display_errors", 1);
ini_set("display_startup_errors", 1);
error_reporting(E_ALL);
require_once __DIR__ . '/lex_data.php';

/**
 * مigrate wdlink_2 function from JavaScript to PHP
 */
function wdlink_2($key, $add_qid = false)
{
    if (!$key || $key === "") return "";

    $qid = "";

    // if key starts with Q
    if (substr($key, 0, 1) === "Q") {
        $qid = $key;
    } else {
        $qid = isset($GLOBALS['en2qid'][strtolower($key)]) ? $GLOBALS['en2qid'][strtolower($key)] : $key;
    }

    $label = isset($GLOBALS['keyLabels'][$qid]) ?
        (($add_qid) ? $GLOBALS['keyLabels'][$qid] . " (" . $key . ")" : $GLOBALS['keyLabels'][$qid]) :
        $qid;

    return '<a href="https://www.wikidata.org/entity/' . $qid . '" target="_blank" class="text-primary">' . $label . '</a>';
}

/**
 * مigrate attrFormatter function from JavaScript to PHP
 */
function attrFormatter($key)
{
    if (!$key || $key === "") return "";

    $qid = "";

    // if key starts with Q
    if (substr($key, 0, 1) === "Q") {
        $qid = $key;
    } else {
        $qid = isset($GLOBALS['en2qid'][strtolower($key)]) ? $GLOBALS['en2qid'][strtolower($key)] : $key;
    }

    return (isset($GLOBALS['keyLabels'][$qid])) ? $key . " - " . $GLOBALS['keyLabels'][$qid] : $key;
}

/**
 * مigrate removeKeysIfNotFound function from JavaScript to PHP
 */
function removeKeysIfNotFound($colKeys, $forms, $keysToRemove)
{
    $featuresSet = [];

    // Collect all grammaticalFeatures from all forms
    foreach ($forms as $form) {
        $feats = isset($form['tags']) ? $form['tags'] : (isset($form['grammaticalFeatures']) ? $form['grammaticalFeatures'] : []);
        foreach ($feats as $f) {
            if (!in_array($f, $featuresSet)) {
                $featuresSet[] = $f;
            }
        }
    }

    $removed = [];

    // Check for each key: is it present in any grammaticalFeatures?
    foreach ($keysToRemove as $key) {
        if (!in_array($key, $featuresSet)) {
            $index = array_search($key, $colKeys);
            if ($index !== false) {
                unset($colKeys[$index]);
                $removed[] = $key;
            }
        }
    }

    // Reindex array after removals
    $colKeys = array_values($colKeys);

    error_log("removeKeysIfNotFound removed: " . implode(", ", $removed));

    return $colKeys;
}



/**
 * مigrate entryFormatterNew function from JavaScript to PHP
 */
function entryFormatterNew($form)
{
    $formId = isset($form['id']) ? $form['id'] : "L000-F0";

    // ar-x-Q775724
    $values = "";
    if (isset($form['representations']) && is_array($form['representations'])) {
        $rep_values = [];
        foreach ($form['representations'] as $r) {
            if (isset($r['value']) && $r['value']) {
                $rep_values[] = '<span class="words fs-4" word="' . htmlspecialchars($r['value']) . '">' . htmlspecialchars($r['value']) . '</span>';
            }
        }
        if (!empty($rep_values)) {
            $values = implode(" / ", $rep_values);
        }
    }

    if (!$values) {
        $form_value = isset($form['form']) ? $form['form'] : "";
        $values = '<span class="words fs-4" word="' . htmlspecialchars($form_value) . '">' . htmlspecialchars($form_value) . '</span>';
    }

    $form_claims = isset($form['claims']) ? $form['claims'] : [];
    $lemma_item = isset($form_claims['P6254']) ? $form_claims['P6254'] : [];

    // "claims": { "P6254": [ { "mainsnak": { "snaktype": "value", "property": "P6254", "hash": "af059ae26aed43ea15031db491c9697fa273d0c9", "datavalue": { "value": { "entity-type": "lexeme", "numeric-id": 1490749, "id": "L1490749" }, "type": "wikibase-entityid" }, "datatype": "wikibase-lexeme" }, "type": "statement", "id": "L1485952-F112$51f8aa30-4921-906e-2839-86d2c7c3fc63", "rank": "normal" } ] }
    if ($lemma_item) {
        $lemma_ids = [];
        foreach ($lemma_item as $item) {
            if (isset($item['mainsnak']['datavalue']['value']['id'])) {
                $lemma_ids[] = $item['mainsnak']['datavalue']['value']['id'];
            }
        }
        $lemma_id = !empty($lemma_ids) ? $lemma_ids[0] : null;
        if ($lemma_id) {
            $values = '
            <a href="https://www.wikidata.org/entity/' . $lemma_id . '" target="_blank">
                ' . $values . '
            </a>&nbsp;';
        }
    }

    // Convert formId to a URL-friendly format for linking to Wikidata
    $formIdlink = str_replace("-", "#", $formId);
    $formId_parts = explode("-", $formId);
    $formId_number = !empty($formId_parts) ? $formId_parts[1] : ""; // Extract F-number part

    $feats = isset($form['tags']) ? $form['tags'] : (isset($form['grammaticalFeatures']) ? $form['grammaticalFeatures'] : []);
    $attr = [];
    foreach ($feats as $feat) {
        $attr[] = attrFormatter($feat);
    }
    $attr = implode("\n", $attr);

    $link = '
        ' . $values . ' <a title="' . htmlspecialchars($attr) . '" href="https://www.wikidata.org/entity/' . $formIdlink . '" target="_blank">
            <small>(' . $formId_number . ')</small>
        </a>';

    $lexemeId_parts = explode("-", $formId);
    $lexemeId = !empty($lexemeId_parts) ? $lexemeId_parts[0] : "";

    if ($lexemeId === "L000") {
        $link = '
        <span title="' . htmlspecialchars($attr) . '">
            ' . $values . '
            <!-- <small>(' . $formId_number . ')</small> -->
        </span>
        ';
    }

    $exampleList = isset($form_claims['P5831']) ? $form_claims['P5831'] : [];

    $td = '
        ' . $link . '
    ';

    return $td;
}
