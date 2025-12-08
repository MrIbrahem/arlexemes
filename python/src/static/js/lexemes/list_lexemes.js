
let treeData = [];
let currentPage = 1;
let currentLimit = 1000;
let currentDataSource = "all";

async function make_wd_result_for_list(limit, data_source, offset) {

    let sparqlQuery = list_lexemes_query(limit, data_source, offset);
    // ---
    add_sparql_url(sparqlQuery);
    // ---
    let result = await loadsparqlQuery(sparqlQuery);

    let wd_result = parse_results_group_by(result);

    return wd_result;
}

async function fetchListData(limit, data_source, page) {
    // ---
    let offset = (page - 1) * limit;
    let treeMap = await make_wd_result_for_list(limit, data_source, offset);

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
    // ---
    showLoading();
    // ---
    let limit = get_param_from_window_location("limit", 1000);
    let data_source = get_param_from_window_location("data_source", "all");
    let custom_data_source = get_param_from_window_location("custom_data_source", "");
    let page = get_param_from_window_location("page", 1);
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
    // Store current state
    currentPage = parseInt(page);
    currentLimit = parseInt(limit);
    currentDataSource = data_source;
    // ---
    fetchListData(currentLimit, currentDataSource, currentPage);
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
    
    // Only show pagination if we got results equal to limit (suggesting more pages exist)
    if (count < limit && page === 1) {
        paginationDiv.classList.add('d-none');
        return;
    }
    
    paginationDiv.classList.remove('d-none');
    paginationDiv.classList.add('d-flex');
    
    // Update page info
    document.getElementById("page_info").textContent = `الصفحة ${page}`;
    
    // Enable/disable previous button
    const prevBtn = document.getElementById("prev_page");
    if (page <= 1) {
        prevBtn.classList.add('disabled');
        prevBtn.setAttribute('disabled', 'disabled');
    } else {
        prevBtn.classList.remove('disabled');
        prevBtn.removeAttribute('disabled');
    }
    
    // Enable/disable next button based on whether we got full results
    const nextBtn = document.getElementById("next_page");
    if (count < limit) {
        nextBtn.classList.add('disabled');
        nextBtn.setAttribute('disabled', 'disabled');
    } else {
        nextBtn.classList.remove('disabled');
        nextBtn.removeAttribute('disabled');
    }
}

function navigateToPage(page) {
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.set('page', page);
    window.location.search = urlParams.toString();
}

function previousPage() {
    if (currentPage > 1) {
        navigateToPage(currentPage - 1);
    }
}

function nextPage() {
    navigateToPage(currentPage + 1);
}

async function load_list() {
    // ---
    loadfetchData();
    // ---
    toggleCustomInput();
    // ---
}
