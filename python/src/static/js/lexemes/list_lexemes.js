
let treeData = [];

async function make_wd_result_for_list(limit, data_source, sort_by) {
    const sparqlQuery1 = `
        VALUES ?category {
            wd:Q111029	# جذر
            wd:Q1084	# اسم
            wd:Q24905	# فعل
            wd:Q34698	# صفة
        }
    `;
    // ---
    let VALUES = ``;
    // ---
    // if data_source match Q\d+
    if (data_source !== "" && data_source.match(/Q\d+/)) {
        VALUES = `VALUES ?category { wd:${data_source} }`;
    }
    // ---
    let ORDER = "ORDER BY DESC(?count)";
    // ---
    if (sort_by === "id") {
        ORDER = "ORDER BY DESC(xsd:integer(STRAFTER(STR(?item), '/entity/L')))";
    }
    // ---
    let sparqlQuery = `
        SELECT DISTINCT
            ?item
            (SAMPLE(?lemma1) AS ?lemma)
            (GROUP_CONCAT(DISTINCT ?lemma1; separator=' / ') AS ?lemmas)
            ?category ?categoryLabel
            ?P31 ?P31Label
            (count(?form) as ?count)
        WHERE {
            ${VALUES}
            ?item rdf:type ontolex:LexicalEntry;
                wikibase:lemma ?lemma1;
                wikibase:lexicalCategory ?category;
                dct:language wd:Q13955.

            optional {?item ontolex:lexicalForm ?form}
            optional {?item wdt:P31 ?P31}
            SERVICE wikibase:label { bd:serviceParam wikibase:language "ar, en". }
        }
        group by ?item ?category ?categoryLabel ?P31 ?P31Label
        ${ORDER}
    `;
    if (limit && isFinite(limit)) {
        sparqlQuery += ` LIMIT ${limit} `;
    }
    // ---
    add_sparql_url(sparqlQuery);
    // ---
    let result = await loadsparqlQuery(sparqlQuery);

    let wd_result = parse_results_group_by(result);

    return wd_result;
}

async function fetchListData(limit, data_source, sort_by) {
    // ---
    let treeMap = await make_wd_result_for_list(limit, data_source, sort_by);

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
    fetchListData(limit, data_source);
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
async function load_list() {
    // ---
    loadfetchData();
    // ---
    toggleCustomInput();
    // ---
}
