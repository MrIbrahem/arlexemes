{% extends "main.php" %}

{% block content %}
<div class="container my-4">
    <div class="d-flex align-items-center justify-content-center">
        <div class="row col-md-11">
            <div class="max-w-3xl mx-auto rounded-lg shadow-md p-6 bg-light-subtle">
                <div class="row m-6 p-3">
                    <div class="col-md-9 col-sm-8 mb-2 mb-md-0">
                        <span class="text-2xl font-bold text-center h2">
                        </span>
                    </div>
                    <div class="col-md-3 col-sm-4 mb-2 mb-md-0">
                        <a href="#" target="_blank" id="sparql_url" class="btn btn-outline-primary disabled" role="button">
                            <span class="d-flex text-center align-items-center">
                                <span class="query"></span>&nbsp;
                                استعلام
                            </span>
                        </a>
                        <span id="query_time" class="ms-3"></span>
                    </div>
                </div>
                <div class="space-y-4" id="canvas_container">
                    <!-- <div class="card mb-2">
                        <div class="card-header">
                            <h2 class="card-title h4 fw-bold text-center">
                                إجمالي استخدامات الميزات النحوية في المفردات العربية
                                <span id="all_lemmas_0"></span>
                            </h2>
                        </div>
                        <div class="card-body">
                            <div class="row">
                                <div class="col-7">
                                    <div id="legend0" class="ms-1 mt-1">
                                    </div>
                                </div>
                                <div class="col-5">
                                    <div class="position-relative" style="max-height: 400px">
                                        <div id="loader0" class="loader">
                                            <div class="align-items-center">
                                                <div class="spinner-border text-primary" role="status">
                                                    <span class="visually-hidden">Loading...</span>
                                                </div>
                                                <span class="ms-3 h5 fw-semibold text-secondary">جاري تحميل البيانات...</span>
                                            </div>
                                        </div>
                                        <canvas id="chart0"></canvas>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div> -->
                </div>
            </div>
        </div>
    </div>
</div>
<!-- <script src='{  { cdn_base }  }/Chart.js/4.4.1/chart.min.js'></script> -->
<script src="/static/js/sparql.js"></script>
<script src="/static/js/features_chart.js"></script>
<script src="/static/js/lex/find_labels.js"></script>
<script src="/static/js/lexemes/wd_tree.js"></script>
<script src='https://cdn.jsdelivr.net/npm/chart.js'></script>
<script>
    // بدء العملية عند تحميل الصفحة بالكامل
    window.onload = initializeCharts;
</script>

{% endblock %}
