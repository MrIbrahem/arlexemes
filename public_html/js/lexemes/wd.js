
const treeContainer = document.getElementById("tree");
const search_Input = document.getElementById("searchInput");
const loadingDiv = document.getElementById("loading");
const errorDiv = document.getElementById("error");
const errorMessageDiv = document.getElementById("errorMessage");
const noResultsDiv = document.getElementById("noResults");

let treeDataWD = [];

async function find_wd_result(to_group_by = "categoryLabel", limit = 100) {
    // ---
    let props_in = [
        "P31",
        "P6771",
        "P11038",
        "P11757",
        "P12451"
    ]
    // ---
    let add_group = "";
    let add_group_optional = "";
    // ---
    if (to_group_by.startsWith("P") && !props_in.includes(to_group_by) && to_group_by.match(/^P[0-9]+$/)) {
        to_group_by = to_group_by.replace("P", "");
        // if to_group_by is number
        add_group = `(GROUP_CONCAT(DISTINCT ?${to_group_by}_z; separator=", ") AS ?${to_group_by})`;
        add_group_optional = `OPTIONAL { ?item wdt:${to_group_by} ?${to_group_by}_z. }`;

    }
    // ---
    const sparqlQuery = `
        SELECT
            ?item
            (SAMPLE(?lemma1) AS ?lemma)
            (GROUP_CONCAT(DISTINCT ?lemma1; separator=' / ') AS ?lemmas)
            ?category ?categoryLabel ?P31Label
            (GROUP_CONCAT(DISTINCT ?P6771_z; separator=", ") AS ?P6771)
            (GROUP_CONCAT(DISTINCT ?P11038_z; separator=", ") AS ?P11038)
            (GROUP_CONCAT(DISTINCT ?P11757_z; separator=", ") AS ?P11757)
            (GROUP_CONCAT(DISTINCT ?P12451_z; separator=", ") AS ?P12451)
            ${add_group}
        WHERE {
            ?item rdf:type ontolex:LexicalEntry;
                wikibase:lemma ?lemma1;
                wikibase:lexicalCategory ?category;
                dct:language wd:Q13955.
            SERVICE wikibase:label { bd:serviceParam wikibase:language "ar,en". }
            OPTIONAL { ?item wdt:P31 ?P31. }
            OPTIONAL { ?item wdt:P6771 ?P6771_z. }
            OPTIONAL { ?item wdt:P11038 ?P11038_z. }
            OPTIONAL { ?item wdt:P11757 ?P11757_z. }
            OPTIONAL { ?item wdt:P12451 ?P12451_z. }
            ${add_group_optional}
        }
        GROUP BY ?item ?category ?categoryLabel ?P31Label
        limit ${limit}
    `;

    let result = await loadsparqlQuery(sparqlQuery);

    let wd_result = {};

    for (const item of result) {
        let to_group = item[to_group_by] || '!';

        if (!wd_result[to_group]) {
            // ---
            wd_result[to_group] = {
                group_by: to_group,
                items: []
            };
        }
        // ---
        wd_result[to_group].items.push(item);
    }
    // ---
    // sort wd_result keys by values length
    wd_result = Object.fromEntries(Object.entries(wd_result).sort(([, a], [, b]) => b.items.length - a.items.length));
    // ---
    return wd_result;
}

function showLoading() {
    treeContainer.innerHTML = "";
    loadingDiv.classList.remove("d-none"); // Bootstrap 5: use d-none for hidden
    errorDiv.classList.add("d-none");     // Bootstrap 5: use d-none for hidden
    noResultsDiv.classList.add("d-none"); // Bootstrap 5: use d-none for hidden
}

function renderTree(data, all_open) {
    loadingDiv.classList.add("d-none"); // Bootstrap 5: use d-none for hidden
    treeContainer.innerHTML = "";

    if (!data.length) {
        noResultsDiv.classList.remove("d-none"); // Bootstrap 5: use d-none for hidden
        return;
    }

    noResultsDiv.classList.add("d-none"); // Bootstrap 5: use d-none for hidden

    data.forEach((category, index) => {
        if (!category.items || category.items.length === 0) return;

        const li = document.createElement("li");
        // Adjusted classes for Bootstrap 5 list group items and styling
        li.className = "list-group-item border-start border-primary border-4 ps-3 mb-2";

        const button = document.createElement("button");
        // Adjusted classes for Bootstrap 5 buttons and flex utilities
        button.className = "btn btn-sm btn-link text-decoration-none d-flex justify-content-between align-items-center w-100 text-end pe-0";
        button.onclick = () => {
            const ul = li.querySelector("ul");
            const icon = li.querySelector(".arrow-icon");

            ul.classList.toggle("d-none"); // إخفاء أو إظهار القائمة

            // تبديل الأيقونة حسب الحالة
            const isOpen = !ul.classList.contains("d-none");
            icon.className = `bi ${isOpen ? "bi-chevron-double-down" : "bi-chevron-double-left"} arrow-icon`;
        };

        // محتوى الزر عند الإنشاء
        button.innerHTML = `
            <span class="fw-medium text-black">${category.group_by}</span>
            <span class="text-muted ms-2">(${category.items.length})</span>
            <i class="bi bi-chevron-double-left arrow-icon"></i>
        `;


        const ul = document.createElement("ul");

        const d_class = (data.length === 1 || all_open) ? '' : 'd-none';

        ul.className = `list-group list-group-flush mt-2 pe-4 border-end border-dashed border-secondary text-end ${d_class}`; // d-none for hidden initially

        category.items.forEach(item => {
            const liItem = document.createElement("li");
            // Adjusted classes for Bootstrap 5 list group items
            liItem.className = "list-group-item bg-light-subtle px-3 py-2 rounded hover:bg-info hover:bg-opacity-10 cursor-pointer transition-colors";

            const a = document.createElement("a");
            a.href = `https://www.wikidata.org/wiki/Lexeme:${item.item}`;
            a.target = "_blank";
            a.rel = "noopener noreferrer";
            // Bootstrap 5: block link class
            a.className = "d-block w-100 h-100 text-decoration-none text-body";
            // a.textContent = `${item.lemma} (${item.item})`;
            a.textContent = `${item.lemmas} (${item.item})`;

            liItem.appendChild(a);
            ul.appendChild(liItem);
        });

        li.appendChild(button);
        li.appendChild(ul);

        treeContainer.appendChild(li);
    });
}

function filterTreeData(term) {
    return treeDataWD.map(cat => ({
        ...cat,
        items: cat.items.filter(item =>
            item.lemma.toLowerCase().includes(term.toLowerCase()) || item.lemmas.toLowerCase().includes(term.toLowerCase())
        )
    }));
}

function get_param_from_window_location1(key, defaultvalue) {
    // ---
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(key) || defaultvalue;
}

async function fetchData(limit, group_by) {
    // ---
    const treeMap = await find_wd_result(group_by, limit);

    // count all items.length in wd_result
    let count = Object.values(treeMap).reduce((sum, obj) => sum + obj.items.length, 0);

    // add total to the page
    document.getElementById("total").textContent = `(${count})`;

    treeDataWD = Object.values(treeMap);
    renderTree(treeDataWD);
}

search_Input.addEventListener("input", e => {
    const term = e.target.value;
    const filtered = filterTreeData(term);
    renderTree(filtered, true);
});
