
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

async function loadsparqlQuery(sparqlQuery) {

    const data = await _loadsparqlQuery(sparqlQuery);
    // ---
    if (data) {
        return parse_sparql_results(data);
    }
    // ---
    return {};
}
