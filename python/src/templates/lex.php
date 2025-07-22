{% extends "main.php" %}
{% block title %}
<title>المفردات العربية</title>
{% endblock %}

{% block content2 %}

<div>
    <div class="container-fluid">

        <div class="row">
            <div class="col-md-4">
                <h1 class="mb-4" id="header_main">
                    تحليل:
                    <a href="#" target="_blank" class="text-primary font-weight-bold" id="lemma_link"></a>
                    <!-- <span id="lemma_link_en"></span> -->
                </h1>
            </div>
            <div class="col-md-4">
                <div class="input-group mb-3">
                    <input type="text" id="lexemeId" class="form-control" placeholder="أدخل معرف مثل L1467242"
                        value="L1467242">
                    <button class="btn btn-primary" onclick="start_lexeme()">تحميل</button>
                </div>
            </div>
        </div>
        <div id="errors"></div>
        <div id="output"></div>

    </div>
</div>
<script src="{{ url_for('static', filename='lex/find_labels.js') }}"></script>
<script src="{{ url_for('static', filename='lex/data.js') }}"></script>
<script src="{{ url_for('static', filename='table_filter.js') }}"></script>
<script src="{{ url_for('static', filename='lex/toggle_table.js') }}"></script>
<script src="{{ url_for('static', filename='lex/fetch.js') }}"></script>
<script src="{{ url_for('static', filename='lex/lex.js') }}"></script>
<script src="{{ url_for('static', filename='lex/lex_page_claims.js') }}"></script>
<script src="{{ url_for('static', filename='lex/lex_page.js') }}"></script>
<div>
    <!-- to compare -->
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

        $(document).ready(async function () {
            // if ?lex=324 in url then load it setExample
            const urlParams = new URLSearchParams(window.location.search);
            const lex = urlParams.get('lex') || urlParams.get('wd_id');
            if (lex) {
                await setExample(lex);
            }
            load_search(setExample);

        });
    </script>
</div>

{% endblock %}
