{% extends "main.php" %}

{% block content %}
<div class="container my-4">
    <div class="d-flex align-items-center justify-content-center">
        <div class="row col-md-10 border rounded">
            <div class="max-w-3xl mx-auto rounded-lg shadow-md bg-light-subtle">
                <div class="row m-6 p-3"><!--  d-flex align-items-center justify-content-between -->
                    <div class="col-md-4 col-sm-6 mb-2 mb-md-0">
                        <span class="text-2xl font-bold text-center h2">
                            قائمة المفردات:
                        </span>
                    </div>
                    <div class="col-md-2 col-sm-6 mb-2 mb-md-0">

                        <a href="#" target="_blank" id="sparql_url" class="btn btn-outline-primary disabled" role="button">
                            <span class="d-flex text-center align-items-center">
                                <span class="query"></span>&nbsp;
                                استعلام
                            </span>
                        </a>
                        <span id="query_time"></span>

                    </div>
                    <div class="col-md-6 col-sm-12">
                        <form method="GET">
                            <div class="row">
                                <div class="col-md-6 mb-2 mb-md-0">
                                    <div class="input-group">
                                        <span class="input-group-text">التصنيف</span>
                                        <select name="data_source" id="data_source" class="form-select d-inline-block" onchange="toggleCustomInput()">
                                            <option value="all">الكل</option>
                                            <option value="Q34698">صفة</option>
                                            <option value="Q24905">فعل</option>
                                            <option value="Q1084">اسم</option>
                                            <option value="Q111029">جذر</option>
                                            <option value="custom">إدخال مخصص</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="col-md-3 text-center mb-2 mb-md-0">
                                    <input type="number" id="limit" name="limit" class="form-control" placeholder="عدد النتائج" value="1000">
                                </div>
                                <div class="col-md-3 text-center mb-2 mb-md-0">
                                    <button type="submit" class="btn btn-primary">تحميل</button>
                                </div>

                                <input type="text" name="custom_data_source" id="custom_data_source" class="form-control mt-2" placeholder="أدخل القيمة يدويًا مثل Q12345" style="display: none;" pattern="^Q\d+$">
                            </div>

                        </form>
                    </div>
                </div>
                <hr>
                <div id="loading" class="text-center text- hidden">
                    <div class="spinner-border spinner-border-sm" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    جارٍ التحميل (بطيء)...<br>أي مقترح لتحسين الاستعلام مرحب به
                </div>
                <div id="error" class="hidden alert alert-danger p-4 rounded text-center">
                    <p id="errorMessage" class="text-danger"></p>
                    <button onclick="loadfetchData()" class="mt-3 btn btn-primary">إعادة
                        المحاولة</button>
                </div>

                <ul id="tree" class="list-unstyled space-y-2"></ul>
                <ul class="nav nav-tabs" id="myTab" role="tablist">
                    <li class="nav-item nav-link position-relative fw-bold">
                        <span id="total"></span>
                    </li>
                </ul>
                <div class="tab-content row list-group mt-3" id="myTabContent">
                </div>
                <p id="noResults" class="hidden text-center text-muted">لا توجد نتائج مطابقة للبحث.</p>
            </div>
        </div>
    </div>
</div>
<script src="{{ url_for('static', filename='js/lexemes/list_lexemes.js') }}"></script>
<script>
    document.addEventListener('DOMContentLoaded', async () => {
        await load_list();
    });
</script>

{% endblock %}
