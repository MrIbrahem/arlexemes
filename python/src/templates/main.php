{% set cdn_base = "https://tools-static.wmflabs.org/cdnjs/ajax/libs" %}

{% macro examples_block() %}
<div class="list-group">
    <div class="list-group-item">
        <span class="fw-bold me-2">فعل:</span>
        <button class="btn btn-outline-secondary btn-sm ms-1" onclick="setExample('L1474373')">عَزَمَ</button>
        <button class="btn btn-outline-secondary btn-sm ms-1" onclick="setExample('L1474244')">هَلَّلَ</button>
        <button class="btn btn-outline-secondary btn-sm ms-1" onclick="setExample('L1473584')">أَرْعَبَ</button>
        <button class="btn btn-outline-secondary btn-sm ms-1" onclick="setExample('L1478621')">اِسْتَحْيَا</button>
        <button class="btn btn-outline-secondary btn-sm ms-1" onclick="setExample('L1478647')">ضَرَبَ</button>
    </div>
    <div class="list-group-item">
        <span class="fw-bold me-2">اسم:</span>
        <button class="btn btn-outline-secondary btn-sm ms-1" onclick="setExample('L1473670')">صَهْيُونِيّ</button>
        <button class="btn btn-outline-secondary btn-sm ms-1" onclick="setExample('L2465')">لَبَن</button>
        <button class="btn btn-outline-secondary btn-sm ms-1" onclick="setExample('L2355')">حَلِيب</button>
    </div>
    <div class="list-group-item">
        <span class="fw-bold me-2">صفة:</span>
        <button class="btn btn-outline-secondary btn-sm ms-1" onclick="setExample('L1131459')">ماهِر</button>
        <button class="btn btn-outline-secondary btn-sm ms-1" onclick="setExample('L1473674')">مُنَزَّل</button>
        <button class="btn btn-outline-secondary btn-sm ms-1" onclick="setExample('L1472818')">رَائِع</button>
    </div>
</div>
{% endmacro %}
<!DOCTYPE html>
<html lang="ar" dir="rtl" data-bs-theme="light">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="icon" type="image/svg+xml"
        href="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 150 150'><path fill='%23900' d='M24.656,5.203 H 60.656 L 24.656,67.179Z'/><path fill='%23396' d='M24.656,67.179 V 144.797 L 60.656,82.486 V 5.203Z M83.630,117.797 H 125.344 V 144.797 H 68.273Z'/><path fill='%230063BF' d='M60.656,82.486 V 117.797 H 83.630 L 68.273,144.797 H 24.656Z'/></svg>">

    {% block title %}
    <title>قائمة المفردات العربية - ويكي بيانات</title>
    {% endblock %}

    <script src="{{ cdn_base }}/jquery/3.7.0/jquery.min.js"></script>
    <script src="{{ cdn_base }}/popper.js/2.11.8/umd/popper.min.js"></script>
    <script src="{{ cdn_base }}/bootstrap/5.3.7/js/bootstrap.min.js"></script>
    <script src="{{ cdn_base }}/bootstrap-select/1.14.0-beta3/js/bootstrap-select.min.js"></script>
    <script src='{{ cdn_base }}/datatables.net/2.2.2/dataTables.js'></script>
    <script src='{{ cdn_base }}/datatables.net-bs5/2.2.2/dataTables.bootstrap5.min.js'></script>
    <script src='{{ cdn_base }}/datatables-responsive/3.0.4/dataTables.responsive.js'></script>

    <script src="/static/js/sparql.js"></script>
    <script src="/static/js/render.js"></script>
    <script src="/static/js/random.js"></script>
    <script src="/static/js/theme.js"></script>
    <script src="/static/js/autocomplete.js"></script>

    <!-- Bootstrap 5 -->
    <!-- <link href="{{ cdn_base }}/bootstrap/5.3.7/css/bootstrap.min.css" rel="stylesheet"> -->
    <link href="{{ cdn_base }}/bootstrap/5.3.7/css/bootstrap.rtl.min.css" rel="stylesheet">
    <link href="{{ cdn_base }}/bootstrap-icons/1.11.3/font/bootstrap-icons.min.css" rel='stylesheet' type='text/css'>
    <link href="{{ cdn_base }}/font-awesome/6.7.2/css/all.min.css" rel="stylesheet">

    <!-- DataTables Bootstrap 5 -->
    <link rel='stylesheet' href='{{ cdn_base }}/datatables.net-bs5/2.2.2/dataTables.bootstrap5.css'>
    <link rel='stylesheet' href='{{ cdn_base }}/datatables.net-responsive-bs5/3.0.4/responsive.bootstrap5.min.css'>
    <link href="{{ cdn_base }}/bootstrap-select/1.14.0-beta3/css/bootstrap-select.css" rel='stylesheet' type='text/css'>

    <link href="/static/css/style.css" rel="stylesheet">
    <link href="/static/css/theme.css" rel="stylesheet">
    <link href="/static/css/style2.css" rel="stylesheet">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;700&display=swap" rel="stylesheet">

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
    <nav class="navbar navbar-expand-lg bg-body-tertiary shadow mb-4" id="main_navbar">
        <div class="container-fluid">
            <div class="nav_title">
                <a class="navbar-brand fw-bold" href="/" id="main_title">
                    <span class="tool_icon ms-2"></span> المفردات العربية
                </a>
            </div>
            <button class="navbar-toggler me_ms_by_dir" type="button" data-bs-toggle="collapse"
                data-bs-target="#collapsibleNavbar" aria-controls="collapsibleNavbar" aria-expanded="false"
                aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="collapsibleNavbar">
                <ul class="navbar-nav flex-row flex-wrap bd-navbar-nav navbar-default">
                    <li class="nav-item col-6 col-lg-auto {{ 'active' if request.path == '/list.php' else '' }}">
                        <a class="nav-link" href="/list.php"><i
                                class="bi bi-journal-text me-1"></i>
                            قائمة المفردات
                        </a>
                    </li>
                    <li class="nav-item col-6 col-lg-auto {{ 'active' if request.path == '/new.php' else '' }}">
                        <a class="nav-link" href="/new.php">
                            <i class="bi bi-journal-text me-1"></i> أحدث المفردات
                        </a>
                    </li>
                    <li class="nav-item col-6 col-lg-auto {{ 'active' if request.path == '/duplicate_lemmas.php' else '' }}">
                        <a class="nav-link" href="/duplicate_lemmas.php">
                            <i class="bi bi-journal-text me-1"></i> مفردات مكررة
                        </a>
                    </li>
                    <li class="nav-item col-6 col-lg-auto {{ 'active' if request.path == '/wd_tree.php' else '' }}">
                        <a class="nav-link" href="/wd_tree.php">
                            <i class="bi bi-tree me-1"></i> مخطط شجري
                        </a>
                    </li>
                    <li class="nav-item col-6 col-lg-auto {{ 'active' if request.path == '/chart.php' else '' }}">
                        <a class="nav-link" href="/chart.php"><i class="bi bi-bar-chart-line me-1"></i>
                            مخطط بياني
                        </a>
                    </li>
                    <li class="nav-item col-6 col-lg-auto {{ 'active' if request.path.startswith('/P11038') else '' }}">
                        <a class="nav-link" href="/P11038">
                            <i class="bi bi-journal-text me-1"></i> الأنطولوجيا العربية
                        </a>
                    </li>
                    <li class="nav-item col-6 col-lg-auto {{ 'active' if request.path.startswith('/features_chart') else '' }}">
                        <a class="nav-link" href="/features_chart.php"><i class="bi bi-bar-chart-line me-1"></i>
                            الميزات النحوية
                        </a>
                    </li>
                </ul>

            </div>
            <div class="d-flex">
                <button class="theme-toggle btn btn-link ms-me-auto" aria-label="Toggle theme">
                    <i class="bi bi-moon-stars-fill"></i>
                </button>
            </div>
        </div>
    </nav>
    {% block content %}{% endblock %}
    <script>
        $('.soro').DataTable({
            paging: false,
            info: false,
            searching: false,
            order: []
        })
        $('.table_responsive').DataTable({
            paging: false,
            info: false,
            searching: false,
            responsive: {
                details: true
                // display: $.fn.dataTable.Responsive.display.modal()
            },
            order: []
        });
    </script>
    <footer class="footer mt-5 py-0">
    </footer>
</body>

<script>
    $("#main_title").attr("title", "{{ load_time|round(3) }} ثانية");
</script>
{% if time_tab %}
{% for name, exec_time in time_tab.items() %}
<span>{{ name }}: {{ exec_time }} s</span><br>
{% endfor %}
{% endif %}

</html>
