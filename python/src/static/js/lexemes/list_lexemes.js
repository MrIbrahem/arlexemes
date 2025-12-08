let treeData = [];
let currentPage = 1;
let currentLimit = 1000;
let currentDataSource = "all";
let currentPageType = "list"; // track whether we're on 'list' or 'new'

async function make_wd_result_for_list(data_source, limit, offset, page_type) {
    let sparqlQuery;
    if (page_type === "new") {
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

async function fetchListData(data_source, limit, page, page_type) {

    let offset = (page - 1) * limit;

    let treeMap = await make_wd_result_for_list(data_source, limit, offset, page_type);

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

function loadfetchData(page_type = "list") {

    showLoading();

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
    currentPageType = page_type; // store whether this load is for 'list' or 'new'

    fetchListData(currentDataSource, currentLimit, currentPage, page_type);
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
    const urlParams = new URLSearchParams(window.location.search);
    // preserve current page_type (list/new) if set, otherwise default to currentPageType
    const page_type = urlParams.get('page_type') || currentPageType || 'list';
    urlParams.set('page', page);
    urlParams.set('page_type', page_type);
    const newUrl = window.location.pathname + '?' + urlParams.toString();
    // change URL without reloading the page
    history.pushState({page, page_type}, '', newUrl);

    // update current state and fetch via AJAX
    currentPage = page;
    currentPageType = page_type;
    showLoading();
    fetchListData(currentDataSource, currentLimit, currentPage, currentPageType);
}

// handle browser back/forward: read params from URL and load via AJAX
window.addEventListener('popstate', (e) => {
    const params = new URLSearchParams(window.location.search);
    const page = parseInt(params.get('page') || 1);
    const page_type = params.get('page_type') || 'list';

    // derive data_source consistent with loadfetchData behavior
    let data_source = get_param_from_window_location("data_source", "all");
    let custom_data_source = get_param_from_window_location("custom_data_source", "");
    if (custom_data_source !== "" && data_source === "custom") {
        data_source = custom_data_source;
        // show custom input if present
        const customInputElem = document.getElementById('custom_data_source');
        if (customInputElem) customInputElem.style.display = 'block';
    }

    currentPage = page;
    currentPageType = page_type;
    currentDataSource = data_source;

    showLoading();
    fetchListData(currentDataSource, currentLimit, currentPage, currentPageType);
});

function previousPage() {
    if (currentPage > 1) {
        navigateToPage(currentPage - 1);
    }
}

function nextPage() {
    navigateToPage(currentPage + 1);
}

async function load_list() {
    loadfetchData("list");
    toggleCustomInput();

}

async function load_new() {
    loadfetchData("new");
    toggleCustomInput();

}
