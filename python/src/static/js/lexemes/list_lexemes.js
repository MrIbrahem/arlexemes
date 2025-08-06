
const loadingEl = document.getElementById("loading");
const errorEl = document.getElementById("error");
const noResultsEl = document.getElementById("noResults");

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

    let wd_result = parse_results(result);

    return wd_result;
}

function showLoading() {
    loadingEl.classList.remove("d-none"); // Bootstrap 5: use d-none for hidden
    errorEl.classList.add("d-none");     // Bootstrap 5: use d-none for hidden
    noResultsEl.classList.add("d-none"); // Bootstrap 5: use d-none for hidden
}

function make_switch_nav(title, count, n) {
    let active = n == 1 ? "active" : "";
    // ---
    let badge_explain = "";
    let badge = "";
    // ---
    if (["اسم", "فعل", "صفة"].includes(title)) {
        badge = `
        <span class="position-absolute top-5 start-90 translate-middle p-1 bg-danger border border-light rounded-circle">
            <span class="visually-hidden">New alerts</span>
        </span>`;
        badge_explain = `
        <div class="alert alert-warning alert-dismissible fade show" role="alert">
            <span class="visually-hidden">New alerts</span>
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
             انقر على الكلمة لعرض جدول التصريفات
        </div>
        `
    }
    // ---
    let li = `
        <li class="nav-item" role="presentation">
            <button class="nav-link ${active} position-relative" id="hometab_${n}" data-bs-toggle="tab"
                data-bs-target="#home-tab-pane_${n}" type="button" role="tab" aria-controls="home-tab-pane_${n}"
                aria-selected="true">
                    ${title} (${count})
                    ${badge}
                </button>
        </li>
    `;
    $("#myTab").append(li);

    let div = `
        <div class="tab-pane fade show ${active}" id="home-tab-pane_${n}" role="tabpanel"
            aria-labelledby="hometab_${n}" tabindex="${n}">
            ${badge_explain}
            <div class="row" id="card_${n}">
            </div>
        </div>
    `;
    $("#myTabContent").append(div);
    // ---
    return "card_" + n
}

function renderTree(data) {
    loadingEl.classList.add("d-none"); // Bootstrap 5: use d-none for hidden

    if (!data.length) {
        noResultsEl.classList.remove("d-none"); // Bootstrap 5: use d-none for hidden
        return;
    }
    noResultsEl.classList.add("d-none"); // Bootstrap 5: use d-none for hidden
    let cat_number = 0;

    data.forEach(category => {
        // ---
        cat_number++;
        // ---
        var div_id = make_switch_nav(category.group_by, category.items.length, cat_number);
        // ---
        let to_lex = ["Q24905", "Q34698", "Q1084"];
        // ---
        if (!to_lex.includes(category.qid)) {
            // sort items by arabic alphabet
            category.items.sort(function (a, b) {
                return a.lemma.localeCompare(b.lemma);
            });
        }
        // ---
        category.items.forEach(item => {
            let href = `lex.php?lex=${item.item}`;
            let lemma = `${item.lemma} (${item.count})`;
            // ---
            if (!to_lex.includes(item.category)) {
                href = `http://www.wikidata.org/entity/${item.item}`;
                lemma = (item.P31Label != "") ? `${item.lemma} (${item.P31Label})` : item.lemma;
            }
            // ---
            if (category.group_by == "أخرى") {
                lemma = (item.categoryLabel != "") ? `${item.lemma} (${item.categoryLabel})` : item.lemma;
            }
            // ---
            let divcol = `
                <div class="col-3">
                    <a class="list-group-item text-decoration-none mb-2" href="${href}" target="_blank">
                    ${lemma}
                    </a>
                </div>`
            // ---
            $("#" + div_id).append(divcol)

        });
    });
}

function get_param_from_window_location(key, defaultvalue) {
    // ---
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(key) || defaultvalue;
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
