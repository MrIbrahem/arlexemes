<?php

$cdn_base = "https://tools-static.wmflabs.org/cdnjs/ajax/libs";

?>

<!DOCTYPE html>
<html lang="ar" dir="rtl" data-bs-theme="light">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="icon" href="https://www.mediawiki.org/static/images/icons/mediawikiwiki.svg" type="image/svg+xml">
    <title>قائمة المفردات العربية - ويكي بيانات</title>

    <!-- jQuery -->
    <script src="$cdn_base/jquery/3.7.0/jquery.min.js"></script>
    <script src="$cdn_base/popper.js/2.11.8/umd/popper.min.js"></script>

    <!-- Bootstrap 5 -->
    <link href="$cdn_base/bootstrap/5.3.0/css/bootstrap.min.css"
        rel="stylesheet">
    <link href="$cdn_base/bootstrap-icons/1.11.3/font/bootstrap-icons.min.css"
        rel='stylesheet' type='text/css'>
    <link href="$cdn_base/font-awesome/6.7.2/css/all.min.css" rel="stylesheet">
    <link rel='stylesheet'
        href='$cdn_base/datatables.net-bs5/2.2.2/dataTables.bootstrap5.css'>
    <link href="$cdn_base/bootstrap-select/1.14.0-beta3/css/bootstrap-select.css"
        rel='stylesheet' type='text/css'>

    <!-- DataTables Bootstrap 5 -->
    <script src="$cdn_base/bootstrap/5.3.0/js/bootstrap.min.js"></script>
    <script src="$cdn_base/bootstrap/5.3.0/js/bootstrap.bundle.min.js"></script>
    <script
        src="$cdn_base/bootstrap-select/1.14.0-beta3/js/bootstrap-select.min.js"></script>
    <script src='$cdn_base/datatables.net/2.2.2/dataTables.js'></script>
    <script
        src='$cdn_base/datatables.net-bs5/2.2.2/dataTables.bootstrap5.min.js'></script>

    <link href="/css/style.css" rel="stylesheet">
    <link href="/css/theme.css" rel="stylesheet">
    <link href="/css/style2.css" rel="stylesheet">
</head>

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
            <ul class="navbar-nav flex-row flex-wrap bd-navbar-nav">
                <li class="nav-item col-6 col-lg-auto">
                    <a class="nav-link" href="/list.php"><i class="bi bi-journal-text ms-1"></i>
                        قائمة المفردات
                    </a>
                </li>
                <li class="nav-item col-6 col-lg-auto">
                    <a class="nav-link" href="/wd.php"><i class="bi bi-journal-text ms-1"></i>
                        المخطط
                    </a>
                </li>
                <li class="nav-item col-6 col-lg-auto">
                    <a class="nav-link" href="/duplicate_lemmas.php"><i class="bi bi-journal-text ms-1"></i>
                        المكررات
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
