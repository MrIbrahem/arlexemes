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

    <script src="js/data.js"></script>
    <script src="js/lex_data.js"></script>
    <script src="js/lex.js"></script>
    <script src="js/lex_page.js"></script>

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
        <div id="output"></div>

    </div>
    <script>
        async function setExample(lexeme) {
            // document.getElementById('lexemeId').value = lexeme;

        }

        $(document).ready(async function() {
            const urlParams = new URLSearchParams(window.location.search);
            const lex = urlParams.get('lex') || urlParams.get('wd_id');
            if (lex) {
                await start_lexeme(lex, no_head = true);
            }
        });
    </script>
</body>

</html>
