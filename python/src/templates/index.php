{% extends "main.php" %}
{% block title %}
<title>المفردات العربية</title>
{% endblock %}

{% block content %}
<div class="container-fluid">
    <div class="row justify-content-center">
        <div class="col-lg-8 col-sm-12">
            <div class="card card_form">
                <div class="card-header text-center py-2">
                    <h4 class="card-title mb-0 d-flex align-items-center justify-content-center">
                        <i class="bi bi-braces-asterisk me-2"></i> الوظيفة الرئيسية
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
                    <div class="row">
                        <div class="col-md-5">
                            <span class="ms-2">اسم:</span><br>
                            <button class="btn btn-outline-secondary btn-sm ms-1"
                                onclick="setLabel('L1473670')">L1473670</button>
                            <button class="btn btn-outline-secondary btn-sm ms-1" onclick="setLabel('L2465')">L2465 -
                                معدود</button>
                            <button class="btn btn-outline-secondary btn-sm ms-1" onclick="setLabel('L2355')">L2355 - غير
                                معدود</button>
                        </div>
                        <div class="col-md-4">
                            <span class="ms-2">صفة:</span><br>
                            <button class="btn btn-outline-secondary btn-sm ms-1"
                                onclick="setLabel('L1131459')">L1131459</button>
                            <button class="btn btn-outline-secondary btn-sm ms-1"
                                onclick="setLabel('L1473674')">L1473674</button>
                            <button class="btn btn-outline-secondary btn-sm ms-1"
                                onclick="setLabel('L1472818')">L1472818</button>
                        </div>
                        <div class="col-md-3">
                            <span class="ms-2">فعل:</span><br>
                            <button class="btn btn-outline-secondary btn-sm ms-1"
                                onclick="setLabel('L1474373')">L1474373</button>
                            <button class="btn btn-outline-secondary btn-sm ms-1"
                                onclick="setLabel('L1474244')">L1474244</button>
                            <button class="btn btn-outline-secondary btn-sm ms-1"
                                onclick="setLabel('L1473584')">L1473584</button>
                            <button class="btn btn-outline-secondary btn-sm ms-1"
                                onclick="setLabel('L1474044')">L1474044</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
<script>
    function setLabel(lexeme) {
        $("#wd_id").val(lexeme);
    }
    $(function() {
        load_search(setLabel, 'wd_id', 'autocomplete-results');
    });
</script>
{% endblock %}
