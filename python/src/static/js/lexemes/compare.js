
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

function convertDataNew(data) {
    // ?lemma ?item ?categoryLabel ?p ?pLabel ?p_value ?p_valueLabel
    const newData = {};

    for (const x of data) {
        let lemma = x["lemma"] || "";
        // ---
        lemma = lemma.replace(/[\u064B-\u065F\u066A-\u06EF]/g, '')
        // ---
        if (!newData[lemma]) {
            newData[lemma] = { items: {}, proplabels: {} };
        }
        // ---
        const item1 = x["item"] || "";
        // ---
        if (!newData[lemma]["items"][item1]) {
            newData[lemma]["items"][item1] = { category: {}, props: {} };
        }
        // ---
        const item1Category = x["categoryLabel"] || "";
        // ---
        if (item1Category) {
            newData[lemma]["items"][item1]["category"] = item1Category;
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
        const propValue1 = x["p_value"] || "";
        const propValue1Label = x["p_valueLabel"] || "";
        // ---
        if (propValue1) {
            newData[lemma]["items"][item1]["props"][p]["value"] = propValue1;
        }
        // ---
        if (propValue1Label) {
            newData[lemma]["items"][item1]["props"][p]["valuelabel"] = propValue1Label;
        }
    }
    // ---
    return newData;
}

async function get_wdresult(qids) {
    const sparqlQuery = qids_data_query(qids);
    // ---
    add_sparql_url(sparqlQuery);
    // ---
    let result = await loadsparqlQuery(sparqlQuery);
    // ---
    return result;
}

async function get_qids_data(qids) {
    // ---
    let wdresult = await get_wdresult(qids);
    // ---
    wdresult = convertDataNew(wdresult);
    // ---
    console.table(wdresult);
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

function make_html(group) {
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
        return `<th>
                    <a href="https://wikidata.org/entity/${id}" target="_blank">${id}</a> (${item.category || ''})
                </th>`;
    }).join("");

    const html = `
        <div class="card mb-3">
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
        if (items.length < 2) return; // تأكد من وجود عنصرين على الأقل
        // ---
        let html = make_html(group);
        // ---
        $('#tables_container').append(html);
    });
}

async function load_compare() {
    // ---
    let qids = get_param_from_window_location("qids", "");
    // ---
    qids = qids.split(",");
    // ---
    let data = await get_qids_data(qids);
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
