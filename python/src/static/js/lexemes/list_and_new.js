
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
    // ---
    HandelDataError(data);
    // ---
    if (!data.length) {
        return;
    }
    // ---
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
            let href = `lex.php?lex=${item.item}`;
            let lemma = `${item.lemma} (${item.count})`;
            // ---
            let P31Label = item?.P31Label || "";
            // ---
            if (!to_lex.includes(item.category)) {
                href = `http://www.wikidata.org/entity/${item.item}`;
                lemma = (P31Label != "") ? `${item.lemma} (${P31Label})` : item.lemma;
            }
            // ---
            if (category.group_by == "أخرى") {
                lemma = (item.categoryLabel != "") ? `${item.lemma} (${item.categoryLabel})` : item.lemma;
            }
            // ---
            if (to_lex.includes(item.category) && P31Label != "") {
                lemma = `<span title="P31: ${P31Label}">${lemma}</span>`;
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
