<?php

ini_set("display_errors", 1);
ini_set("display_startup_errors", 1);
error_reporting(E_ALL);

function do_show($data)
{

    $selected = [];

    foreach ($data as $key => $members) {
        if (isset($_GET[$key])) {
            $selected[$key] = [];
            foreach ($members as $qid => $member) {
                $selected[$key][$qid] = $member;
                $selected[$key][$qid]['show'] = isset($_GET[$key][$qid]);
            }
        } else {
            $selected[$key] = $members;
        }
    }
    return $selected;
}

function make_filter_form($tabs)
{
    // ---
    $form = <<<HTML
        <form method="get" class="mb-4">
    HTML;
    // ---
    foreach ($tabs as $filter_label => $filter_options) {
        $form .= <<<HTML
            <div class="mb-3">
                <label class="form-label fw-bold">خيارات $filter_label:</label><br>
        HTML;
        // ---
        foreach ($filter_options as $filter_qid => $filter) {
            // ---
            $checked = $filter['show'] ? 'checked' : '';
            $label   = $filter['label'];
            // ---
            $name = $filter_label . "[$filter_qid]";
            $form .= <<<HTML
                <div class="form-check form-check-inline">
                    <input class="form-check-input" type="checkbox"
                        name="$name" id="$name" value="1" $checked>
                    <label class="form-check-label" for="$name">$label</label>
                </div>
            HTML;
        }
        // ---
        $form .= <<<HTML
            </div>
        HTML;
    }
    // ---
    $form .= <<<HTML
            <button type="submit" class="btn btn-primary">تطبيق الإعدادات</button>
        </form>
    HTML;
    // ---
    return $form;
};

function make_table($selected)
{

    $count_states = count(array_filter($selected['states'], function ($case) {
        return $case['show'];
    }));

    $count_cases = count(array_filter($selected['cases'], function ($case) {
        return $case['show'];
    }));

    $text = <<<HTML
        <table class="table table-bordered table-sm table-hover text-center align-middle">
            <thead class="table-light">
                <tr>
                    <th colspan="2"></th>
    HTML;

    foreach ($selected['genders'] as $gen_qid => $gender) {
        $gender_label = $gender['label'];
        if ((!$gender['show'])) continue;
        $text .= <<<HTML
            <th colspan="$count_states">
                <a href="https://www.wikidata.org/entity/$gen_qid" target="_blank" class="text-primary">
                    $gender_label
                </a>
            </th>
        HTML;
    }
    $text .= <<<HTML
        </tr>
        <tr>
            <th></th>
            <th>الحالة</th>
    HTML;
    foreach ($selected['genders'] as $gen_qid => $gender) {
        if ((!$gender['show'])) continue;
        foreach ($selected['states'] as $state_qid => $state) {
            if ((!$state['show'])) continue;
            $state_label = $state['label'];
            $text .= <<<HTML
                <th>
                    <a href="https://www.wikidata.org/entity/$state_qid" target="_blank" class="text-primary">
                        $state_label
                    </a>
                </th>
            HTML;
        }
    }
    $text .= <<<HTML
            </tr>
        </thead>
        <tbody>
    HTML;
    foreach ($selected['numbers'] as $num_qid => $num) {
        if ((!$num['show'])) continue;
        $num_label = $num['label'];

        $index = 0;
        foreach ($selected['cases'] as $case_qid => $case) {
            if ((!$case['show'])) continue;
            $index += 1;
            $case_label = $case['label'];
            $text .= "<tr>";
            if ($index === 1) {
                $text .= <<<HTML
                    <th rowspan="$count_cases" class="table-light">
                        <a href="https://www.wikidata.org/entity/$num_qid" target="_blank" class="text-primary">
                            $num_label
                        </a>
                    </th>
                HTML;
            }

            $text .= <<<HTML
                <th>
                    <a href="https://www.wikidata.org/entity/$case_qid" target="_blank" class="text-primary">
                        $case_label
                    </a>
                </th>
            HTML;

            foreach ($selected['genders'] as $gen_qid => $gender) {
                if ((!$gender['show'])) continue;
                foreach ($selected['states'] as $state_qid => $state) {
                    if ((!$state['show'])) continue;
                    $id = [$num_qid, $case_qid, $gen_qid, $state_qid];
                    sort($id);
                    $id = implode('_', $id);
                    $text .= <<<HTML
                        <td>
                        <input class="form-control" type="text"
                            name="forms[$id]"
                            id="forms[$id]">
                        </td>
                    HTML;
                }
            }
            $text .= "</tr>";
        };
    };
    $text .= <<<HTML
        </tbody>
    </table>
    HTML;
    return $text;
}

$data_name = [
    'numbers' => [
        'Q110786' => ['label' => 'مُفْرَد', 'show' => true],
        'Q110022' => ['label' => 'مُثَنَّى', 'show' => true],
        'Q146786' => ['label' => 'جَمْع', 'show' => true],
    ],
    'cases' => [
        'Q131105' => ['label' => 'مَرْفُوع', 'show' => true],
        'Q146078' => ['label' => 'مَنْصُوب', 'show' => true],
        'Q146233' => ['label' => 'مَجْرُور', 'show' => true],
    ],
    'genders' => [
        'Q499327' => ['label' => 'مُذَكَّر', 'show' => true],
        'Q1775415' => ['label' => 'مُؤَنَّث', 'show' => true],
        'Q1775461' => ['label' => 'مُحايد', 'show' => false],
    ],
    'states' => [
        'Q53997857' => ['label' => 'نَكِرَة', 'show' => true],
        'Q53997851' => ['label' => 'مَعْرِفَة', 'show' => true],
        'Q1641446' => ['label' => 'إضافة', 'show' => false],
    ]
];

$data_verb = [
    'genders' => [
        'Q110786' => ['label' => 'مُفْرَد', 'show' => true],
        'Q110022' => ['label' => 'مُثَنَّى', 'show' => true],
        'Q146786' => ['label' => 'جَمْع', 'show' => true],
    ],
    'cases' => [
        'Q499327' => ['label' => 'مُذَكَّر', 'show' => true],
        'Q1775415' => ['label' => 'مُؤَنَّث', 'show' => true],
    ],
    'numbers' => [
        'Q1994301' => ['label' => 'ماضي', 'show' => true],
        'Q192613' => ['label' => 'مضارع', 'show' => true],
        'Q473746' => ['label' => 'مضارع منصوب', 'show' => true],
        'Q462367' => ['label' => 'مضارع مجزوم', 'show' => true],
        'Q22716' => ['label' => 'أمر', 'show' => true],
    ],
    'states' => [
        'Q21714344' => ['label' => 'متكلم', 'show' => true],
        'Q51929049' => ['label' => 'مخاطب', 'show' => true],
        'Q51929074' => ['label' => 'غائب', 'show' => true],
    ]
];

$data = [
    "name" => $data_name,
    "verb" => $data_verb,
];

$type = $_GET['type'] ?? 'name';

$selected = do_show($data[$type]);

$filter_form = make_filter_form($selected);
$table = make_table($selected);

?>

<!DOCTYPE html>

<html lang="ar" dir="rtl">

<head>
    <meta charset="UTF-8">
    <title>جدول التصريف بخيارات العدد والجنس</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
</head>

<body class="bg-light">

    <div class="container my-4">


        <!-- واجهة التحكم -->
        <div class="card">
            <div class="card-header fw-bold">
                <a href='name2.php?type=name'>اسم</a>
                -
                <a href='name2.php?type=verb'>فعل</a>
            </div>
            <div class="card-body text-start">
                <?= $filter_form ?>
            </div>
        </div>

        <!-- الجدول -->
        <form action="edit.php" method="post">
            <div class="card text-center">
                <div class="card-header">
                    <h5>
                        <?= $type ?>
                    </h5>
                </div>
                <div class="card-body">
                    <?= $table ?>
                </div>
                <div class="card-footer">
                    <button type="submit" class="btn btn-success">حفظ</button>
                </div>
            </div>
        </form>


    </div>

</body>

</html>
