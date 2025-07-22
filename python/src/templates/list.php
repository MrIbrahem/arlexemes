{% extends "main.php" %}

{% block content2 %}
<div class="container my-4">
    <div class="d-flex align-items-center justify-content-center">
        <div class="row col-md-9 border rounded">
            <div class="max-w-3xl mx-auto rounded-lg shadow-md p-6 bg-light-subtle">
                <div class="d-flex align-items-center justify-content-between  m-6 p-3">
                    <span class="text-2xl font-bold text-center h2">
                        قائمة المفردات العربية <span id="total"></span>
                    </span>

                    <form method="GET">
                        <div class="row">
                            <div class="col-md-6 text-center">
                                <input type="number" id="limit" name="limit" class="form-control"
                                    placeholder="عدد النتائج" value="1000">
                            </div>
                            <div class="col-md-6 text-center">
                                <button type="submit" class="btn btn-primary">تحميل</button>
                            </div>
                        </div>

                    </form>
                </div>
                <hr>
                <div id="loading" class="text-center text-primary hidden">جارٍ التحميل...</div>

                <div id="error" class="hidden alert alert-danger p-4 rounded text-center">
                    <p id="errorMessage" class="text-danger"></p>
                    <button onclick="fetchData()" class="mt-3 btn btn-primary">إعادة
                        المحاولة</button>
                </div>

                <ul id="tree" class="list-unstyled space-y-2"></ul>
                <ul class="nav nav-tabs" id="myTab" role="tablist">
                </ul>
                <div class="tab-content row list-group mt-3" id="myTabContent">
                </div>
                <p id="noResults" class="hidden text-center text-muted">لا توجد نتائج مطابقة للبحث.</p>
            </div>
        </div>
    </div>
</div>
<script src="{{ url_for('static', filename='lexemes/wd_result.js') }}"></script>
<script src="{{ url_for('static', filename='lexemes/list_lexemes.js') }}"></script>
<script>
    document.addEventListener('DOMContentLoaded', () => fetchData());
</script>

{% endblock %}
