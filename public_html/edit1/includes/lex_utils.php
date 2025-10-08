<?php

namespace Lexeme\Utils;

ini_set("display_errors", 1);
ini_set("display_startup_errors", 1);
error_reporting(E_ALL);

// Utility functions migrated from JavaScript


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


function wdlink_2($key, $add_qid = false)
{
    // return $key;

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

    return <<<HTML
        <a href="https://www.wikidata.org/entity/$qid" target="_blank" class="text-primary">$label</a>
    HTML;
}


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


function entryFormatterNew($form)
{
    $formId = $form['id'] ?? "L000-F0";

    // ar-x-Q775724
    $values = "";
    if (isset($form['representations']) && is_array($form['representations'])) {
        $valueArray = [];
        foreach ($form['representations'] as $r) {
            if (isset($r['value']) && $r['value']) {
                $valueArray[] = <<<HTML
                    <span class="words fs-4" word="{$r['value']}">{$r['value']}</span>
                HTML;
            }
        }
        $values = implode(" / ", $valueArray);
    }

    if (empty($values) && isset($form['form'])) {
        $values = <<<HTML
            <span class="words fs-4" word="{$form['form']}">{$form['form']}</span>
        HTML;
    }

    $form_claims = $form['claims'] ?? [];
    $lemma_item = $form_claims['P6254'] ?? [];

    if (!empty($lemma_item)) {
        $lemma_id = $lemma_item[0]['mainsnak']['datavalue']['value']['id'] ?? null;
        if ($lemma_id) {
            $values = <<<HTML
                <a href="https://www.wikidata.org/entity/$lemma_id" target="_blank">
                    $values
                </a>&nbsp;
            HTML;
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

    $sorted_feats = $feats;
    $td_id = implode("_", $sorted_feats);
    // return $attr2;

    $link = <<<HTML
        $values <a title="$attr" href="https://www.wikidata.org/entity/$formIdlink" target="_blank">
        <small>($formId_number)</small>
        </a>
    HTML;

    $td = <<<HTML
        $link
    HTML;

    return $td;
}


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
