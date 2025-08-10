{% extends "main.php" %}
{% block title %}
<title>المفردات العربية</title>
{% endblock %}

{% block content %}


<div class="modal fade" id="modal_div" tabindex="-1" role="dialog" aria-labelledby="modal_1" aria-hidden="true">
    <div class="modal-dialog" role="document">
        <div class="modal-content">
            <div class="modal-header">
                <h6 class="modal-title" id="modal_1"></h6>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
                {{ examples_block() }}
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" type="button" data-bs-dismiss="modal">Cancel</button>
            </div>
        </div>
    </div>
</div>
<div class="container-fluid my-4">

    <div class="row">
        <div class="col-md-5 col-sm-10">
            <div class="row">
                <div class="col-md-10 col-sm-9 mb-2 mb-md-0">
                    <span class="mb-4 h1" id="header_main">
                        تحليل:
                        <a href="#" target="_blank" class="text-primary font-weight-bold" id="lemma_link"></a>
                        <span id="lemma_link_en"></span>
                    </span>
                </div>
                <div class="col-md-2 col-sm-3 mb-2 mb-md-0">
                    <button type="button" class="btn btn-outline-primary" data-bs-toggle="modal"
                        data-bs-target="#modal_div">أمثلة</button>
                </div>
            </div>
        </div>
        <div class="col-md-1 col-sm-2 mb-2 mb-md-0">
            <button onclick="toggleHighlights()" class="btn btn-outline-secondary mb-2">
                🎨
            </button>
        </div>
        <div class="col-md-3">
            <div class="row">
                <div class="col-md-11">
                    <div class="input-group mb-2 mb-md-0">
                        <span class="input-group-text">ادخل معرف</span>
                        <input type="text" id="lexemeId" class="form-control" placeholder="مثل L1467242"
                            value="L1467242">
                    </div>
                    <div class="col-md-11">
                        <div class="d-flex justify-content-center">
                            <button class="btn btn-outline-primary w-75" onclick="start_lexeme_wrap()">تحميل</button>
                        </div>
                    </div>
                </div>
            </div>
            <hr class="d-lg-none d-md-none text-dark-subtle text-50">
        </div>
        <div class="col-md-3">
            <div class="row">
                <div class="col-md-9">
                    <div class="input-group mb-2 mb-md-0">
                        <span class="input-group-text">التصنيف</span>
                        <select name="data_source" id="data_source" class="form-select d-inline-block">
                            <option value="Q34698">صفة</option>
                            <option value="Q24905">فعل</option>
                            <option value="Q1084">اسم</option>
                            <option value="Q111029">جذر</option>
                        </select>
                    </div>
                </div>
                <div class="col-md-9">
                    <div class="input-group">
                        <div class="autocomplete-container">
                            <input type="text" id="wikidatasearch" class="form-control" placeholder="اكتب للبحث..."
                                value="">
                            <div id="autocomplete-results" class="autocomplete-results"></div>
                        </div>
                    </div>
                </div>
                <div class="col-md-2">
                    <span id="autocomplete-loader" class="spinner-border spinner-border-sm inline-flex" role="status"
                        style="display:none;">
                        <span class="visually-hidden">جاري البحث...</span>
                    </span>
                </div>
            </div>
        </div>
    </div>
    <hr>
    <div id="errors"></div>
    <div id="output"></div>

</div>
<script src="{{ url_for('static', filename='js/lex/find_labels.js') }}"></script>
<script src="{{ url_for('static', filename='js/lex/data.js') }}"></script>
<script src="{{ url_for('static', filename='js/table_filter2.js') }}"></script>
<script src="{{ url_for('static', filename='js/lex/toggle_table.js') }}"></script>
<script src="{{ url_for('static', filename='js/lex/fetch.js') }}"></script>
<script src="{{ url_for('static', filename='js/lex/lex_data.js') }}"></script>
<script src="{{ url_for('static', filename='js/lex/lex2_sub.js') }}"></script>
<script src="{{ url_for('static', filename='js/lex/lex_example.js') }}"></script>
<script src="{{ url_for('static', filename='js/lex/lex2.js') }}"></script>
<script src="{{ url_for('static', filename='js/lex/lex_page_claims.js') }}"></script>
<script src="{{ url_for('static', filename='js/lex/lex_page.js') }}"></script>

<script>
    async function start_lexeme_wrap() {
        const id = document.getElementById("lexemeId").value.trim();
        if (!id) return;
        await start_lexeme(id);
        await find_labels();
        await loadReferencesAfterPageLoad();
    }
    async function setExample(lexeme) {
        document.getElementById('lexemeId').value = lexeme;
        await start_lexeme(lexeme);
        await find_labels();
        await loadReferencesAfterPageLoad();
    }

    $(document).ready(async function() {
        // if ?lex=324 in url then load it setExample
        const urlParams = new URLSearchParams(window.location.search);
        const lex = urlParams.get('lex') || urlParams.get('wd_id');
        if (lex) {
            await setExample(lex);
        }
        load_search(setExample, 'wikidatasearch', 'autocomplete-results');

    });
</script>

{% endblock %}
