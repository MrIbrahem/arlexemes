<?php

ini_set("display_errors", 1);
ini_set("display_startup_errors", 1);
error_reporting(E_ALL);

// Simple test script to verify the PHP implementation
require_once __DIR__ . '/includes/include.php';
use function Lexeme\Processing\start_lexeme;

echo <<<HTML
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <title>Test PHP Lexeme Implementation</title>
    <link href="https://tools-static.wmflabs.org/cdnjs/ajax/libs/bootstrap/5.3.7/css/bootstrap.rtl.min.css" rel="stylesheet">
</head>
<body>
<div class="container my-4">
<h1>Test PHP Lexeme Implementation</h1>
HTML;

// Test with a known lexeme ID
$test_lexeme_id = "L3325"; // This is a common Arabic verb "كتب" (to write)

echo <<<HTML
<h2>Testing with lexeme ID: $test_lexeme_id</h2>
HTML;

$result = start_lexeme($test_lexeme_id);

if ($result) {
    echo <<<HTML
    <div class="alert alert-success">Successfully processed lexeme!</div>
HTML;
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
