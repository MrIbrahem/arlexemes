<?php

ini_set("display_errors", 1);
ini_set("display_startup_errors", 1);
error_reporting(E_ALL);
require_once __DIR__ . '/lex_core.php';
require_once __DIR__ . '/lex_table_generation.php';

// Global variable for type
$GLOBALS['ty'] = "";

/**
 * migrate Q24905 function for verbs from JavaScript to PHP
 */
function generate_verb_table($entity) {
    $GLOBALS['ty'] = "verb";

    $forms = isset($entity['forms']) ? $entity['forms'] : [];

    $verbs_main = $GLOBALS['verbs_main_g'];

    $numberKeys = removeKeysIfNotFound($GLOBALS['numberKeys_verb'], $forms, array_merge($GLOBALS['additional_tenses'], [$GLOBALS['past_qid'], $GLOBALS['past_perfect_qid']]));

    $rowKeys = removeKeysIfNotFound($GLOBALS['gender_Keys_global'], $forms, ["Q1775461", "Q1305037"]);

    $colKeys = removeKeysIfNotFound($GLOBALS['first_second_third_person'], $forms, ["Q88778575"]);

    $spd = $GLOBALS['singular_plural_dual'];
    // remove "" from spd
    $spd = array_values(array_filter($spd, function($item) { return $item !== ""; }));

    $genderKeys = removeKeysIfNotFound($GLOBALS['singular_plural_dual'], $forms, $spd);

    // Initialize tableData structure: tableData[number][row][col][gender]
    $tableData = [];

    $display_mt_cells = [];
    foreach ($verbs_main as $verb) {
        $tableData[$verb] = make_tableData($numberKeys, $rowKeys, $colKeys, $genderKeys);
        $display_mt_cells[$verb] = false;
    }

    // Populate the tableData with forms based on their grammatical features
    foreach ($forms as $form) {
        $feats = isset($form['tags']) ? $form['tags'] : (isset($form['grammaticalFeatures']) ? $form['grammaticalFeatures'] : []);

        // البحث عن المطابقة، إذا لم يتم العثور عليها، استخدم المفتاح الفارغ ""
        $verb = "";
        foreach ($verbs_main as $vb) {
            if (in_array($vb, $feats)) {
                $verb = $vb;
                break;
            }
        }

        $number = "";
        foreach ($numberKeys as $num) {
            if (in_array($num, $feats)) {
                $number = $num;
                break;
            }
        }

        $row = "";
        foreach ($rowKeys as $r) {
            if (in_array($r, $feats)) {
                $row = $r;
                break;
            }
        }

        $col = "";
        foreach ($colKeys as $c) {
            if (in_array($c, $feats)) {
                $col = $c;
                break;
            }
        }

        $gender = "";
        foreach ($genderKeys as $g) {
            if (in_array($g, $feats)) {
                $gender = $g;
                break;
            }
        }

        if (!isset($tableData[$verb][$number][$row][$col][$gender])) {
            $tableData[$verb][$number][$row][$col][$gender] = [];
        }
        $tableData[$verb][$number][$row][$col][$gender][] = $form;

        // if any (number, row, col, gender) is "" set display_mt_cells to true
        $display_mt_cells[$verb] = in_array("", [$number, $col, $gender]);
    }

    $result = "";

    foreach ($verbs_main as $verb) {
        $verb2 = ($verb !== "") ? $verb : "فعل آخر";
        $verb_lab = wdlink_2($verb2, true);
        $caption = '<div class="text-center"><h3>' . $verb_lab . '</h3></div>';
        // Call the shared HTML generation function
        $mt_cells = isset($display_mt_cells[$verb]) ? $display_mt_cells[$verb] : false;
        $result .= _generateHtmlTable($tableData[$verb], $numberKeys, $rowKeys, $colKeys, $genderKeys, $caption, $mt_cells);
    }

    return $result;
}

/**
 * migrate adj_and_nouns function from JavaScript to PHP
 */
function generate_noun_adj_table($entity_type, $entity) {
    $forms = isset($entity['forms']) ? $entity['forms'] : [];

    $row_Keys = removeKeysIfNotFound($GLOBALS['Pausal_Forms'], $forms, ["Q146233", "Q1095813", "Q117262361"]);
    $genderKeys = removeKeysIfNotFound($GLOBALS['gender_Keys_global'], $forms, [$GLOBALS['Masculine'], $GLOBALS['Feminine'], "Q1775461", "Q1305037"]);

    $colKeys = $GLOBALS['indefinite_definite_construct'];
    $colKeys = removeKeysIfNotFound($colKeys, $forms, $GLOBALS['construct_contextform']);

    $number_Keys = isset($GLOBALS['adj_and_nouns_keys'][$entity_type]) ? $GLOBALS['adj_and_nouns_keys'][$entity_type] : [];

    $tableData = make_tableData($number_Keys, $row_Keys, $colKeys, $genderKeys);

    $display_mt_cells = false;

    // Populate the tableData with forms based on their grammatical features
    foreach ($forms as $form) {
        $feats = isset($form['tags']) ? $form['tags'] : (isset($form['grammaticalFeatures']) ? $form['grammaticalFeatures'] : []);

        $number = "";
        foreach ($number_Keys as $num) {
            if (in_array($num, $feats)) {
                $number = $num;
                break;
            }
        }

        $row = "";
        foreach ($row_Keys as $r) {
            if (in_array($r, $feats)) {
                $row = $r;
                break;
            }
        }

        $col = "";
        foreach ($colKeys as $c) {
            if (in_array($c, $feats)) {
                $col = $c;
                break;
            }
        }

        $gender = "";
        foreach ($genderKeys as $g) {
            if (in_array($g, $feats)) {
                $gender = $g;
                break;
            }
        }

        if (!isset($tableData[$number][$row][$col][$gender])) {
            $tableData[$number][$row][$col][$gender] = [];
        }
        $tableData[$number][$row][$col][$gender][] = $form;

        // if any (number, row, col, gender) is "" set display_mt_cells to true
        $display_mt_cells = in_array("", [$number, $row, $col, $gender]);
    }

    // Call the shared HTML generation function
    return _generateHtmlTable($tableData, $number_Keys, $row_Keys, $colKeys, $genderKeys, "", $display_mt_cells);
}

?>
