
const treeContainer = document.getElementById("tree");
const searchInput = document.getElementById("searchInput");
const loadingEl = document.getElementById("loading");
const errorEl = document.getElementById("error");
const errorMessageEl = document.getElementById("errorMessage");
const noResultsEl = document.getElementById("noResults");

let treeData = [];

async function loadsparqlQuery(sparqlQuery) {

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

async function get_wd_result(to_group_by = "categoryLabel") {
    const sparqlQuery = `
        SELECT ?item ?lemma ?category ?categoryLabel ?P31Label ?P6771 ?P11038 ?P11757 ?P12451 WHERE {
        ?item rdf:type ontolex:LexicalEntry;
            wikibase:lemma ?lemma;
            wikibase:lexicalCategory ?category;
            dct:language wd:Q13955.
        SERVICE wikibase:label { bd:serviceParam wikibase:language "ar". }
        OPTIONAL { ?item wdt:P31 ?P31. }
        OPTIONAL { ?item wdt:P6771 ?P6771. }
        OPTIONAL { ?item wdt:P11038 ?P11038. }
        OPTIONAL { ?item wdt:P11757 ?P11757. }
        OPTIONAL { ?item wdt:P12451 ?P12451. }
        }
        limit 100
    `;

    let result = await loadsparqlQuery(sparqlQuery);
    let vars = result.head.vars;

    // console.table(vars);

    const items = result.results.bindings;
    let wd_result = {};
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
        let to_group = new_item[to_group_by] || '!';

        if (!wd_result[to_group]) {
            // ---
            wd_result[to_group] = {
                group_by: to_group,
                items: []
            };
        }
        // ---
        wd_result[to_group].items.push(new_item);

    }
    // ---
    // sort wd_result keys by values length
    wd_result = Object.fromEntries(Object.entries(wd_result).sort(([, a], [, b]) => b.items.length - a.items.length));
    // ---
    return wd_result;
}

function showLoading() {
    treeContainer.innerHTML = "";
    loadingEl.classList.remove("d-none"); // Bootstrap 5: use d-none for hidden
    errorEl.classList.add("d-none");     // Bootstrap 5: use d-none for hidden
    noResultsEl.classList.add("d-none"); // Bootstrap 5: use d-none for hidden
}

function renderTree(data) {
    loadingEl.classList.add("d-none"); // Bootstrap 5: use d-none for hidden
    treeContainer.innerHTML = "";

    if (!data.length) {
        noResultsEl.classList.remove("d-none"); // Bootstrap 5: use d-none for hidden
        return;
    }

    noResultsEl.classList.add("d-none"); // Bootstrap 5: use d-none for hidden

    data.forEach(category => {
        const li = document.createElement("li");
        // Adjusted classes for Bootstrap 5 list group items and styling
        li.className = "list-group-item border-start border-primary border-4 ps-3 mb-2";

        const button = document.createElement("button");
        // Adjusted classes for Bootstrap 5 buttons and flex utilities
        button.className = "btn btn-sm btn-link text-decoration-none d-flex justify-content-between align-items-center w-100 text-end pe-0";
        button.onclick = () => {
            const ul = li.querySelector("ul");
            ul.classList.toggle("d-none"); // Bootstrap 5: use d-none for hidden
            const icon = li.querySelector(".arrow-icon");
            icon.classList.toggle("rotate-180"); // Keep custom class for rotation
        };

        button.innerHTML = `
                <span class="fw-medium text-black">${category.group_by}</span>
                <span class="text-muted ms-2">(${category.items.length})</span>
                <span class="arrow-icon transform transition-transform duration-200 text-black">&#9660;</span>
            `;

        const ul = document.createElement("ul");
        // Adjusted classes for Bootstrap 5 list group and styling
        ul.className = "list-group list-group-flush mt-2 pe-4 border-end border-dashed border-secondary text-end d-none"; // d-none for hidden initially

        category.items.forEach(item => {
            const liItem = document.createElement("li");
            // Adjusted classes for Bootstrap 5 list group items
            liItem.className = "list-group-item bg-light px-3 py-2 rounded hover:bg-info hover:bg-opacity-10 cursor-pointer transition-colors";

            const a = document.createElement("a");
            a.href = `https://www.wikidata.org/wiki/Lexeme:${item.item}`;
            a.target = "_blank";
            a.rel = "noopener noreferrer";
            // Bootstrap 5: block link class
            a.className = "d-block w-100 h-100 text-decoration-none text-body";
            a.textContent = `${item.lemma} (${item.item})`;

            liItem.appendChild(a);
            ul.appendChild(liItem);
        });

        li.appendChild(button);
        li.appendChild(ul);
        treeContainer.appendChild(li);
    });
}

function filterTreeData(term) {
    return treeData.map(cat => ({
        ...cat,
        items: cat.items.filter(item =>
            item.lemma.toLowerCase().includes(term.toLowerCase())
        )
    }));
}

function get_param_from_window_location(key, defaultvalue) {
    // ---
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(key) || defaultvalue;
}
async function fetchData() {
    showLoading();
    let group_by = get_param_from_window_location("group_by", "P31Label")

    document.getElementById('group_by').value = group_by;

    const treeMap = await get_wd_result(group_by);

    // count all items.length in wd_result
    let count = Object.values(treeMap).reduce((sum, obj) => sum + obj.items.length, 0);

    // add total to the page
    document.getElementById("total").textContent = `(${count})`;

    treeData = Object.values(treeMap);
    renderTree(treeData);
}

searchInput.addEventListener("input", e => {
    const term = e.target.value;
    const filtered = filterTreeData(term);
    renderTree(filtered);
});
