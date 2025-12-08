
let treeData = [];

async function make_wd_result_for_list(data_source, limit, offset) {

    let sparqlQuery = list_lexemes_query(data_source, limit, offset);
    // ---
    add_sparql_url(sparqlQuery);
    // ---
    let result = await loadsparqlQuery(sparqlQuery);

    let wd_result = parse_results_group_by(result);

    return wd_result;
}

async function fetchListData(data_source, limit, page) {
    // ---
    let offset = (page - 1) * limit;
    // ---
    let treeMap = await make_wd_result_for_list(data_source, limit, offset);

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
    let limit = parseInt(get_param_from_window_location("limit", 100));
    let data_source = get_param_from_window_location("data_source", "all");
    let custom_data_source = get_param_from_window_location("custom_data_source", "");
    let page = parseInt(get_param_from_window_location("page", 1));
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
    fetchListData(data_source, limit, page);
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
