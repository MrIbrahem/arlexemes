{% extends "main.php" %}

{% block content %}
<div class="container my-4">
    <div class="d-flex align-items-center justify-content-center">
        <div class="row col-md-9">
            <div class="max-w-3xl mx-auto rounded-lg shadow-md p-6 bg-light-subtle">
                <h3 class="text-2xl font-bold text-center m-6 p-3">المخطط الشجري للكلمات <span id="total"></span>
                </h3>
                <form method="GET" class="mb-0">
                    <div class="row">
                        <div class="col-md-3">
                            <label for="group_by" class="form-label fw-bold">جمع بـ:</label>
                            <select name="group_by" id="group_by" class="form-select w-auto d-inline-block"
                                onchange="this.form.submit()">
                                <option value="P31Label">P31Label</option>
                                <option value="categoryLabel">categoryLabel</option>
                                <option value="P31Label">P31Label</option>
                                <option value="P6771">P6771</option>
                                <option value="P11038">P11038</option>
                                <option value="P11757">P11757</option>
                                <option value="P12451">P12451</option>
                            </select>
                        </div>
                        <div class="col-md-4">
                            <label for="group_by" class="form-label fw-bold">العدد:</label>
                            <div class="row">
                                <div class="col-md-6 text-center">
                                    <input type="number" id="limit" name="limit" class="form-control"
                                        placeholder="عدد النتائج" value="1000">
                                </div>
                                <div class="col-md-6 text-center">
                                    <button type="submit" class="btn btn-primary">تحميل</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
                <div class="mb-3">
                    <input type="text" id="searchInput" placeholder="ابحث عن كلمة..." class="form-control" />
                </div>

                <div id="loading" class="text-center text-primary hidden">جارٍ التحميل...</div>

                <div id="error" class="hidden alert alert-danger p-4 rounded text-center">
                    <p id="errorMessage" class="text-danger"></p>
                    <button onclick="fetchData()" class="mt-3 btn btn-primary">إعادة
                        المحاولة</button>
                </div>

                <ul id="tree" class="list-unstyled space-y-2"></ul>

                <p id="noResults" class="hidden text-center text-muted">لا توجد نتائج مطابقة للبحث.</p>
            </div>
        </div>
    </div>
</div>
<script src="{{ url_for('static', filename='js/lexemes/wd.js') }}"></script>
<script>
    document.addEventListener('DOMContentLoaded', () => fetchData());
</script>

{% endblock %}
