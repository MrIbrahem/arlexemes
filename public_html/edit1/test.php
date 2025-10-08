<?php

ini_set("display_errors", 1);
ini_set("display_startup_errors", 1);
error_reporting(E_ALL);

// Simple test script to verify the PHP implementation
require_once __DIR__ . '/includes/lex_data_processing.php';

echo "<!DOCTYPE html>\n";
echo "<html lang=\"ar\" dir=\"rtl\">\n";
echo "<head>\n";
echo "    <meta charset=\"UTF-8\">\n";
echo "    <title>Test PHP Lexeme Implementation</title>\n";
echo "    <link href=\"https://tools-static.wmflabs.org/cdnjs/ajax/libs/bootstrap/5.3.7/css/bootstrap.rtl.min.css\" rel=\"stylesheet\">\n";
echo "</head>\n";
echo "<body>\n";
echo "<div class=\"container my-4\">\n";
echo "<h1>Test PHP Lexeme Implementation</h1>\n";

// Test with a known lexeme ID
$test_lexeme_id = "L3325"; // This is a common Arabic verb "كتب" (to write)

echo "<h2>Testing with lexeme ID: $test_lexeme_id</h2>\n";

$result = start_lexeme($test_lexeme_id);

if ($result) {
    echo "<div class=\"alert alert-success\">Successfully processed lexeme!</div>\n";
    echo $result;
} else {
    echo "<div class=\"alert alert-danger\">Failed to process lexeme</div>\n";
}

echo "</div>\n";
echo "</body>\n";
echo "</html>\n";
