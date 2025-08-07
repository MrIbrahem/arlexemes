{% extends "main.php" %}

{% block content %}

<div class="container my-4">
    <div class="d-flex align-items-center justify-content-center">
        <div class="row col-md-10 border rounded">
            <div class="max-w-3xl mx-auto rounded-lg shadow-md p-6 bg-light-subtle">
                <form method="GET">
                    <div class="row m-6 p-3">
                        <div class="col-md-4 col-sm-6 mb-2 mb-md-0">
                            <span class="text-2xl font-bold text-center h2">
                                المفردات المكررة
                            </span>
                        </div>
                        <div class="col-md-3 col-sm-6 mb-2 mb-md-0">
                            <a href="#" target="_blank" id="sparql_url" class="btn btn-outline-primary disabled" role="button">
                                <span class="d-flex text-center align-items-center">
                                    <span class="query"></span>&nbsp;
                                    استعلام
                                </span>
                            </a>
                            <span id="query_time"></span>
                        </div>
                        <div class="col-md-4 col-sm-12 mb-2 mb-md-0">
                            <div class="input-group">
                                <div class="form-control d-flex flex-column">
                                    <div class="form-check form-switch">
                                        <input class="form-check-input" type="checkbox" id="same_category" name="same_category" value="1">
                                        <label class="check-label" for="same_category">نفس التصنيف المعجمي</label>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-1 col-sm-12 text-center">
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
                <div id="tables_container"></div>
            </div>
        </div>
    </div>
</div>
<script src="{{ url_for('static', filename='js/duplicate_lemmas.js') }}"></script>
<script>
    document.addEventListener('DOMContentLoaded', () => load_duplicate());
</script>

{% endblock %}
