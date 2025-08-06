
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
