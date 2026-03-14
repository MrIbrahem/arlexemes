

function get_param_from_window_location(key, defaultvalue) {
    // ---
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(key) || defaultvalue;
}

function showLoading() {
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
