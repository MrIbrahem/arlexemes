{% extends "main.php" %}

{% block content %}

<style>
    /* حد عمودي بين الإطارين */
    .border-between {
        border-left: 3px solid #ccc;
    }

    /* إذا الوضع عمودي نغير الحد ليكون أفقي */
    .flex-column .border-between {
        border-left: none;
        border-bottom: 3px solid #ccc;
    }
</style>
<div class="container my-4">
    <div class="d-flex align-items-center justify-content-center">
        <div class="row col-md-10 border rounded">
            <div class="max-w-3xl mx-auto rounded-lg shadow-md p-6 bg-light-subtle">
                <div class="row m-6 p-3">
                    <div class="col-md-10 col-sm-10 mb-2 mb-md-0">
                        <span class="text-2xl font-bold text-center h2">
                            مقارنة المفردات:
                        </span>
                    </div>
                    <div class="col-md-2 col-sm-2 mb-2 mb-md-0">
                        <a href="#" target="_blank" id="sparql_url" class="btn btn-outline-primary disabled" role="button">
                            <span class="d-flex text-center align-items-center">
                                <span class="query"></span>&nbsp;
                                استعلام
                            </span>
                        </a>
                        <!-- <span id="query_time" class="ms-3"></span> -->
                    </div>
                </div>
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
<script src="/static/js/lex/find_labels.js"></script>
<script src="/static/js/lexemes/queries.js"></script>
<script src="/static/js/lexemes/duplicate_lemmas.js"></script>
<script src="/static/js/toggleView_compare.js"></script>

<script>
    document.addEventListener('DOMContentLoaded', () => load_duplicate());
</script>

{% endblock %}
