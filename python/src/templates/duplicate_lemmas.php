{% extends "main.php" %}

{% block content %}

<div class="container my-4">
    <div class="d-flex align-items-center justify-content-center">
        <div class="row col-md-10 border rounded">
            <div class="max-w-3xl mx-auto rounded-lg shadow-md p-6 bg-light-subtle">
                <form method="GET">
                    <div class="row m-6 p-3">
                        <div class="col-md-4 col-sm-6 mb-3 mb-md-0">
                            <span class="text-2xl font-bold text-center h2">
                                المفردات المكررة
                            </span>
                        </div>
                        <div class="col-md-2 col-sm-6 mb-3 mb-md-0">
                            <a href="#" target="_blank" id="sparql_url" class="btn btn-outline-primary disabled" role="button">
                                <span class="d-flex text-center align-items-center">
                                    <span class="query"></span>&nbsp;
                                    استعلام
                                </span>
                            </a>
                        </div>
                        <div class="col-md-4 col-sm-12 mb-3 mb-md-0">
                            <div class="input-group">
                                <span class="input-group-text">التصنيف</span>
                                <select name="data_source" id="data_source" class="form-select d-inline-block">
                                    <option value="all">الكل</option>
                                    <option value="Q34698">صفة</option>
                                    <option value="Q24905">فعل</option>
                                    <option value="Q1084">اسم</option>
                                    <option value="Q111029">جذر</option>
                                </select>
                            </div>
                        </div>
                        <div class="col-md-2 col-sm-12 text-center">
                            <button type="submit" class="btn btn-primary">تحميل</button>
                        </div>
                    </div>
                </form>
                <hr>
                <div id="loading" class="text-center text- hidden">
                    <div class="spinner-border spinner-border-sm" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    جارٍ التحميل (بطيء)...<br>أي مقترح لتحسين الاستعلام مرحب به
                </div>
                <div class="card-body">
                    <div id="rowCount" class="mb-3 text-center fw-bold"></div>
                    <div id="tables_container"></div>
                </div>
            </div>
        </div>
    </div>
</div>
<script src="{{ url_for('static', filename='js/duplicate_lemmas.js') }}"></script>
<script>
    document.addEventListener('DOMContentLoaded', () => load_duplicate());
</script>

{% endblock %}
