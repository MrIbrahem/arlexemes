{% extends "main.php" %}

{% block content %}
<div class="container my-4">
    <div class="d-flex align-items-center justify-content-center">
        <div class="row col-md-9">
            <div class="max-w-3xl mx-auto rounded-lg shadow-md p-6 bg-light-subtle">
                <div class="row m-6 p-3">
                    <div class="col-md-9 col-sm-8 mb-2 mb-md-0">
                        <span class="text-2xl font-bold text-center h2">
                            المخطط الشجري: <span id="total"></span>
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
                <!-- <hr class="d-lg-none text-dark-subtle text-50"> -->
                <form method="GET" class="mb-0">
                    <div class="row">
                        <div class="col-md-3">
                            <div class="form-group">
                                <label for="group_by" class="form-label fw-bold">التصنيف:</label>
                                <select name="data_source" id="data_source" class="form-select d-inline-block">
                                    <option value="all">الكل</option>
                                    <option value="Q34698">صفة</option>
                                    <option value="Q24905">فعل</option>
                                    <option value="Q1084">اسم</option>
                                    <option value="Q111029">جذر</option>
                                </select>
                            </div>
                        </div>
                        <div class="col-md-4 col-sm-6">
                            <div class="form-group">
                                <label for="group_by" class="form-label fw-bold">جمع بـ:</label>
                                <select name="group_by" id="group_by" class="form-select w-100 d-inline-block" onchange="toggleCustomInput()">
                                    <!-- <option value="P31Label">Instance of - P31</option>
                                    <option value="P5185">الجنس النحوي - P5185</option>
                                    <option value="categoryLabel">التصنيف المعجمي</option>
                                    <option value="P6771">Arabic Ontology concept ID - P6771</option>
                                    <option value="P11038">Arabic Ontology lemma ID - P11038</option>
                                    <option value="P12451">Arabic Ontology lexical concept ID - P12451</option> -->
                                    <option value="custom">-- إدخال مخصص --</option>
                                </select>

                                <input type="text" name="custom_group_by" id="custom_group_by" class="form-control mt-2" placeholder="أدخل الخاصية يدويًا مثل P12345" style="display: none;" pattern="^P\d+$">
                            </div>
                        </div>
                        <div class="col-md-2 col-sm-6">
                            <label for="limit" class="form-label fw-bold">العدد:</label>
                            <input type="number" id="limit" name="limit" class="form-control"
                                placeholder="عدد النتائج" value="1000">
                        </div>
                        <div class="col-md-3 col-sm-12">
                            <label class="form-label fw-bold"></label>
                            <button type="submit" class="form-control btn btn-outline-primary">تحميل</button>
                        </div>
                    </div>
                    <div class="mb-3">
                        <hr>
                        <input type="text" id="searchInput" placeholder="ابحث عن كلمة..." class="form-control" />
                    </div>
                </form>

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

                <p id="noResults" class="hidden text-center text-muted">لا توجد نتائج مطابقة للبحث.</p>
            </div>
        </div>
    </div>
</div>
<script src="{{ url_for('static', filename='js/lex/find_labels.js') }}"></script>
<script src="{{ url_for('static', filename='js/lexemes/wd_tree.js') }}"></script>
<script>
    document.addEventListener('DOMContentLoaded', async () => {
        await load_tree();
    });
</script>

{% endblock %}
