<?php

ini_set("display_errors", 1);
ini_set("display_startup_errors", 1);
error_reporting(E_ALL);

/*

http://localhost:40/edit1/index2.php?wd_id=L1478647&edit=1
http://localhost:40/edit1/index2.php?wd_id=L1501519&edit=1
http://localhost:40/edit1/index2.php?wd_id=L1501519

*/
// Simple test script to verify the PHP implementation
require_once __DIR__ . '/includes/include.php';

use function Lexeme\Processing\fetchLexemeById;

echo <<<HTML
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
        <meta charset="UTF-8">
        <title>Test PHP Lexeme Implementation</title>
        <link href="https://tools-static.wmflabs.org/cdnjs/ajax/libs/bootstrap/5.3.7/css/bootstrap.rtl.min.css" rel="stylesheet">
    </head>
    <body>
    <div class="container-fluid my-4">
        <div class="row">
            <div class="col">
                <a href="test.php" class="h2">عرض عادي </a>
            </div>
            <div class="col">
                <a href="test.php?edit=1" class="h2">تعديل</a>
            </div>
        </div>
HTML;

// Test with a known lexeme ID
$test_lexeme_id = "L3325"; // This is a common Arabic verb "كتب" (to write)

$data = json_decode(file_get_contents(__DIR__ . "/test.json"), true);

$edit = isset($_GET['edit']) ? true : false;

$result = fetchLexemeById($test_lexeme_id, $data, $edit);

if ($result) {
    echo $result;
} else {
    echo <<<HTML
    <div class="alert alert-danger">Failed to process lexeme</div>
HTML;
}

echo <<<HTML
</div>
</body>
</html>
HTML;
