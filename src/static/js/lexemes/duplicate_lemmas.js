
let LocalpropLabels = {
    "P5187": "أصل الكلمة",
    "P5186": "التصريف",
    "P31": "فئة",
    "P5920": "الجذر",
    "P5185": "الجنس النحوي",
    "P11038": "الأنطولوجيا",
    "P12900": "ARABTERM",
    "P12901": "الهوراماني",
}

function convertData(data) {
    const newData = {};

    for (const x of data) {
        const lemma = x["lemma"] || "";
        // ---
        if (!newData[lemma]) {
            newData[lemma] = { items: {}, proplabels: {} };
        }
        // ---
        const item1 = x["1_item"] || "";
        const item2 = x["2_item"] || "";
        // ---
        if (!newData[lemma]["items"][item1]) {
            newData[lemma]["items"][item1] = { category: {}, props: {} };
        }
        if (!newData[lemma]["items"][item2]) {
            newData[lemma]["items"][item2] = { category: {}, props: {} };
        }
        // ---
        const item1Category = x["1_categoryLabel"] || "";
        const item2Category = x["2_categoryLabel"] || "";
        // ---
        if (item1Category) {
            newData[lemma]["items"][item1]["category"] = item1Category;
        }
        // ---
        if (item2Category) {
            newData[lemma]["items"][item2]["category"] = item2Category;
        }
        // ---
        const p = x["p"] || "";
        const pLabel = x["pLabel"] || "";
        // ---
        if (!p) {
            continue;
        }
        // ---
        if (pLabel) {
            if (!newData[lemma]["proplabels"][p]) {
                newData[lemma]["proplabels"][p] = pLabel;
            }
        }
        // ---
        if (!newData[lemma]["items"][item1]["props"][p]) {
            newData[lemma]["items"][item1]["props"][p] = { value: "", valuelabel: "" };
        }
        if (!newData[lemma]["items"][item2]["props"][p]) {
            newData[lemma]["items"][item2]["props"][p] = { value: "", valuelabel: "" };
        }
        // ---
        const propValue1 = x["1_p_value"] || "";
        const propValue1Label = x["1_p_valueLabel"] || "";
        // ---
        if (propValue1) {
            newData[lemma]["items"][item1]["props"][p]["value"] = propValue1;
        }
        // ---
        if (propValue1Label) {
            newData[lemma]["items"][item1]["props"][p]["valuelabel"] = propValue1Label;
        }
        // ---
        const propValue2 = x["2_p_value"] || "";
        const propValue2Label = x["2_p_valueLabel"] || "";
        if (propValue2) {
            newData[lemma]["items"][item2]["props"][p]["value"] = propValue2;
        }
        // ---
        if (propValue2Label) {
            newData[lemma]["items"][item2]["props"][p]["valuelabel"] = propValue2Label;
        }
    }
    // ---
    return newData;
}

async function get_wdresult(same_category = false) {
    const sparqlQuery = duplicate_lemmas_query(same_category);
    // ---
    add_sparql_url(sparqlQuery);
    // ---
    let result = await loadsparqlQuery(sparqlQuery);
    // ---
    return result;
}

async function get_data_dup(same_category) {
    let wdresult = await get_wdresult(same_category);
    // ---
    // console.table(wdresult);
    // ---
    wdresult = convertData(wdresult);
    // ---
    const sortedData = {};
    // ---
    Object.keys(wdresult)
        .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase(), 'ar'))
        .forEach(lemma => {
            sortedData[lemma] = wdresult[lemma];
        });
    // ---
    return sortedData;
}

function getVal(props, p) {
    // ---
    let properties_formts = {
        "P12900": "http://www.arabterm.org/index.php?id=40&L=1&tx_3m5techdict_pi1[id]=$1",
        "P12901": "http://arabiclexicon.hawramani.com/?p=$1",
        "P11038": "https://ontology.birzeit.edu/lemma/$1",
    }
    // ---
    let valuelabel = props?.valuelabel || "";
    let value = props?.value || "";
    // ---
    if (valuelabel == value) valuelabel = ""
    // ---
    let result = (valuelabel ? `${valuelabel} (${value})` : "") || value || '';
    // ---
    if (value === "") {
        return result;
    }
    // ---
    if (properties_formts[p]) {
        result = `
        <a href="${properties_formts[p].replace("$1", value)}" target="_blank">
            ${value}
        </a>`;
    } else if (value.match(/Q\d+/) || value.match(/L\d+/)) {
        // ---
        let label = "";
        // ---
        if (valuelabel !== "") {
            label = `${valuelabel} (${value})`;
        } else {
            label = `<span find-label="${value}" find-label-both="true">${value}</span>`;
        }
        // ---
        result = `<a target="_blank" href="https://www.wikidata.org/entity/${value}">${label}</a>`;
    }
    // ---
    return result;
}

function make_html(lemma, group, groupIndex) {
    // ---
    const propLabels = group.proplabels || {};

    // كل المفاتيح الموجودة في أي عنصر
    const sharedProps = [
        ...new Set(
            Object.values(group.items)
                .flatMap(item => Object.keys(item.props))
        )
    ];

    const items = Object.keys(group.items);
    const htmlRows = [];

    // بناء صفوف الجدول
    sharedProps.forEach(p => {
        const plabel = LocalpropLabels[p] || propLabels[p] || "";
        const label = plabel ? `${plabel} (${p})` : p;

        // لكل عنصر، استخرج القيمة
        const vals = items.map(id => {
            const item = group.items[id];
            return getVal(item.props[p], p);
        });

        // دمج القيم في أعمدة
        const tdHtml = vals.map(v => `<td>${v}</td>`).join("");

        htmlRows.push(`
            <tr>
                <th>
                    <a target="_blank" href="https://wikidata.org/entity/${p}">${label}</a>
                </th>
                ${tdHtml}
            </tr>
        `);
    });

    // بناء ترويسة الجدول ديناميكيًا
    const theadCols = items.map(id => {
        const item = group.items[id];
        return `
            <th>
                <a href="https://wikidata.org/entity/${id}" target="_blank">${id}</a> (${item.category || ''})
            </th>
        `;
    }).join("");

    const ids = items.map(id => {
        return `'${id}'`;
    }).join(", ");

    const button = `
        <button class="btn btn-sm btn-outline-primary"
                onclick="openSplitView([${ids}])"
                data-bs-toggle="modal" data-bs-target="#splitViewModal">
            <i class="bi bi-columns"></i> استعرض التصريفات
        </button>
    `;
    const html = `
        <div class="card mb-3">
            <div class="card-header">
                <div class="d-flex justify-content-between align-items-center">
                    <h2>${groupIndex} - ${lemma}</h2>
                    ${button}
                </div>
            </div>
            <div class="card-body">
                <table class="table compact table-striped table-bordered table_header_right display w-100">
                    <thead>
                        <tr>
                            <th class="w-25">خاصية</th>
                            ${theadCols}
                        </tr>
                    </thead>
                    <tbody>
                        ${htmlRows.join("")}
                    </tbody>
                </table>
            </div>
        </div>
    `;

    return html;
}

async function render_tables_container(data) {
    $('#tables_container').html('');
    let groupIndex = 0;

    // ترتيب الـ lemma حسب الترتيب الأبجدي
    const sortedLemmas = Object.keys(data).sort();

    sortedLemmas.forEach(lemma => {
        groupIndex++;

        const group = data[lemma];
        const items = Object.keys(group.items);
        // ---
        if (items.length < 2) return; // تأكد من وجود عنصرين على الأقل
        // ---
        const html = make_html(lemma, group, groupIndex);
        // ---
        $('#tables_container').append(html);
    });
}

async function load_duplicate() {
    // ---
    // let same_category = get_param_from_window_location("same_category", false);
    // if (same_category) $("#same_category").prop("checked", true);
    // ---
    let same_category = true;
    // ---
    let data = await get_data_dup(same_category);
    // ---
    HandelDataError(data);
    // ---
    await render_tables_container(data);
    // ---
    await find_labels();
    // ---
    $(`.table`).DataTable({
        searching: false,
        paging: false,
        info: false,
        responsive: {
            details: true
            // display: $.fn.dataTable.Responsive.display.modal()
        },
        order: []
    });
}
