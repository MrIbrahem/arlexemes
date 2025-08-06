

async function new_ar_lexemes(limit, data_source) {
    // ---
    let VALUES = ``;
    // ---
    // if data_source match Q\d+
    if (data_source !== "" && data_source.match(/Q\d+/)) {
        VALUES = `VALUES ?category { wd:${data_source} }`;
    }
    // ---
    let limit_line = ` LIMIT 100 `;
    // ---
    if (limit && isFinite(limit)) {
        limit_line = ` LIMIT ${limit} `;
    }
    // ---
    let sparqlQuery = `
        SELECT
        ?item
        (SAMPLE(?lemma1) AS ?lemma)
        (GROUP_CONCAT(DISTINCT ?lemma1; separator=" / ") AS ?lemmas)
        ?category ?categoryLabel
        ?P31 ?P31Label
        (COUNT(?form) AS ?count)
        WHERE {
            ${VALUES}
            {
                SELECT ?item
                WHERE {
                ?item rdf:type ontolex:LexicalEntry ;
                        dct:language wd:Q13955 .
                }
                ORDER BY DESC(xsd:integer(STRAFTER(STR(?item), "/entity/L")))
                ${limit_line}
            }

        ?item wikibase:lemma ?lemma1 ;
            wikibase:lexicalCategory ?category .
        OPTIONAL { ?item ontolex:lexicalForm ?form }
        OPTIONAL { ?item wdt:P31 ?P31 }
        SERVICE wikibase:label { bd:serviceParam wikibase:language "ar,en". }
        }
        GROUP BY ?item ?category ?categoryLabel ?P31 ?P31Label
    `;
    // ---
    add_sparql_url(sparqlQuery);
    // ---
    let result = await loadsparqlQuery(sparqlQuery);

    let wd_result = parse_results(result);

    return wd_result;
}

async function fetchNewData(limit, data_source) {
    // ---
    let treeMap = await new_ar_lexemes(limit, data_source);

    treeMap = slice_data(treeMap);

    // count all items.length in wd_result
    let count = Object.values(treeMap).reduce((sum, obj) => sum + obj.items.length, 0);

    // add total to the page
    document.getElementById("total").textContent = `الإجمالي: (${count})`;

    treeData = Object.values(treeMap);
    renderTree(treeData);
}

function loadfetchData() {
    // ---
    showLoading();
    // ---
    let limit = get_param_from_window_location("limit", 100);
    let data_source = get_param_from_window_location("data_source", "all");
    let custom_data_source = get_param_from_window_location("custom_data_source", "");
    // ---
    // document.getElementById('custom_data_source').value = custom_data_source;
    // ---
    $("#limit").val(limit);
    $("#data_source").val(data_source);
    // ---
    if (custom_data_source !== "" && data_source === "custom") {
        $("#custom_data_source").val(custom_data_source);
        data_source = custom_data_source;
        document.getElementById('custom_data_source').style.display = 'block';
    }
    // ---
    fetchNewData(limit, data_source);
}

function toggleCustomInput() {
    let select = document.getElementById('data_source');
    const customInput = document.getElementById('custom_data_source');
    if (select.value === 'custom') {
        customInput.style.display = 'block';
    } else {
        customInput.style.display = 'none';
    }
}

async function load_new() {
    // ---
    loadfetchData();
    // ---
    toggleCustomInput();
}
