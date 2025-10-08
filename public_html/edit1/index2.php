<?php

ini_set("display_errors", 1);
ini_set("display_startup_errors", 1);
error_reporting(E_ALL);

?>
<!DOCTYPE html>
<html lang="ar" dir="rtl" data-bs-theme="light">

<head>

    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>قائمة المفردات العربية - ويكي بيانات</title>

    <script src="https://tools-static.wmflabs.org/cdnjs/ajax/libs/jquery/3.7.0/jquery.min.js"></script>
    <script src="https://tools-static.wmflabs.org/cdnjs/ajax/libs/popper.js/2.11.8/umd/popper.min.js"></script>
    <script src="https://tools-static.wmflabs.org/cdnjs/ajax/libs/bootstrap/5.3.7/js/bootstrap.min.js"></script>

    <link href="https://tools-static.wmflabs.org/cdnjs/ajax/libs/bootstrap/5.3.7/css/bootstrap.rtl.min.css" rel="stylesheet">
    <link href="https://tools-static.wmflabs.org/cdnjs/ajax/libs/bootstrap-icons/1.11.3/font/bootstrap-icons.min.css" rel='stylesheet' type='text/css'>



    <style>
        /* تطبيق الخط على كامل الصفحة */
        body :not(.words) {
            font-family: 'Cairo', sans-serif;
        }

        .words {
            font-family: "" !important;
        }

        /* تصميم مخصص لمؤشر التحميل */
        .loader {
            display: flex;
            /* يظهر بشكل افتراضي، ويتم إخفاؤه عبر JS */
            position: absolute;
            inset: 0;
            align-items: center;
            justify-content: center;
            background-color: rgba(255, 255, 255, 0.85);
            z-index: 10;
            border-radius: 0.75rem;
            /* نفس استدارة الحاوية */
            transition: opacity 0.3s ease-in-out;
        }
    </style>

</head>

<body>
    <div class="container-fluid my-4">
        <div id="errors"></div>
        <?php
        require_once __DIR__ . '/includes/include.php';

        use function Lexeme\Processing\start_lexeme;

        $lex_id = $_GET['lex'] ?? $_GET['wd_id'] ?? null;
        $output_html = "";
        if ($lex_id) {
            $output_html = start_lexeme($lex_id);
        } else {
            $output_html = "<div class='alert alert-info'>الرجاء تحديد معرف المفردة.</div>";
        }
        ?>
        <div id="output">
            <?php
            if (!empty($output_html)) {
                echo $output_html;
            }
            ?>
        </div>
    </div>
</body>

</html>
