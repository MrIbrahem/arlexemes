
const loadingEl = document.getElementById("loading");
const errorEl = document.getElementById("error");
const errorMessageEl = document.getElementById("errorMessage");
const noResultsEl = document.getElementById("noResults");

let treeData = [];

function showLoading() {
    loadingEl.classList.remove("d-none"); // Bootstrap 5: use d-none for hidden
    errorEl.classList.add("d-none");     // Bootstrap 5: use d-none for hidden
    noResultsEl.classList.add("d-none"); // Bootstrap 5: use d-none for hidden
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
    loadingEl.classList.add("d-none"); // Bootstrap 5: use d-none for hidden

    if (!data.length) {
        noResultsEl.classList.remove("d-none"); // Bootstrap 5: use d-none for hidden
        return;
    }
    noResultsEl.classList.add("d-none"); // Bootstrap 5: use d-none for hidden
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
            let href = `lex?Lid=${item.item}`;
            let lemma = `${item.lemma} (${item.count})`;
            // ---
            if (!to_lex.includes(item.category)) {
                href = `http://www.wikidata.org/entity/${item.item}`;
                lemma = (item.P31Label != "") ? `${item.lemma} (${item.P31Label})` : item.lemma;
            }
            // ---
            if (category.group_by == "أخرى") {
                lemma = (item.categoryLabel != "") ? `${item.lemma} (${item.categoryLabel})` : item.lemma;
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
function get_param_from_window_location(key, defaultvalue) {
    // ---
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(key) || defaultvalue;
}

async function fetchData() {
    showLoading();

    let limit = get_param_from_window_location("limit", 100);
    $("#limit").val(limit);
    // Assuming find_wd_result is defined elsewhere and returns the data
    let treeMap = await find_wd_result(limit);

    treeMap = slice_data(treeMap);

    // count all items.length in wd_result
    let count = Object.values(treeMap).reduce((sum, obj) => sum + obj.items.length, 0);

    // add total to the page
    document.getElementById("total").textContent = `(${count})`;

    treeData = Object.values(treeMap);
    renderTree(treeData);
}
