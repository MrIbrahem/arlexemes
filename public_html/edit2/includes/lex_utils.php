<?php

ini_set("display_errors", 1);
ini_set("display_startup_errors", 1);
error_reporting(E_ALL);
require_once __DIR__ . '/lex_data.php';

/**
 * مigrate wdlink_2 function from JavaScript to PHP
 */
function wdlink_2($key, $add_qid = false) {
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
function attrFormatter($key) {
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
function removeKeysIfNotFound($colKeys, $forms, $keysToRemove) {
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

?>
