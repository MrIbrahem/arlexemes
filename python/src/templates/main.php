{% set cdn_base = "https://tools-static.wmflabs.org/cdnjs/ajax/libs" %}
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

    <script src="{{ url_for('static', filename='js/sparql.js') }}"></script>
    <script src="{{ url_for('static', filename='js/render.js') }}"></script>
    <script src="{{ url_for('static', filename='js/random.js') }}"></script>
    <script src="{{ url_for('static', filename='js/theme.js') }}"></script>
    <script src="{{ url_for('static', filename='js/autocomplete.js') }}"></script>

    <!-- Bootstrap 5 -->
    <!-- <link href="{{ cdn_base }}/bootstrap/5.3.7/css/bootstrap.min.css" rel="stylesheet"> -->
    <link href="{{ cdn_base }}/bootstrap/5.3.7/css/bootstrap.rtl.min.css" rel="stylesheet">
    <link href="{{ cdn_base }}/bootstrap-icons/1.11.3/font/bootstrap-icons.min.css" rel='stylesheet' type='text/css'>
    <link href="{{ cdn_base }}/font-awesome/6.7.2/css/all.min.css" rel="stylesheet">

    <!-- DataTables Bootstrap 5 -->
    <link rel='stylesheet' href='{{ cdn_base }}/datatables.net-bs5/2.2.2/dataTables.bootstrap5.css'>
    <link href="{{ cdn_base }}/bootstrap-select/1.14.0-beta3/css/bootstrap-select.css" rel='stylesheet' type='text/css'>

    <link href="{{ url_for('static', filename='css/style.css') }}" rel="stylesheet">
    <link href="{{ url_for('static', filename='css/theme.css') }}" rel="stylesheet">
    <link href="{{ url_for('static', filename='css/style2.css') }}" rel="stylesheet">
</head>

<body>
    <nav class="navbar navbar-expand-lg bg-body-tertiary shadow mb-4">
        <div class="container-fluid">
            <div class="nav_title">
                <a class="navbar-brand fw-bold" href="/">
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
                    <li class="nav-item col-6 col-lg-auto {{ 'active' if request.path.startswith('/P11038') else '' }}">
                        <a class="nav-link" href="/P11038">
                            <i class="bi bi-journal-text me-1"></i> الأنطولوجيا العربية
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
    </script>
    <footer class="footer mt-5 py-0">
    </footer>
</body>

</html>
