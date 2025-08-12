{% extends "main.php" %}
{% block title %}
<title>المفردات العربية</title>
{% endblock %}

{% block content %}


<div class="container-fluid my-4">
    <div id="errors"></div>
    <div id="output"></div>

</div>
<script src="/static/js/lex/find_labels.js"></script>
<script src="/static/js/lex/data.js"></script>
<script src="/static/js/table_filter2.js"></script>
<script src="/static/js/lex/toggle_table.js"></script>
<script src="/static/js/lex/fetch.js"></script>
<script src="/static/js/lex/lex_data.js"></script>
<script src="/static/js/lex/lex_example.js"></script>
<script src="/static/js/lex/lex.js"></script>
<script src="/static/js/lex/lex_page_claims.js"></script>
<script src="/static/js/lex/lex_page.js"></script>

<script>
    async function setExample(lexeme) {
        // document.getElementById('lexemeId').value = lexeme;
        await start_lexeme(lexeme, no_head = true);
        await find_labels();
        await loadReferencesAfterPageLoad();
    }

    $(document).ready(async function() {
        $("#main_navbar").hide();
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
