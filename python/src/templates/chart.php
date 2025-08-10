{% extends "main.php" %}

{% block content %}
<div class="container my-4">
    <div class="d-flex align-items-center justify-content-center">
        <div class="row col-md-9">
            <div class="max-w-3xl mx-auto rounded-lg shadow-md p-6 bg-light-subtle">
                <div class="row m-6 p-3">
                    <div class="col-md-9 col-sm-8 mb-2 mb-md-0">
                        <span class="text-2xl font-bold text-center h2">
                            مخطط بياني:
                        </span>
                    </div>
                    <div class="col-md-3 col-sm-4 mb-2 mb-md-0">
                        <a href="#" target="_blank" id="sparql_url" class="btn btn-outline-primary disabled" role="button">
                            <span class="d-flex text-center align-items-center">
                                <span class="query"></span>&nbsp;
                                استعلام
                            </span>
                        </a>
                        <span id="query_time"></span>
                    </div>
                </div>
                <div class="space-y-4">
                    <div class="card mb-2">
                        <div class="card-header">
                            <h2 class="card-title h4 fw-bold text-center">
                                الفئات المعجمية في اللغة العربية
                            </h2>
                        </div>
                        <div class="card-body">
                            <div class="position-relative" style="max-height: 250px;">
                                <div id="loader1" class="loader">
                                    <div class="d-flex align-items-center">
                                        <div class="spinner-border text-primary" role="status">
                                            <span class="visually-hidden">Loading...</span>
                                        </div>
                                        <span class="ms-3 h5 fw-semibold text-secondary">جاري تحميل البيانات...</span>
                                    </div>
                                </div>
                                <canvas id="chart1"></canvas>
                            </div>
                        </div>
                    </div>
                    <div class="card mb-2">
                        <div class="card-header">
                            <h2 class="card-title h4 fw-bold text-center">
                                أفضل 9 لغات + العربية حسب عدد المفردات
                            </h2>
                        </div>
                        <div class="card-body">
                            <div class="position-relative" style="max-height: 250px;">
                                <div id="loader2" class="loader">
                                    <div class="d-flex align-items-center">
                                        <div class="spinner-border text-primary" role="status">
                                            <span class="visually-hidden">Loading...</span>
                                        </div>
                                        <span class="ms-3 h5 fw-semibold text-secondary">جاري تحميل البيانات...</span>
                                    </div>
                                </div>
                                <canvas id="chart2"></canvas>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
<!-- <script src='{  { cdn_base }  }/Chart.js/4.4.1/chart.min.js'></script> -->
<script src='https://cdn.jsdelivr.net/npm/chart.js'></script>
<script src="/js/chart.js"></script>
<script src="/js/lex/find_labels.js"></script>
<script src="/js/lexemes/queries.js"></script>
<script src="/js/lexemes/wd_tree.js"></script>

<script>
    // بدء العملية عند تحميل الصفحة بالكامل
    window.onload = initializeCharts;
</script>

{% endblock %}
