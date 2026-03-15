let treeData = [];
let currentPage = 1;
let currentLimit = 1000;
let currentDataSource = "all";
let currentPageType = "list"; // track whether we're on 'list' or 'new'


function slice_data(wd_result) {

    // تحويل الكائن إلى مصفوفة وترتيبها حسب عدد العناصر في كل مجموعة
    let grouped = Object.values(wd_result).sort((a, b) => b.items.length - a.items.length);

    // أخذ أول 10 فقط
    let top10 = grouped.slice(0, 10);

    // الباقي
    let others = grouped.slice(10);

    // إعادة بناء الكائن الجديد
    let new_wd_result = {};

    // إدراج العشرة الأوائل
    for (const group of top10) {
        new_wd_result[group.group_by] = group;
    }

    // دمج الباقي في مجموعة "أخرى"
    if (others.length > 0) {
        new_wd_result["أخرى"] = {
            group_by: "أخرى",
            qid: "",
            items: others.flatMap(group => group.items)
        };
    }

    return new_wd_result;
}

function add_sparql_url(sparqlQuery) {
    // ---
    let sparql_url = $("#sparql_url");
    // ---
    if (sparql_url) {
        var url1 = "https://query.wikidata.org/index.html#" + encodeURIComponent(sparqlQuery)
        // ---
        sparql_url.attr("href", url1);
        // remove disabled from class
        sparql_url.removeClass("disabled");
    }
    // ---
}

function parse_results_group_by(result) {
    let wd_result = {};

    for (const item of result) {
        // console.table(item);
        // { "item": "L1478434", "lemmas": "شَنْق", "category": "Q1084", "categoryLabel": "اسم", "P31": "", "P31Label": "", "count": "12" }
        let to_group = item['categoryLabel'] || '!';

        if (!wd_result[to_group]) {
            // ---
            wd_result[to_group] = {
                group_by: to_group,
                qid: item['category'],
                items: []
            };
        }
        // ---
        wd_result[to_group].items.push(item);
    }
    // ---
    wd_result = Object.fromEntries(Object.entries(wd_result).sort(([, a], [, b]) => b.items.length - a.items.length));
    // ---
    return wd_result;
}

function parse_sparql_results(result) {
    let vars = result.head.vars;

    const items = result.results.bindings;

    let wd_result = [];

    for (const item of items) {
        // value of all item keys from vars
        let new_item = {};
        for (const key of vars) {
            let value = item[key]?.value ?? '';
            // if value has /entity/ then value = value.split("/").pop();
            if (value.includes("/entity/")) {
                value = value.split("/").pop();
            }
            new_item[key] = value;
        }
        // ---
        wd_result.push(new_item);
    }
    // ---
    return wd_result;
}

async function _loadsparqlQuery(sparqlQuery) {

    const endpoint = 'https://query.wikidata.org/sparql';
    const fullUrl = endpoint + '?format=json&query=' + encodeURIComponent(sparqlQuery);
    const headers = { 'Accept': 'application/sparql-results+json' };
    let data;
    try {
        const response = await fetch(fullUrl, { headers });
        data = await response.json();
    } catch (e) {
        console.error(`catch: `, e);
        return {};
    }
    if (typeof data === 'object' && data !== null) {
        return data;
    } else {
        console.error(`loadsparqlQuery: `, data);
        return {};
    }
}

async function loadsparqlQuery(sparqlQuery, notime = false) {
    // ---
    let start_time = performance.now();
    // ---
    const data = await _loadsparqlQuery(sparqlQuery);
    // ---
    let end_time = performance.now();
    // ---
    let query_time = (end_time - start_time) / 1000;
    // ---
    if (!notime) {
        $('#query_time').text('(' + query_time.toFixed(3) + ' ث)');
    }
    // ---
    if (!data) {
        return {};
    }
    // ---
    return parse_sparql_results(data);

}

function get_param_from_window_location(key, defaultvalue) {
    // ---
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(key) || defaultvalue;
}

function Loading() {

    document.getElementById("myTab").innerHTML = `
        <li class="nav-item nav-link position-relative fw-bold">
            <span id="total"></span>
        </li>
        `;
    document.getElementById("myTabContent").innerHTML = "";
    document.getElementById("tree").innerHTML = "";

    document.getElementById("loading").classList.remove("d-none"); // Bootstrap 5: use d-none for hidden
    document.getElementById("error").classList.add("d-none");     // Bootstrap 5: use d-none for hidden
    document.getElementById("noResults").classList.add("d-none"); // Bootstrap 5: use d-none for hidden
}


function hideLoading() {
    document.getElementById("loading").classList.add("d-none");
}

function HandelDataError(data) {
    // ---
    hideLoading();
    // ---
    let noResults = document.getElementById("noResults");
    // ---
    if (noResults) {
        // ---
        if (!data.length) {
            noResults.classList.remove("d-none"); // Bootstrap 5: use d-none for hidden
            return;
        } else {
            noResults.classList.add("d-none"); // Bootstrap 5: use d-none for hidden
        }
    }
    // ---
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
    // ---
    HandelDataError(data);
    // ---
    if (!data.length) {
        return;
    }
    // ---
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
            let href = `lex/lex=${item.item}`;
            let lemma = `${item.lemma} (${item.count})`;
            // ---
            let P31Label = item?.P31Label || "";
            // ---
            if (!to_lex.includes(item.category)) {
                href = `http://www.wikidata.org/entity/${item.item}`;
                lemma = (P31Label != "") ? `${item.lemma} (${P31Label})` : item.lemma;
            }
            // ---
            if (category.group_by == "أخرى") {
                lemma = (item.categoryLabel != "") ? `${item.lemma} (${item.categoryLabel})` : item.lemma;
            }
            // ---
            if (to_lex.includes(item.category) && P31Label != "") {
                lemma = `<span title="P31: ${P31Label}">${lemma}</span>`;
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

function new_ar_lexemes_query(data_source, limit, offset) {
    // ---
    let VALUES = ``;
    // ---
    // if data_source match Q\d+
    if (data_source !== "" && data_source.match(/Q\d+/)) {
        VALUES = `VALUES ?category { wd:${data_source} }`;
    }
    // ---
    let limit_line = ` LIMIT 1000 `;
    // ---
    if (limit && isFinite(limit)) {
        limit_line = ` LIMIT ${limit} `;
    }
    // ---
    if (offset && isFinite(offset)) {
        limit_line += ` OFFSET ${offset} `;
    }
    // ---
    let sparqlQuery = `
        SELECT
            ?item
            (GROUP_CONCAT(DISTINCT ?lemma1; SEPARATOR = " / ") AS ?lemma)
            ?category
            ?categoryLabel
            (SAMPLE(?P31) AS ?P31)
            (SAMPLE(?P31Label) AS ?P31Label)
            (COUNT(?form) AS ?count)
            WHERE {
            {
                SELECT *
                WHERE {
                    ${VALUES}
                    ?item dct:language wd:Q13955.
                    hint:Prior hint:rangeSafe "true"^^xsd:boolean.
                    ?item wikibase:lexicalCategory ?category.
                }
                ORDER BY DESC (xsd:integer(STRAFTER(STR(?item), "/entity/L")))
                ${limit_line}
            }
            OPTIONAL { ?item wikibase:lemma ?lemma1. }
            OPTIONAL { ?item ontolex:lexicalForm ?form. }
            OPTIONAL { ?item wdt:P31 ?P31. }
            SERVICE wikibase:label { bd:serviceParam wikibase:language "ar,en". }
        }
        GROUP BY ?item ?category ?categoryLabel
        ORDER BY DESC (?item)
    `;
    // ---
    return sparqlQuery;
}


function list_lexemes_query(data_source, limit, offset) {
    // ---
    let VALUES = ``;
    // ---
    // if data_source match Q\d+
    if (data_source !== "" && data_source.match(/Q\d+/)) {
        VALUES = `VALUES ?category { wd:${data_source} }`;
    }
    // ---
    let limit_line = ` LIMIT 1000 `;
    // ---
    if (limit && isFinite(limit)) {
        limit_line = ` LIMIT ${limit} `;
    }
    // ---
    if (offset && isFinite(offset)) {
        limit_line += ` OFFSET ${offset} `;
    }
    // ---
    let sparqlQuery = `
        SELECT
            ?item
            (GROUP_CONCAT(DISTINCT ?lemma1; SEPARATOR = " / ") AS ?lemma)
            ?category
            ?categoryLabel
            ?P31Label
            (COUNT(?form) AS ?count)
            WHERE {
            {
                SELECT *
                WHERE {
                ${VALUES}
                ?item dct:language wd:Q13955.
                hint:Prior hint:rangeSafe "true"^^xsd:boolean.
                ?item wikibase:lexicalCategory ?category.
                }
                # ORDER BY DESC (xsd:integer(STRAFTER(STR(?item), "/entity/L")))
                ${limit_line}
            }
            OPTIONAL { ?item wikibase:lemma ?lemma1. }
            OPTIONAL { ?item ontolex:lexicalForm ?form. }
            OPTIONAL { ?item wdt:P31 ?P31. }
            SERVICE wikibase:label { bd:serviceParam wikibase:language "ar,en". }
            }
            GROUP BY ?item ?category ?categoryLabel ?P31Label
            ORDER BY DESC (?count)
    `;
    // ---
    return sparqlQuery;
}

async function make_wd_result_for_list(data_source, limit, offset) {
    let sparqlQuery;
    if (currentPageType === "new") {
        // Use the new lexemes query for the "new" page type
        sparqlQuery = new_ar_lexemes_query(data_source, limit, offset);
    } else {
        // Use the list lexemes query for the "list" page type
        sparqlQuery = list_lexemes_query(data_source, limit, offset);
    }
    add_sparql_url(sparqlQuery);

    let result = await loadsparqlQuery(sparqlQuery);

    let wd_result = parse_results_group_by(result);

    return wd_result;
}

async function fetchListData(data_source, limit, page) {

    let offset = (page - 1) * limit;

    let treeMap = await make_wd_result_for_list(data_source, limit, offset);

    treeMap = slice_data(treeMap);

    // count all items.length in wd_result
    let count = Object.values(treeMap).reduce((sum, obj) => sum + obj.items.length, 0);

    // add total to the page
    document.getElementById("total").textContent = `الإجمالي: (${count})`;

    treeData = Object.values(treeMap);
    renderTree(treeData);

    // Update pagination controls
    updatePaginationControls(page, limit, count);
}

function loadfetchData() {

    Loading();

    let limit = parseInt(get_param_from_window_location("limit", 100));
    let data_source = get_param_from_window_location("data_source", "all");
    let custom_data_source = get_param_from_window_location("custom_data_source", "");
    let page = parseInt(get_param_from_window_location("page", 1));

    // document.getElementById('custom_data_source').value = custom_data_source;

    $("#limit").val(limit);
    $("#data_source").val(data_source);

    if (custom_data_source !== "" && data_source === "custom") {
        $("#custom_data_source").val(custom_data_source);
        data_source = custom_data_source;
        document.getElementById('custom_data_source').style.display = 'block';
    }

    // Store current state
    currentPage = page;
    currentLimit = limit;
    currentDataSource = data_source;

    fetchListData(currentDataSource, currentLimit, currentPage);
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
function updatePaginationControls(page, limit, count) {
    // Show or hide pagination based on whether we got full results
    const paginationDiv = document.getElementById("pagination_controls");
    if (!paginationDiv) return;

    const prevBtn = document.getElementById("prev_page");
    const nextBtn = document.getElementById("next_page");
    // Only show pagination if we got results equal to limit (suggesting more pages exist)
    if (count < limit && page === 1) {
        prevBtn.classList.add('d-none');
        nextBtn.classList.add('d-none');
        return;
    }

    // paginationDiv.classList.remove('d-none');
    // paginationDiv.classList.add('d-flex');

    // Update page info
    // document.getElementById("page_info").textContent = `الصفحة ${page}`;

    // Enable/disable previous button
    if (page <= 1) {
        prevBtn.classList.add('disabled');
        prevBtn.setAttribute('disabled', 'disabled');
    } else {
        prevBtn.classList.remove('disabled');
        prevBtn.removeAttribute('disabled');
    }

    // Enable/disable next button based on whether we got full results
    if (count < limit) {
        nextBtn.classList.add('disabled');
        nextBtn.setAttribute('disabled', 'disabled');
    } else {
        nextBtn.classList.remove('disabled');
        nextBtn.removeAttribute('disabled');
    }
}

function navigateToPage(page) {
    // update current state and fetch via AJAX
    currentPage = page;
    Loading();
    fetchListData(currentDataSource, currentLimit, currentPage);
}

function previousPage() {
    if (currentPage > 1) {
        navigateToPage(currentPage - 1);
    }
}

function nextPage() {
    navigateToPage(currentPage + 1);
}

async function load_list(page_type = "list") {
    currentPageType = page_type;
    loadfetchData();
    toggleCustomInput();

}
