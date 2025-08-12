{% extends "main.php" %}
{% block title %}
<title>المفردات العربية</title>
{% endblock %}

{% block content %}
<div class="container-fluid">
    <div class="row justify-content-center">
        <div class="col-lg-8 col-sm-12">
            <div class="card card_form mb-3">
                <div class="card-header text-center py-2">
                    <h4 class="card-title mb-0 d-flex align-items-center justify-content-center">
                        <i class="bi bi-braces-asterisk me-2"></i> ابحث عن مفردة أو جرب مثالًا
                    </h4>
                </div>
                <div class="card-body p-3">
                    <form id="form" action="/lex.php" method="get">

                        <div class="row">
                            <div class="col-md-12">
                                <div class="form-group mb-2">
                                    <div class="d-flex justify-content-between align-items-center mb-2">
                                        <label for="wd_id" class="form-label fw-bold mb-2">
                                            <i class="fas fa-link me-2"></i> ابحث عن مفردة
                                            <div class="spinner-border spinner-border-sm" id="autocomplete-loader" role="status"
                                                style="display: none;">
                                                <span class="visually-hidden">تحميل...</span>
                                            </div>
                                        </label>
                                        <button type="button" class="btn btn-sm btn-outline-secondary" onclick="randomCategory()">
                                            <i class="bi bi-shuffle me-1"></i> عشوائي
                                        </button>
                                    </div>
                                    <span id="wikidatasearch_label"></span>
                                    <div class="input-group input-group-lg">
                                        <input type="text" id="wd_id" required name="wd_id" class="form-control input-group-input"
                                            placeholder="كتب" value="">
                                    </div>
                                    <div id="autocomplete-results" class="autocomplete-results"></div>
                                </div>
                            </div>
                        </div>
                        <div class="d-grid gap-2">
                            <button type="submit" class="btn btn-outline-primary btn-lg">
                                <span id="notloading">بدء</span>
                                <div id="loading" role="status" style="display: none;">
                                    <span class="spinner-grow spinner-grow-sm" aria-hidden="true"></span>
                                    <span role="status">تحميل...</span>
                                </div>
                            </button>
                        </div>
                    </form>
                </div>
                <div class="card-footer">
                    <h5 class="card-title">أمثلة:</h5>
                    {{ examples_block() }}
                </div>
            </div>
            <div class="card mb-2">
                <div class="card-header">
                    <h2 class="card-title h4 fw-bold text-center">
                         الفئات المعجمية لمفردات اللغة العربية <span id="all_lemmas_1"></span>
                    </h2>
                </div>
                <div class="card-body">
                    <div class="position-relative" style="max-height: 270px;">
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
        </div>
    </div>
</div>
<script src='https://cdn.jsdelivr.net/npm/chart.js'></script>
<script src="/static/js/chart.js"></script>

<script>
    // بدء العملية عند تحميل الصفحة بالكامل
    window.onload = initializeCharts;
</script>
<script>
    function setExample(lexeme) {
        $("#wd_id").val(lexeme);
    }
    $(function() {
        load_search(setExample, 'wd_id', 'autocomplete-results');
    });
</script>
{% if time_tab %}
    {% for name, exec_time in time_tab.items() %}
    <span>{{ name }}: {{ exec_time }} s</span><br>
    {% endfor %}
{% endif %}
{% endblock %}
