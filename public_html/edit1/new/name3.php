<?php

$numbers = [
    'Q110786' => ['label' => 'مُفْرَد', 'default' => true],
    'Q110022' => ['label' => 'مُثَنَّى', 'default' => true],
    'Q146786' => ['label' => 'جَمْع', 'default' => true],
];

$cases = [
    'Q131105' => ['label' => 'مَرْفُوع', 'default' => true],
    'Q146078' => ['label' => 'مَنْصُوب', 'default' => true],
    'Q146233' => ['label' => 'مَجْرُور', 'default' => true],
];

$genders_all = [
    'Q499327' => ['label' => 'مُذَكَّر', 'default' => true],
    'Q1775415' => ['label' => 'مُؤَنَّث', 'default' => true],
    'Q1775461' => ['label' => 'مُحايد', 'default' => false],
];

$states = [
    'Q53997857' => ['label' => 'نَكِرَة', 'default' => true],
    'Q53997851' => ['label' => 'مَعْرِفَة', 'default' => true],
    'Q1641446' => ['label' => 'إضافة', 'default' => false],
];

$selected_numbers = $_GET['numbers'] ?? ['Q110786' => '1', 'Q110022' => '1', 'Q146786' => '1'];
$selected_genders = $_GET['genders'] ?? ['Q499327' => '1', 'Q1775415' => '1'];

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
        <form method="get" class="mb-4">
            <div class="card">
                <div class="card-header fw-bold">
                    <a href='name3.php'>إعادة</a>
                </div>
                <div class="card-body text-start">

                    <div class="mb-3">
                        <label class="form-label fw-bold">خيارات الجنس:</label><br>
                        <?php foreach ($genders_all as $gen_qid => $gen): ?>
                            <div class="form-check form-check-inline">
                                <input class="form-check-input" type="checkbox"
                                    name="genders[<?= $gen_qid ?>]" id="gen_<?= $gen_qid ?>" value="1"
                                    <?= isset($selected_genders[$gen_qid]) ? 'checked' : '' ?>>
                                <label class="form-check-label" for="gen_<?= $gen_qid ?>"><?= $gen['label'] ?></label>
                            </div>
                        <?php endforeach; ?>
                    </div>

                    <div class="mb-3">
                        <label class="form-label fw-bold">خيارات العدد:</label><br>
                        <?php foreach ($numbers as $num_qid => $num): ?>
                            <div class="form-check form-check-inline">
                                <input class="form-check-input" type="checkbox"
                                    name="numbers[<?= $num_qid ?>]" id="num_<?= $num_qid ?>" value="1"
                                    <?= isset($selected_numbers[$num_qid]) ? 'checked' : '' ?>>
                                <label class="form-check-label" for="num_<?= $num_qid ?>"><?= $num['label'] ?></label>
                            </div>
                        <?php endforeach; ?>
                    </div>

                    <button type="submit" class="btn btn-primary">تطبيق الإعدادات</button>
                </div>
            </div>
        </form>

        <!-- الجدول -->
        <form action="edit.php" method="post">
            <div class="card text-center">
                <div class="card-header">
                    <h5>تصريف الاسم حسب الإعدادات المختارة</h5>
                </div>
                <div class="card-body">
                    <table class="table table-bordered table-sm table-hover text-center align-middle">
                        <thead class="table-light">
                            <tr>
                                <th colspan="2"></th>
                                <?php foreach ($genders_all as $gen_qid => $gender): ?>
                                    <?php if (empty($selected_genders[$gen_qid])) continue; ?>
                                    <th colspan="<?= count($states) ?>">
                                        <a href="https://www.wikidata.org/entity/<?= $gen_qid ?>" target="_blank" class="text-primary">
                                            <?= $gender['label'] ?>
                                        </a>
                                    </th>
                                <?php endforeach; ?>
                            </tr>
                            <tr>
                                <th></th>
                                <th>الحالة</th>
                                <?php foreach ($genders_all as $gen_qid => $gender): ?>
                                    <?php if (empty($selected_genders[$gen_qid])) continue; ?>
                                    <?php foreach ($states as $state_qid => $state): ?>
                                        <th>
                                            <a href="https://www.wikidata.org/entity/<?= $state_qid ?>" target="_blank" class="text-primary">
                                                <?= $state['label'] ?>
                                            </a>
                                        </th>
                                    <?php endforeach; ?>
                                <?php endforeach; ?>
                            </tr>
                        </thead>
                        <tbody>
                            <?php
                            foreach ($numbers as $num_qid => $num) {
                                $num_label = $num['label'];
                                if (empty($selected_numbers[$num_qid])) continue;

                                $index = 0;
                                $count_cases = count($cases);
                                foreach ($cases as $case_qid => $case) {
                                    $index += 1;
                                    $case_label = $case['label'];
                                    echo "<tr>";
                                    if ($index === 1) {
                                        echo <<<HTML
                                            <th rowspan="$count_cases" class="table-light">
                                                <a href="https://www.wikidata.org/entity/$num_qid" target="_blank" class="text-primary">
                                                    $num_label
                                                </a>
                                            </th>
                                        HTML;
                                    }

                                    echo <<<HTML
                                        <th>
                                            <a href="https://www.wikidata.org/entity/$case_qid" target="_blank" class="text-primary">
                                                $case_label
                                            </a>
                                        </th>
                                    HTML;

                                    foreach ($genders_all as $gen_qid => $gender) {
                                        if (empty($selected_genders[$gen_qid])) continue;
                                        foreach ($states as $state_qid => $state) {
                                            $id = [$num_qid, $case_qid, $gen_qid, $state_qid];
                                            sort($id);
                                            $id = implode('_', $id);
                                            echo <<<HTML
                                                    <td>
                                                    <input class="form-control" type="text"
                                                        name="forms[$id]"
                                                        id="forms[$id]">
                                                    </td>
                                            HTML;
                                        }
                                    }
                                    echo "</tr>";
                                };
                            };
                            ?>
                        </tbody>
                    </table>
                </div>
                <div class="card-footer">
                    <button type="submit" class="btn btn-success">حفظ</button>
                </div>
            </div>
        </form>


    </div>

</body>

</html>
