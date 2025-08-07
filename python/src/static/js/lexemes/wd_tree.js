
const treeContainer = document.getElementById("tree");

let treeDataWD = [];

async function most_used_properties(data_source) {
    // ---
    let query = most_used_properties_query(data_source);
    // ---
    let result = await loadsparqlQuery(query, no_time = true);
    // ---
    return result;
}

async function find_wd_result(to_group_by = "categoryLabel", data_source = "all", limit = 100) {
    // ---
    let sparqlQuery = wg_tree_query(data_source, to_group_by, limit);
    // ---
    add_sparql_url(sparqlQuery);
    // ---
    let result = await loadsparqlQuery(sparqlQuery);

    let wd_result = {};

    for (const item of result) {
        let to_group = item[to_group_by] || 'غير محدد';

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

function renderTree(data, all_open) {
    treeContainer.innerHTML = "";
    // ---
    HandelDataError(data);
    // ---
    if (!data.length) {
        return;
    }
    // ---
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
        // ---
        let label = category.group_by;
        // ---
        if (label !== "" && (label.match(/Q\d+/) || label.match(/L\d+/))) {
            label = `<span find-label="${label}" find-label-both="true">${label}</span>`;
        }
        // ---
        // محتوى الزر عند الإنشاء
        button.innerHTML = `
            <span class="fw-medium text-black">
                ${label}
            </span>
            <span class="text-muted ms-2">
                (${category.items.length})
            </span>
            <i class="bi bi-chevron-double-left arrow-icon"></i>
        `;


        const ul = document.createElement("ul");

        const d_class = (data.length === 1 || all_open) ? '' : "d-none";

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

async function fetchData(limit, data_source, group_by) {
    // ---
    const treeMap = await find_wd_result(group_by, data_source, limit);

    // count all items.length in wd_result
    let count = Object.values(treeMap).reduce((sum, obj) => sum + obj.items.length, 0);

    // add total to the page
    document.getElementById("total").textContent = `(${count})`;

    treeDataWD = Object.values(treeMap);
    renderTree(treeDataWD);
}

async function add_options_to_select(data_source, group_by) {
    let select = document.getElementById('group_by');
    // ---
    let data = await most_used_properties(data_source);
    // ---
    // console.log(data);
    // { "prop": "P5238", "propLabel": "يجمع بين وحدات معجمية", "usage": "10463" }
    // ---
    for (let i = 0; i < data.length; i++) {
        let option = document.createElement('option');
        option.value = data[i].prop;
        option.text = `${data[i].propLabel} (${data[i].usage})`;
        select.appendChild(option);
    }
    // ---
    $("#group_by").val(group_by);
}

async function loadfetchData() {
    // ---
    treeContainer.innerHTML = "";
    showLoading();
    // ---
    let group_by = get_param_from_window_location("group_by", "P31Label")
    let custom_group_by = get_param_from_window_location("custom_group_by", "")
    let limit = get_param_from_window_location("limit", 100)
    let data_source = get_param_from_window_location("data_source", "all");
    // ---
    // let group_by_item = document.getElementById('group_by');
    // if (group_by_item) group_by_item.value = group_by;
    // ---
    $("#limit").val(limit);
    $("#data_source").val(data_source);
    // ---
    if (custom_group_by !== "" && group_by === "custom") {
        $("#custom_group_by").val(custom_group_by);
        group_by = custom_group_by;
        document.getElementById('custom_group_by').style.display = 'block';
    }
    // ---
    // await add_options_to_select(data_source, group_by);
    // await fetchData(limit, data_source, group_by);
    // ---
    await Promise.all([
        add_options_to_select(data_source, group_by),
        fetchData(limit, data_source, group_by)
    ]);
    // ---
    await find_labels();
}

function toggleCustomInput() {
    let select = document.getElementById('group_by');
    const customInput = document.getElementById('custom_group_by');
    if (select.value === 'custom') {
        customInput.style.display = 'block';
    } else {
        customInput.style.display = 'none';
    }
}

async function load_tree() {

    const search_Input = document.getElementById("searchInput");
    // ---
    search_Input.addEventListener("input", e => {
        const term = e.target.value;
        const filtered = filterTreeData(term);
        renderTree(filtered, true);
    });
    // ---
    await loadfetchData();
    // ---
    toggleCustomInput();
    // ---
}
