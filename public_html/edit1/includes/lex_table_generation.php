<?php

ini_set("display_errors", 1);
ini_set("display_startup_errors", 1);
error_reporting(E_ALL);

require_once __DIR__ . '/lex_functions.php';

// Table generation functions migrated from JavaScript

$display_empty_cells = true;
$ty = "";

/**
 * Creates table header HTML
 * @param array $first_rows Array of first row headers
 * @param array $second_rows Array of second row headers
 * @param string $first_person First person identifier
 * @param string $dual Dual identifier
 * @param bool $display_mt_cells Whether to display empty cells
 * @return string Table header HTML
 */
function make_thead($first_rows, $second_rows, $first_person, $dual, $display_mt_cells)
{
    global $display_empty_cells;

    $show_empty_cells = ($display_mt_cells === false || $display_mt_cells === true) ? $display_mt_cells : $display_empty_cells;

    $thead = "
        <tr data-dt-order=\"disable\">
            <th colspan=\"2\" class=\"\"></th>
    ";

    // الصف الأول من الرؤوس
    foreach ($first_rows as $gender) {
        $colspan = count($second_rows);

        if (in_array($first_person, $second_rows) && $gender === $dual) {
            $colspan -= 1;
        }

        if (!$show_empty_cells && in_array("", $second_rows)) {
            $colspan -= 1;
        }

        $headerText = (count($first_rows) === 1 && $gender === "") ? "النوع" : wdlink_2($gender);

        if (!$show_empty_cells && $gender === "" && count($first_rows) > 1) continue;

        $thead .= "
            <th colspan=\"$colspan\" class=\"\">
            <span class=\"\">
                $headerText
            </span>
            </th>
        ";
    }

    $thead .= "
        </tr>
        <tr>
            <th scope=\"col\" data-dt-order=\"disable\" class=\"\">
            </th> <!-- Top-left empty cell, spans two rows -->
            <th scope=\"col\" data-dt-order=\"disable\" class=\"\">
                <span class=\"\">
                    الحالة
                </span>
            </th>
    ";

    // الصف الثاني من الرؤوس
    foreach ($first_rows as $gender) {
        if (!$show_empty_cells && $gender === "" && count($first_rows) > 1) continue;

        foreach ($second_rows as $col) {
            if (!$show_empty_cells && $col === "") continue;

            if ($col === $first_person && $gender === $dual) {
                // تجاهل هذه الخلية
                continue;
            }

            $text = wdlink_2($col);

            $thead .= "
                <th scope=\"col\" class=\"\">
                    <span class=\"\">
                        $text
                    </span>
                </th>
            ";
        }
    }

    $thead .= "
        </tr>
    ";

    return $thead;
}

/**
 * Creates right side table header cells
 * @param int $i Row index
 * @param string $number Number identifier
 * @param string $row Row identifier
 * @param array $row_Keys Array of row keys
 * @param bool $display_mt_cells Whether to display empty cells
 * @return string HTML for right side headers
 */
function right_side_th($i, $number, $row, $row_Keys, $display_mt_cells)
{
    global $display_empty_cells;

    $show_empty_cells = ($display_mt_cells === false || $display_mt_cells === true) ? $display_mt_cells : $display_empty_cells;

    $add_to_tbody = "";

    // Add the number header (مفرد or جمع) in the first column, spanning all case rows
    if ($i === 0) {
        $text = wdlink_2($number);
        $rowspan = count($row_Keys);

        if (!$show_empty_cells && in_array("", $row_Keys)) {
            $rowspan -= 1;
        }

        $add_th = "
            <th rowspan=\"$rowspan\" class=\"table-light\" scope=\"row\">
                <span class=\"\">
                    $text
                </span>
            </th>
        ";

        if (!$show_empty_cells && $number === "") $add_th = "";

        $add_to_tbody .= $add_th;
    }

    $text2 = wdlink_2($row);

    $add_th2 = "
        <th scope=\"row\" class=\"\">
            <span class=\"\">
                $text2
            </span>
        </th>
    ";

    if (!$show_empty_cells && $row === "") $add_th2 = "";

    // Add the case header (e.g., رفع) in the second column
    $add_to_tbody .= $add_th2;

    return $add_to_tbody;
}

/**
 * Creates gender-specific table cells
 * @param array $col_Keys Array of column keys
 * @param string $gender Gender identifier
 * @param bool $show_empty_cells Whether to show empty cells
 * @param array $number_data Number data
 * @param string $row Row identifier
 * @param array $singular_fixed Array to track fixed singular forms
 * @return string HTML for gender cells
 */
function create_gender_tds($col_Keys, $gender, $show_empty_cells, $number_data, $row, &$singular_fixed)
{
    global $first_person, $dual, $singular, $plural, $Masculine, $Feminine;

    $gender_tds = "";

    foreach ($col_Keys as $col) {
        if ($col === $first_person && $gender === $dual) continue;

        if (!$show_empty_cells && $col === "") continue;

        $entries = $number_data[$row][$col][$gender] ?? [];

        global $second_person;
        $check_1 = $col === $first_person && ($gender === $singular || $gender === $plural);
        $check_2 = $col === $second_person && $gender === $dual;

        $rowspan = 1;

        if ($check_1 || $check_2) {
            if (isset($singular_fixed[$gender]) && $singular_fixed[$gender]) continue;

            $fem_entries = $number_data[$Feminine][$col][$gender] ?? [];
            $third_entries = $number_data[""][$col][$gender] ?? [];

            $male_is_empty = !empty($third_entries) && empty($entries);
            $third_is_empty = !empty($entries) && empty($third_entries);

            if ($row === $Masculine && empty($fem_entries) && ($male_is_empty || $third_is_empty)) {
                $entries = $male_is_empty ? $third_entries : $entries;
                $singular_fixed[$gender] = true;
                $rowspan = $show_empty_cells ? 3 : 2;
            }
        }

        $span_a = $rowspan > 1 ? "rowspan=\"$rowspan\"" : "";
        $td = "<td $span_a style=\"position:relative;\" class=\"\">";

        foreach ($entries as $entry) {
            $td .= entryFormatterNew($entry) . "<br>";
        }

        $td .= "</td>";

        $gender_tds .= $td;
    }

    return $gender_tds;
}

/**
 * Creates table body HTML
 * @param array $number_Keys Array of number keys
 * @param array $tableData Table data structure
 * @param bool $show_empty_cells Whether to show empty cells
 * @param array $row_Keys Array of row keys
 * @param array $gender_Keys Array of gender keys
 * @param array $col_Keys Array of column keys
 * @return string Table body HTML
 */
function make_tbody($number_Keys, $tableData, $show_empty_cells, $row_Keys, $gender_Keys, $col_Keys)
{
    global $display_empty_cells;

    $show_empty_cells = ($show_empty_cells === false || $show_empty_cells === true) ? $show_empty_cells : $display_empty_cells;

    $tbody = "";

    // Iterate through number categories (مفرد, جمع)
    foreach ($number_Keys as $number) {
        $number_data = $tableData[$number] ?? [];

        if (!$show_empty_cells && $number === "") continue;

        // Check if there is any data for this number category to avoid empty sections
        $hasNumberData = false;
        foreach ($row_Keys as $row) {
            foreach ($gender_Keys as $gender) {
                foreach ($col_Keys as $col) {
                    if (!empty($number_data[$row][$col][$gender])) {
                        $hasNumberData = true;
                        break 3;
                    }
                }
            }
        }

        if (!$hasNumberData) continue; // Skip displaying this number category if no data

        $singular_fixed = [];

        // Iterate through case rows (وقف, رفع, نصب, إضافة) for each number category
        for ($i = 0; $i < count($row_Keys); $i++) {
            $row = $row_Keys[$i];

            if (!$show_empty_cells && $row === "") continue;

            $add_to_tbody = right_side_th($i, $number, $row, $row_Keys, $show_empty_cells);

            // Add the data cells for each gender and column type
            foreach ($gender_Keys as $gender) {
                if (!$show_empty_cells && $gender === "" && count($gender_Keys) > 1) continue;

                $gender_tds = create_gender_tds($col_Keys, $gender, $show_empty_cells, $number_data, $row, $singular_fixed);
                $add_to_tbody .= $gender_tds;
            }

            if ($add_to_tbody !== "") {
                $tbody .= "
                    <tr>
                    $add_to_tbody
                    </tr>
                ";
            }
        }
    }

    return $tbody;
}

/**
 * Generates the complete HTML table
 * @param array $tableData Table data structure
 * @param array $first_collumn Array of first column keys
 * @param array $second_collumn Array of second column keys
 * @param array $second_rows Array of second row keys
 * @param array $first_rows Array of first row keys
 * @param string $title_header Table title
 * @param bool $display_mt_cells Whether to display empty cells
 * @return string Complete HTML table
 */
function _generateHtmlTable($tableData, $first_collumn, $second_collumn, $second_rows, $first_rows, $title_header, $display_mt_cells)
{
    global $display_empty_cells, $first_person, $dual;

    $show_empty_cells = ($display_mt_cells === false || $display_mt_cells === true) ? $display_mt_cells : $display_empty_cells;

    $number_Keys = $first_collumn;
    $gender_Keys = $first_rows;
    $col_Keys = $second_rows;
    $row_Keys = $second_collumn;

    $thead = make_thead($gender_Keys, $col_Keys, $first_person, $dual, $show_empty_cells);
    $tbody = make_tbody($number_Keys, $tableData, $show_empty_cells, $row_Keys, $gender_Keys, $col_Keys);

    if ($tbody === "") return "";

    $html = "
        <table idx=\"main_table\" class=\"table table-bordered table-sm table-hover text-center align-middle pages_table\">
            <thead class=\"table-light\">
                $thead
            </thead>
            <tbody>
                $tbody
            </tbody>
        </table>
        ";

    $card = "
        <div class=\"card mb-3\" align=\"center\">
            <div class=\"card-header\">
                <div class=\"card-title\">
                    $title_header
                </div>
            </div>
            <div class=\"card-body\">
            $html
            </div>
        </div>
    ";

    return $card;
}

/**
 * Generates verb table
 * @param array $entity Entity data
 * @return string Generated HTML table
 */
function generate_verb_table($entity)
{
    global $ty, $verbs_main_g, $numberKeys_verb, $gender_Keys_global, $first_second_third_person,
        $singular_plural_dual, $additional_tenses, $past_qid, $past_perfect_qid, $first_person, $dual;

    $ty = "verb";

    $forms = $entity['forms'] ?? [];

    $verbs_main = $verbs_main_g;

    $numberKeys = removeKeysIfNotFound($numberKeys_verb, $forms, array_merge($additional_tenses, [$past_qid, $past_perfect_qid]));

    $rowKeys = removeKeysIfNotFound($gender_Keys_global, $forms, ["Q1775461", "Q1305037"]);

    $colKeys = removeKeysIfNotFound($first_second_third_person, $forms, ["Q88778575"]); // Q21714344

    $spd = $singular_plural_dual;
    // remove "" from spd
    $spd = array_filter($spd, function ($item) {
        return $item !== "";
    });

    $genderKeys = removeKeysIfNotFound($singular_plural_dual, $forms, $spd);

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
    global $Pausal_Forms, $gender_Keys_global, $indefinite_definite_construct, $construct_contextform,
        $adj_and_nouns_keys, $Masculine, $Feminine;

    $forms = $entity['forms'] ?? [];

    $row_Keys = removeKeysIfNotFound($Pausal_Forms, $forms, ["Q146233", "Q1095813", "Q117262361"]);
    $genderKeys = removeKeysIfNotFound($gender_Keys_global, $forms, [$Masculine, $Feminine, "Q1775461", "Q1305037"]);

    $colKeys = $indefinite_definite_construct;
    $colKeys = removeKeysIfNotFound($colKeys, $forms, $construct_contextform);

    $number_Keys = $adj_and_nouns_keys[$entity_type] ?? [];

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
