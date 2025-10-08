<!DOCTYPE html>
<html lang="ar" dir="rtl">

<head>
    <meta charset="UTF-8">
    <title>جدول المذكر والمؤنث</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
</head>

<body class="bg-light">

    <form action="edit.php" method="post">
        <div class="card mb-3 text-center">
            <div class="card-header">
                <h5>تصريف الاسم حسب النوع والعدد والحالة الإعرابية</h5>
            </div>
            <div class="card-body">
                <table id="main_table" class="table table-bordered table-sm table-hover text-center align-middle">
                    <thead class="table-light">
                        <tr>
                            <th colspan="2"></th>
                            <th colspan="3"><a href="https://www.wikidata.org/entity/Q499327" target="_blank" class="text-primary">مُذَكَّر</a></th>
                            <th colspan="3"><a href="https://www.wikidata.org/entity/Q1775415" target="_blank" class="text-primary">مُؤَنَّث</a></th>
                        </tr>
                        <tr>
                            <th></th>
                            <th>الحالة</th>
                            <th><a href="https://www.wikidata.org/entity/Q53997857" target="_blank" class="text-primary">نَكِرَة</a></th>
                            <th><a href="https://www.wikidata.org/entity/Q53997851" target="_blank" class="text-primary">مَعْرِفَة</a></th>
                            <th><a href="https://www.wikidata.org/entity/Q1641446" target="_blank" class="text-primary">إضافة</a></th>
                            <th><a href="https://www.wikidata.org/entity/Q53997857" target="_blank" class="text-primary">نَكِرَة</a></th>
                            <th><a href="https://www.wikidata.org/entity/Q53997851" target="_blank" class="text-primary">مَعْرِفَة</a></th>
                            <th><a href="https://www.wikidata.org/entity/Q1641446" target="_blank" class="text-primary">إضافة</a></th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php
                        $numbers = [
                            ['label' => 'مُفْرَد', 'qid' => 'Q110786'],
                            ['label' => 'مُثَنَّى', 'qid' => 'Q110022'],
                            ['label' => 'جَمْع', 'qid' => 'Q146786'],
                        ];

                        $cases = [
                            ['label' => 'مَرْفُوع', 'qid' => 'Q131105'],
                            ['label' => 'مَنْصُوب', 'qid' => 'Q146078'],
                            ['label' => 'مَجْرُور', 'qid' => 'Q146233'],
                        ];

                        $genders = [
                            ['label' => 'مذكر', 'qid' => 'Q499327'],
                            ['label' => 'مؤنث', 'qid' => 'Q1775415'],
                        ];

                        $states = [
                            ['label' => 'نكرة', 'qid' => 'Q53997857'],
                            ['label' => 'معرفة', 'qid' => 'Q53997851'],
                            ['label' => 'إضافة', 'qid' => 'Q1641446'],
                        ];

                        foreach ($numbers as $num) {
                            foreach ($cases as $index => $cas) {
                                echo "<tr>";
                                if ($index === 0) {
                                    echo '<th rowspan="' . count($cases) . '" class="table-light" scope="row">';
                                    echo '<a href="https://www.wikidata.org/entity/' . $num['qid'] . '" target="_blank" class="text-primary">' . $num['label'] . '</a>';
                                    echo '</th>';
                                }

                                echo '<th scope="row">';
                                echo '<a href="https://www.wikidata.org/entity/' . $cas['qid'] . '" target="_blank" class="text-primary">' . $cas['label'] . '</a>';
                                echo '</th>';

                                foreach ($genders as $gender) {
                                    foreach ($states as $state) {
                                        $id = [$num['qid'], $cas['qid'], $gender['qid'], $state['qid']];
                                        sort($id);
                                        $id = implode('_', $id);
                                        // ---
                                        echo <<<HTML
                                                <td style="position:relative;">
                                                <input class="form-control" type="text"
                                                    name="forms[$id]"
                                                    id="forms[$id]">
                                                </td>
                                        HTML;
                                    }
                                }
                                echo "</tr>";
                            }
                        }
                        ?>
                    </tbody>
                </table>
            </div>
            <div class="card-footer">
                <button type="submit" class="btn btn-primary">حفظ</button>
            </div>
        </div>
    </form>

</body>

</html>
