<?php

ini_set("display_errors", 1);
ini_set("display_startup_errors", 1);
error_reporting(E_ALL);
require_once __DIR__ . '/lex_core.php';
require_once __DIR__ . '/lex_table_generation.php';

// Global variable for type
$GLOBALS['ty'] = "";


/**
 * Generates verb table
 * @param array $entity Entity data
 * @return string Generated HTML table
 */
function generate_verb_table($entity)
{
    global $ty;

    $ty = "verb";

    $forms = $entity['forms'] ?? [];

    $verbs_main = $GLOBALS['verbs_main_g'];

    $numberKeys = removeKeysIfNotFound($GLOBALS['numberKeys_verb'], $forms, array_merge($GLOBALS['additional_tenses'], [$GLOBALS['past_qid'], $GLOBALS['past_perfect_qid']]));

    $rowKeys = removeKeysIfNotFound($GLOBALS['gender_Keys_global'], $forms, ["Q1775461", "Q1305037"]);

    $colKeys = removeKeysIfNotFound($GLOBALS['first_second_third_person'], $forms, ["Q88778575"]); // Q21714344

    $spd = $GLOBALS['singular_plural_dual'];
    // remove "" from spd
    $spd = array_filter($spd, function ($item) {
        return $item !== "";
    });

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
        $feats = $form['tags'] ?? $form['grammaticalFeatures'] ?? [];

        // البحث عن المطابقة، إذا لم يتم العثور عليها، استخدم المفتاح الفارغ ""
        $verb = "";
        foreach ($verbs_main as $v) {
            if (in_array($v, $feats)) {
                $verb = $v;
                break;
            }
        }

        $number = "";
        foreach ($numberKeys as $n) {
            if (in_array($n, $feats)) {
                $number = $n;
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

        $gender = "";
        foreach ($genderKeys as $g) {
            if (in_array($g, $feats)) {
                $gender = $g;
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

        $tableData[$verb][$number][$row][$col][$gender][] = $form;

        // if any (number, row, col, gender) is "" set display_mt_cells to true
        $display_mt_cells[$verb] = in_array("", [$number, $col, $gender]);
    }

    $result = "";

    foreach ($verbs_main as $verb) {
        $verb2 = ($verb !== "") ? $verb : "فعل آخر";
        $verb_lab = wdlink_2($verb2, true);
        $caption = "<div class=\"text-center\"><h3>$verb_lab</h3></div>";
        // Call the shared HTML generation function
        $mt_cells = $display_mt_cells[$verb] ?? false;
        $result .= _generateHtmlTable($tableData[$verb], $numberKeys, $rowKeys, $colKeys, $genderKeys, $caption, $mt_cells);
    }

    return $result;
}

/**
 * Generates noun/adjective table
 * @param string $entity_type Entity type
 * @param array $entity Entity data
 * @return string Generated HTML table
 */
function generate_noun_adj_table($entity_type, $entity)
{

    $forms = $entity['forms'] ?? [];

    $row_Keys = removeKeysIfNotFound($GLOBALS['Pausal_Forms'], $forms, ["Q146233", "Q1095813", "Q117262361"]);
    $genderKeys = removeKeysIfNotFound($GLOBALS['gender_Keys_global'], $forms, [$GLOBALS['Masculine'], $GLOBALS['Feminine'], "Q1775461", "Q1305037"]);

    $colKeys = $GLOBALS['indefinite_definite_construct'];
    $colKeys = removeKeysIfNotFound($colKeys, $forms, $GLOBALS['construct_contextform']);

    $number_Keys = $GLOBALS['adj_and_nouns_keys'][$entity_type] ?? [];

    $tableData = make_tableData($number_Keys, $row_Keys, $colKeys, $genderKeys);

    $display_mt_cells = false;

    // Populate the tableData with forms based on their grammatical features
    foreach ($forms as $form) {
        $feats = $form['tags'] ?? $form['grammaticalFeatures'] ?? [];

        $number = "";
        foreach ($number_Keys as $n) {
            if (in_array($n, $feats)) {
                $number = $n;
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

        $gender = "";
        foreach ($genderKeys as $g) {
            if (in_array($g, $feats)) {
                $gender = $g;
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

        $tableData[$number][$row][$col][$gender][] = $form;

        // if any (number, row, col, gender) is "" set display_mt_cells to true
        $display_mt_cells = in_array("", [$number, $row, $col, $gender]);
    }

    $result = "";

    $entity_type_label = wdlink_2($entity_type, true);
    $caption = "<div class=\"text-center\"><h3>$entity_type_label</h3></div>";

    $result .= _generateHtmlTable($tableData, $number_Keys, $row_Keys, $colKeys, $genderKeys, $caption, $display_mt_cells);

    return $result;
}
