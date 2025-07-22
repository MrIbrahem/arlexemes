{% extends "main.php" %}
{% block title %}
<title>المفردات العربية</title>
{% endblock %}

{% block content %}

<div class="modal fade" id="exampleModalToggle" aria-hidden="true" aria-labelledby="exampleModalToggleLabel" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
            <div class="modal-header">
                <h1 class="modal-title fs-5" id="exampleModalToggleLabel">أمثلة:</h1>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <div class="row">
                    <div class="col-md-5">
                        <span class="me-2">اسم:</span><br>
                        <button class="btn btn-outline-secondary btn-sm me-1"
                            onclick="setExample('L1244618')">L1244618</button>
                        <button class="btn btn-outline-secondary btn-sm me-1" onclick="setExample('L2465')">L2465 -
                            معدود</button>
                        <button class="btn btn-outline-secondary btn-sm me-1" onclick="setExample('L2355')">L2355 - غير
                            معدود</button>
                    </div>
                    <div class="col-md-4">
                        <span class="me-2">صفة:</span><br>
                        <button class="btn btn-outline-secondary btn-sm me-1"
                            onclick="setExample('L1131459')">L1131459</button>
                        <button class="btn btn-outline-secondary btn-sm me-1"
                            onclick="setExample('L1153733')">L1153733</button>
                        <button class="btn btn-outline-secondary btn-sm me-1"
                            onclick="setExample('L1153733')">L1153733</button>
                    </div>
                    <div class="col-md-3">
                        <span class="me-2">فعل:</span><br>
                        <button class="btn btn-outline-secondary btn-sm me-1"
                            onclick="setExample('L1460479')">L1460479</button>
                        <button class="btn btn-outline-secondary btn-sm me-1"
                            onclick="setExample('L12100')">L12100</button>
                        <button class="btn btn-outline-secondary btn-sm me-1"
                            onclick="setExample('L1235177')">L1235177</button>
                        <button class="btn btn-outline-secondary btn-sm me-1"
                            onclick="setExample('L1464180')">L1464180</button>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
            </div>
        </div>
    </div>
</div>
<div class="container-fluid my-4">

    <div class="row">
        <div class="col-md-4">
            <h1 class="mb-4" id="header_main">
                تحليل:
                <a href="#" target="_blank" class="text-primary font-weight-bold" id="lemma_link"></a>
                <!-- <span id="lemma_link_en"></span> -->
            </h1>
        </div>
        <div class="col-md-8">
            <button class="btn btn-outline-primary" data-bs-target="#exampleModalToggle" data-bs-toggle="modal">أمثلة</button>
        </div>
    </div>
    <div class="row">
        <div class="col-md-4">
            <div class="input-group mb-3">
                <input type="text" id="lexemeId" class="form-control" placeholder="أدخل معرف مثل L1467242"
                    value="L1467242">
                <button class="btn btn-primary" onclick="start_lexeme_wrap()">تحميل</button>
            </div>
        </div>
    </div>
    <div id="errors"></div>
    <div id="output"></div>

</div>
<script src="{{ url_for('static', filename='js/lex/find_labels.js') }}"></script>
<script src="{{ url_for('static', filename='js/lex/data.js') }}"></script>
<script src="{{ url_for('static', filename='js/table_filter.js') }}"></script>
<script src="{{ url_for('static', filename='js/lex/toggle_table.js') }}"></script>
<script src="{{ url_for('static', filename='js/lex/fetch.js') }}"></script>
<script src="{{ url_for('static', filename='js/lex/lex.js') }}"></script>
<script src="{{ url_for('static', filename='js/lex/lex_page_claims.js') }}"></script>
<script src="{{ url_for('static', filename='js/lex/lex_page.js') }}"></script>

<script>
    async function start_lexeme_wrap() {
        const id = document.getElementById("lexemeId").value.trim();
        if (!id) return;
        await start_lexeme(id);
        await table_toggle();
        await find_labels();
    }
    async function setExample(lexeme) {
        document.getElementById('lexemeId').value = lexeme;
        await start_lexeme(lexeme);
        await table_toggle();
        await find_labels();
    }

    $(document).ready(async function() {
        // if ?lex=324 in url then load it setExample
        const urlParams = new URLSearchParams(window.location.search);
        const lex = urlParams.get('lex') || urlParams.get('wd_id');
        if (lex) {
            await setExample(lex);
        }
        // load_search(setExample, 'wikidatasearch', 'autocomplete-results');

    });
</script>

{% endblock %}
