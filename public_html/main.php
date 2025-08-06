<!DOCTYPE html>
<html lang="ar" dir="rtl" data-bs-theme="light">

<?php

$cdn_base = "https://tools-static.wmflabs.org/cdnjs/ajax/libs";

echo "<head>";

echo <<<HTML
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="icon" type="image/svg+xml"
      href="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 150 150'><path fill='%23900' d='M24.656,5.203 H 60.656 L 24.656,67.179Z'/><path fill='%23396' d='M24.656,67.179 V 144.797 L 60.656,82.486 V 5.203Z M83.630,117.797 H 125.344 V 144.797 H 68.273Z'/><path fill='%230063BF' d='M60.656,82.486 V 117.797 H 83.630 L 68.273,144.797 H 24.656Z'/></svg>">

    <title>قائمة المفردات العربية - ويكي بيانات</title>

    <script src="$cdn_base/jquery/3.7.0/jquery.min.js"></script>
    <script src="$cdn_base/popper.js/2.11.8/umd/popper.min.js"></script>
    <script src="$cdn_base/bootstrap/5.3.0/js/bootstrap.min.js"></script>
    <script src="$cdn_base/bootstrap-select/1.14.0-beta3/js/bootstrap-select.min.js"></script>
    <script src='$cdn_base/datatables.net/2.2.2/dataTables.js'></script>
    <script src='$cdn_base/datatables.net-bs5/2.2.2/dataTables.bootstrap5.min.js'></script>

    <script src="/js/sparql.js"></script>
    <script src="/js/random.js"></script>
    <script src="/js/theme.js"></script>
    <script src="/js/autocomplete.js"></script>

    <!-- Bootstrap 5 -->
    <link href="$cdn_base/bootstrap/5.3.0/css/bootstrap.min.css" rel="stylesheet">
    <link href="$cdn_base/bootstrap-icons/1.11.3/font/bootstrap-icons.min.css" rel='stylesheet' type='text/css'>
    <link href="$cdn_base/font-awesome/6.7.2/css/all.min.css" rel="stylesheet">

    <!-- DataTables Bootstrap 5 -->
    <link rel='stylesheet' href='$cdn_base/datatables.net-bs5/2.2.2/dataTables.bootstrap5.css'>
    <link href="$cdn_base/bootstrap-select/1.14.0-beta3/css/bootstrap-select.css" rel='stylesheet' type='text/css'>

    <link href="/css/style.css" rel="stylesheet">
    <link href="/css/theme.css" rel="stylesheet">
    <link href="/css/style2.css" rel="stylesheet">

HTML;
?>

</head>

<body>
    <nav class="navbar navbar-expand-lg bg-body-tertiary shadow mb-4">
        <div class="container-fluid">
            <div class="nav_title">
                <a class="navbar-brand fw-bold" href="/">
                    <span class="tool_icon me-2"></span> المفردات العربية
                </a>
            </div>
            <button class="navbar-toggler me_ms_by_dir" type="button" data-bs-toggle="collapse"
                data-bs-target="#collapsibleNavbar" aria-controls="collapsibleNavbar" aria-expanded="false"
                aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="collapsibleNavbar">
                <ul class="navbar-nav flex-row flex-wrap bd-navbar-nav navbar-default">
                    <li class="nav-item col-6 col-lg-auto <?= basename($_SERVER['REQUEST_URI']) == 'list.php' ? 'active' : '' ?> ">
                        <a class="nav-link" href="/list.php"><i class="bi bi-journal-text ms-1"></i>
                            قائمة المفردات
                        </a>
                    </li>
                    <li class="nav-item col-6 col-lg-auto <?= basename($_SERVER['REQUEST_URI']) == 'new.php' ? 'active' : '' ?> ">
                        <a class="nav-link" href="/new.php"><i class="bi bi-journal-text ms-1"></i>
                            أحدث المفردات
                        </a>
                    </li>
                    <li class="nav-item col-6 col-lg-auto <?= basename($_SERVER['REQUEST_URI']) == 'duplicate_lemmas.php' ? 'active' : '' ?> ">
                        <a class="nav-link" href="/duplicate_lemmas.php"><i class="bi bi-journal-text ms-1"></i>
                            المكررات
                        </a>
                    </li>
                    <li class="nav-item col-6 col-lg-auto <?= basename($_SERVER['REQUEST_URI']) == 'wd.php' ? 'active' : '' ?> ">
                        <a class="nav-link" href="/wd.php"><i class="bi bi-tree ms-1"></i>
                            مخطط شجري
                        </a>
                    </li>
                </ul>
                <hr class="d-lg-none text-dark-subtle text-50">
                <ul class="navbar-nav flex-row flex-wrap bd-navbar-nav me-lg-auto">

                    <li class="nav-item col-4 col-lg-auto">
                        <a href="#" class="nav-link py-2 px-0 px-lg-2">
                            <i class="fas fa-user fa-sm fa-fw mr-2"></i> <span class="navtitles">مرحبًا!</span>
                        </a>
                    </li>
                </ul>
            </div>
            <div class="d-flex">
                <button class="theme-toggle btn btn-link me-ms-auto" aria-label="Toggle theme">
                    <i class="bi bi-moon-stars-fill"></i>
                </button>
            </div>
        </div>
    </nav>
