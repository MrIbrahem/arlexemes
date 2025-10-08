<?php

ini_set("display_errors", 1);
ini_set("display_startup_errors", 1);
error_reporting(E_ALL);
require_once __DIR__ . '/lex_utils.php';


function make_tableData($number_Keys, $row_Keys, $col_Keys, $gender_Keys) {
    $first_persons = ["first-person", "Q21714344"];
    $duals = ["dual", "Q110022"];

    $tableData = [];
    foreach ($number_Keys as $num) {
        $tableData[$num] = [];
        foreach ($row_Keys as $row) {
            $tableData[$num][$row] = [];
            foreach ($col_Keys as $col) {
                $tableData[$num][$row][$col] = [];
                foreach ($gender_Keys as $gender) {
                    if (in_array($col, $first_persons) && in_array($gender, $duals)) continue;
                    $tableData[$num][$row][$col][$gender] = [];
                }
            }
        }
    }
    return $tableData;
}


function make_thead($first_rows, $second_rows, $first_person, $dual, $display_mt_cells) {
    $thead = '
        <tr data-dt-order="disable">
            <th colspan="2" class=""></th>
    ';

    // الصف الأول من الرؤوس
    foreach ($first_rows as $gender) {
        $colspan = count($second_rows);

        if (in_array($first_person, $second_rows) && $gender === $dual) {
            $colspan -= 1;
        }

        if (!$display_mt_cells && in_array("", $second_rows)) {
            $colspan -= 1;
        }

        $headerText = (count($first_rows) === 1 && $gender === "") ? "النوع" : wdlink_2($gender);

        if (!$display_mt_cells && $gender === "" && count($first_rows) > 1) continue;

        $thead .= '
            <th colspan="' . $colspan . '" class="">
            <span class="">
                ' . $headerText . '
            </span>
            </th>
        ';
    }

    $thead .= '
        </tr>
        <tr>
            <th scope="col" data-dt-order="disable" class="">
            </th> <!-- Top-left empty cell, spans two rows -->
            <th scope="col" data-dt-order="disable" class="">
                <span class="">
                    الحالة
                </span>
            </th>
    ';

    // الصف الثاني من الرؤوس
    foreach ($first_rows as $gender) {
        if (!$display_mt_cells && $gender === "" && count($first_rows) > 1) continue;

        foreach ($second_rows as $col) {
            if (!$display_mt_cells && $col === "") continue;

            if ($col === $first_person && $gender === $dual) {
                // تجاهل هذه الخلية
                continue;
            }

            $text = wdlink_2($col);

            $thead .= '
                <th scope="col" class="">
                    <span class="">
                        ' . $text . '
                    </span>
                </th>
            ';
        }
    }

    $thead .= '
        </tr>
    ';

    return $thead;
}


function right_side_th($i, $number, $row, $row_Keys, $display_mt_cells) {
    $add_to_tbody = "";

    // Add the number header (مفرد or جمع) in the first column, spanning all case rows
    if ($i === 0) {
        $text = wdlink_2($number);
        $rowspan = count($row_Keys);

        if (!$display_mt_cells && in_array("", $row_Keys)) {
            $rowspan -= 1;
        }

        $add_th = '
            <th rowspan="' . $rowspan . '" class="table-light" scope="row">
                <span class="">
                    ' . $text . '
                </span>
            </th>
        ';

        if (!$display_mt_cells && $number === "") $add_th = "";

        $add_to_tbody .= $add_th;
    }

    $text2 = wdlink_2($row);

    $add_th2 = '
        <th scope="row" class="">
            <span class="">
                ' . $text2 . '
            </span>
        </th>
    ';

    if (!$display_mt_cells && $row === "") $add_th2 = "";

    // Add the case header (e.g., رفع) in the second column
    $add_to_tbody .= $add_th2;

    return $add_to_tbody;
}


function create_gender_tds($col_Keys, $gender, $show_empty_cells, $number_data, $row, &$singular_fixed) {
    $gender_tds = "";

    foreach ($col_Keys as $col) {
        if ($col === $GLOBALS['first_person'] && $gender === $GLOBALS['dual']) continue;

        if (!$show_empty_cells && $col === "") continue;

        $entries = isset($number_data[$row][$col][$gender]) ? $number_data[$row][$col][$gender] : [];

        $check_1 = $col === $GLOBALS['first_person'] && ($gender === $GLOBALS['singular'] || $gender === $GLOBALS['plural']);
        $check_2 = $col === $GLOBALS['second_person'] && $gender === $GLOBALS['dual'];

        $rowspan = 1;

        if ($check_1 || $check_2) {
            if (in_array($gender, $singular_fixed)) continue;

            $fem_entries = isset($number_data[$GLOBALS['Feminine']][$col][$gender]) ? $number_data[$GLOBALS['Feminine']][$col][$gender] : [];
            $third_entries = isset($number_data[""][$col][$gender]) ? $number_data[""][$col][$gender] : [];

            $male_is_empty = count($third_entries) > 0 && count($entries) == 0;
            $third_is_empty = count($entries) > 0 && count($third_entries) == 0;

            if ($row === $GLOBALS['Masculine'] && count($fem_entries) == 0 && ($male_is_empty || $third_is_empty)) {
                $entries = ($male_is_empty) ? $third_entries : $entries;

                $singular_fixed[] = $gender;

                $rowspan = ($show_empty_cells) ? 3 : 2;
            }
        }

        $span_a = ($rowspan > 1) ? 'rowspan="' . $rowspan . '"' : '';
        $td = '<td ' . $span_a . ' style="position:relative;" class="">';

        $entry_items = [];
        foreach ($entries as $entry) {
            $entry_items[] = entryFormatterNew($entry);
        }
        $td .= implode("<br>", $entry_items);

        $td .= '</td>';
        $gender_tds .= $td;
    }
    return $gender_tds;
}


function make_tbody($number_Keys, $tableData, $show_empty_cells, $row_Keys, $gender_Keys, $col_Keys) {
    $tbody = "";

    // Iterate through number categories (مفرد, جمع)
    foreach ($number_Keys as $number) {
        $number_data = $tableData[$number];

        if (!$show_empty_cells && $number === "") continue;

        // Check if there is any data for this number category to avoid empty sections
        $hasNumberData = false;
        foreach ($row_Keys as $row) {
            foreach ($gender_Keys as $gender) {
                foreach ($col_Keys as $col) {
                    if (isset($number_data[$row][$col][$gender]) && count($number_data[$row][$col][$gender]) > 0) {
                        $hasNumberData = true;
                        break 3;
                    }
                }
            }
        }

        if (!$hasNumberData) continue; // Skip displaying this number category if no data

        $singular_fixed = [];

        // Iterate through case rows (وقف, رفع, نصب, إضافة) for each number category
        foreach ($row_Keys as $i => $row) {
            if (!$show_empty_cells && $row === "") continue;

            $add_to_tbody = right_side_th($i, $number, $row, $row_Keys, $show_empty_cells);

            // Add the data cells for each gender and column type
            foreach ($gender_Keys as $gender) {
                if (!$show_empty_cells && $gender === "" && count($gender_Keys) > 1) continue;

                $gender_tds = create_gender_tds($col_Keys, $gender, $show_empty_cells, $number_data, $row, $singular_fixed);
                $add_to_tbody .= $gender_tds;
            }
            if ($add_to_tbody !== "") {
                $tbody .= '
                    <tr>
                    ' . $add_to_tbody . '
                    </tr>
                ';
            }
        }
    }
    return $tbody;
}


function _generateHtmlTable($tableData, $first_collumn, $second_collumn, $second_rows, $first_rows, $title_header = "", $display_mt_cells = null) {
    $display_empty_cells = $GLOBALS['display_empty_cells'] ?? true;
    $show_empty_cells = ($display_mt_cells === false || $display_mt_cells === true) ? $display_mt_cells : $display_empty_cells;

    $number_Keys = $first_collumn;
    $gender_Keys = $first_rows;
    $col_Keys = $second_rows;
    $row_Keys = $second_collumn;

    $thead = make_thead($gender_Keys, $col_Keys, $GLOBALS['first_person'], $GLOBALS['dual'], $show_empty_cells);
    $tbody = make_tbody($number_Keys, $tableData, $show_empty_cells, $row_Keys, $gender_Keys, $col_Keys);

    if ($tbody === "") return "";

    $html = '
        <table idx="main_table" class="table table-bordered table-sm table-hover text-center align-middle pages_table">
            <thead class="table-light">
                ' . $thead . '
            </thead>
            <tbody>
                ' . $tbody . '
            </tbody>
        </table>
        ';

    $card = '
        <div class="card mb-3" align="center">
            <div class="card-header">
                <div class="card-title">
                    ' . $title_header . '
                </div>
            </div>
            <div class="card-body">
            ' . $html . '
            </div>
        </div>
    ';
    return $card;
}

?>
