<?php

namespace Lexeme\Tables;

ini_set("display_errors", 1);
ini_set("display_startup_errors", 1);
error_reporting(E_ALL);


use function Lexeme\Utils\wdlink_2;
use function Lexeme\Utils\entryFormatterNew;
use function Lexeme\Utils\make_form_id_link;
use function Lexeme\Utils\removeKeysIfNotFound;

// Table generation functions migrated from JavaScript

$display_empty_cells = true;

function make_thead($first_rows, $second_rows, $first_person, $dual, $display_mt_cells)
{
    global $display_empty_cells;

    $show_empty_cells = ($display_mt_cells === false || $display_mt_cells === true) ? $display_mt_cells : $display_empty_cells;

    $thead = <<<HTML
        <tr data-dt-order="disable">
            <th colspan="2" class=""></th>
    HTML;

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

        $thead .= <<<HTML
            <th colspan="$colspan" class="">
            <span class="">
                $headerText
            </span>
            </th>
        HTML;
    }

    $thead .= <<<HTML
        </tr>
        <tr>
            <th scope="col" data-dt-order="disable" class="">
            </th> <!-- Top-left empty cell, spans two rows -->
            <th scope="col" data-dt-order="disable" class="">
                <span class="">
                    الحالة
                </span>
            </th>
    HTML;

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

            $thead .= <<<HTML
                <th scope="col" class="">
                    <span class="">
                        $text
                    </span>
                </th>
            HTML;
        }
    }

    $thead .= <<<HTML
        </tr>
    HTML;

    return $thead;
}


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

        $add_th = <<<HTML
            <th rowspan="$rowspan" class="table-light" scope="row">
                <span class="">
                    $text
                </span>
            </th>
        HTML;

        if (!$show_empty_cells && $number === "") $add_th = "";

        $add_to_tbody .= $add_th;
    }

    $text2 = wdlink_2($row);

    $add_th2 = <<<HTML
        <th scope="row" class="">
            <span class="">
                $text2
            </span>
        </th>
    HTML;

    if (!$show_empty_cells && $row === "") $add_th2 = "";

    // Add the case header (e.g., رفع) in the second column
    $add_to_tbody .= $add_th2;

    return $add_to_tbody;
}


function create_td($entries, $rowspan)
{
    $span_a = $rowspan > 1 ? "rowspan=\"$rowspan\"" : "";

    $td_id = "";
    $tds = [];
    foreach ($entries as $entry) {
        $feats = $entry['tags'] ?? $entry['grammaticalFeatures'] ?? [];
        $sorted_feats = $feats;
        sort($sorted_feats);
        $td_id = implode("_", $sorted_feats);
        $tds[] = entryFormatterNew($entry);
    }
    // join tds by <hr/>
    $td = implode("<hr/>", $tds);
    $td = <<<HTML
        <td $span_a style="position:relative;" id="$td_id">
            $td
        </td>
    HTML;

    return $td;
}


function entryFormatterNewEdit($form)
{
    $sorted_feats = $form['grammaticalFeatures'] ?? [];
    sort($sorted_feats);
    $grammaticalFeatures = implode("_", $sorted_feats);

    $F_id = $form['id'] ?? $grammaticalFeatures;

    $form_id_link = make_form_id_link($form, false);

    // ar-x-Q775724
    $values = [];
    // { "id": "L1518668-F20", "representations": { "ar": { "language": "ar", "value": "مُقْبِسٌ" }, "ar-x-Q775724": { "language": "ar-x-Q775724", "value": "مقبس" } }, "grammaticalFeatures": [ "Q110786", "Q131105", "Q499327", "Q53997857" ], "claims": { } }
    $representations = $form['representations'] ?? [];

    $valueArray = [
        <<<HTML
            <input type="hidden" id="forms[$F_id][grammaticalFeatures]" name="forms[$F_id][grammaticalFeatures]" value="$grammaticalFeatures">
        HTML
    ];

    foreach ($representations as $r) {
        // ---
        $lang = $r['language'] ?? "";
        $value = $r['value'] ?? "";
        $lang_text = $GLOBALS['languages_labels'][$lang] ?? $lang;
        // ---
        $input_id = "forms[$F_id][$lang][value]";
        $original_input_id = "forms[$F_id][$lang][original_value]";
        // ---
        $valueArray[] = <<<HTML
            <div class="input-group">
                <label class="input-group-text">$lang_text</label>
                <input type="hidden" id="$original_input_id" name="$original_input_id" value="$value">
                <input class="form-control form-control-sm_z w-25" type="text" id="$input_id" name="$input_id" value="$value">
            </div>
        HTML;
    }

    $values = implode("", $valueArray);

    $td = <<<HTML
        <!-- $grammaticalFeatures -->
        <h4>$form_id_link</h4>
        $values
    HTML;

    return $td;
}


function create_td_edit($entries, $rowspan)
{
    $span_a = $rowspan > 1 ? "rowspan=\"$rowspan\"" : "";
    $tds = [];

    foreach ($entries as $entry) {
        $tds[] = entryFormatterNewEdit($entry);
    }

    // join tds by <hr/>
    $td = implode("", $tds);

    $td = <<<HTML
        <td $span_a style="position:relative;">
            $td
        </td>
    HTML;

    return $td;
}

function create_gender_tds($col_Keys, $gender, $show_empty_cells, $number_data, $row, $edit, &$singular_fixed)
{


    $gender_tds = "";

    foreach ($col_Keys as $col) {
        if ($col === $GLOBALS['first_person'] && $gender === $GLOBALS['dual']) continue;

        if (!$show_empty_cells && $col === "") continue;

        $entries = $number_data[$row][$col][$gender] ?? [];

        $check_1 = $col === $GLOBALS['first_person'] && ($gender === $GLOBALS['singular'] || $gender === $GLOBALS['plural']);
        $check_2 = $col === $GLOBALS['second_person'] && $gender === $GLOBALS['dual'];

        $rowspan = 1;

        if ($check_1 || $check_2) {
            if (isset($singular_fixed[$gender]) && $singular_fixed[$gender]) continue;

            $fem_entries = $number_data[$GLOBALS['Feminine']][$col][$gender] ?? [];
            $third_entries = $number_data[""][$col][$gender] ?? [];

            $male_is_empty = !empty($third_entries) && empty($entries);
            $third_is_empty = !empty($entries) && empty($third_entries);

            if ($row === $GLOBALS['Masculine'] && empty($fem_entries) && ($male_is_empty || $third_is_empty)) {
                $entries = $male_is_empty ? $third_entries : $entries;
                $singular_fixed[$gender] = true;
                $rowspan = $show_empty_cells ? 3 : 2;
            }
        }

        $td = $edit ? create_td_edit($entries, $rowspan) : create_td($entries, $rowspan);

        $gender_tds .= $td;
    }

    return $gender_tds;
}


function make_tbody($number_Keys, $tableData, $show_empty_cells, $row_Keys, $gender_Keys, $col_Keys, $edit)
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

                $gender_tds = create_gender_tds($col_Keys, $gender, $show_empty_cells, $number_data, $row, $edit, $singular_fixed);
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


function _generateHtmlTable($tableData, $first_collumn, $second_collumn, $second_rows, $first_rows, $title_header, $display_mt_cells, $edit)
{

    global $display_empty_cells;

    $show_empty_cells = ($display_mt_cells === false || $display_mt_cells === true) ? $display_mt_cells : $display_empty_cells;

    $number_Keys = $first_collumn;
    $gender_Keys = $first_rows;
    $col_Keys = $second_rows;
    $row_Keys = $second_collumn;

    $thead = make_thead($gender_Keys, $col_Keys, $GLOBALS['first_person'], $GLOBALS['dual'], $show_empty_cells);
    $tbody = make_tbody($number_Keys, $tableData, $show_empty_cells, $row_Keys, $gender_Keys, $col_Keys, $edit);

    if ($tbody === "") return "";

    $html = <<<HTML
        <table idx="main_table" class="table table-bordered table-sm table-hover text-center align-middle pages_table">
            <thead class="table-light">
                $thead
            </thead>
            <tbody>
                $tbody
            </tbody>
        </table>
    HTML;

    $card = <<<HTML
        <div class="card mb-3" align="center">
            <div class="card-header">
                <div class="card-title">
                    $title_header
                </div>
            </div>
            <div class="card-body">
            $html
            </div>
        </div>
    HTML;

    return $card;
}
