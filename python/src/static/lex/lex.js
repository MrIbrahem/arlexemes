let display_empty_cells = true;

let ty = "";

let Pausal_Forms = [
    "Q117262361",
    "Q131105",
    "Q146078",
    "Q146233",
    ""
];

// مفرد مثنى جمع
const singular_plural_dual = ["Q110786", "Q110022", "Q146786", ""];

const first_second_third_person = [
    "Q21714344",
    "Q51929049",
    "Q51929074",
    ""
];

const gender_Keys_global = ["Q499327", "Q1775415", ""];

let numberKeys_verb = [
    "Q23663136", // past
    "Q56649265", // imperfective
    "Q473746", // subjunctive

    "Q462367", // jussive
    "Q22716",  // imperative

    "Q12230930", // fi'il muḍāri'

    "Q124351233", // أدائي
    ""
];


function removeKeysIfNotFound(colKeys, forms, keysToRemove) {
    const featuresSet = new Set();

    // اجمع كل grammaticalFeatures الموجودة في جميع forms
    for (const form of forms) {
        const feats = form.tags || form.grammaticalFeatures || [];
        feats.forEach(f => featuresSet.add(f));
    }

    // تحقق لكل مفتاح: هل موجود في أي grammaticalFeatures؟
    for (const key of keysToRemove) {
        if (!featuresSet.has(key)) {
            const index = colKeys.indexOf(key);
            if (index > -1) {
                colKeys.splice(index, 1);
                console.log("removeKeysIfNotFound removed:", key);
            }
        }
    }

    return colKeys;
}

function wdlink_2(key) {
    // ---
    if (!key || key === "") return "";
    // ---
    let qid = "";
    let label = "";
    // ---
    // if key start With Q
    if (key.startsWith("Q")) {
        qid = key;
        label = keyLabels[qid] ? keyLabels[qid] : "";
    } else {
        qid = en2qid[key.toLowerCase()] ? en2qid[key.toLowerCase()] : key;
        label = grammaticalFeatures[key] ? grammaticalFeatures[key]["ar"] : key;
    }
    // ---
    let numberKeys = [
        "singular",     // مفرد
        "dual",         // مثنى
        "plural",       // جمع
        "singulative",  // صيغة المفرد الفردي
        "collective",   // صيغة الجمع الجماعي
        "paucal",       // صيغة القلة
        "perfective",   // تام

        "broken-form",  // جمع تكسير
        "sound-form",    // جمع سالم
        "plural-sound-form", // جمع سالم
        "plural-broken-form", // جمع تكسير

        "singular invariable",
        "plural invariable",

    ];
    // ---
    let to_find = (ty === "verb") ? numberKeys_verb : numberKeys;
    // ---
    if (to_find.includes(key)) {
        label = `${label}<br>${key}`
    }
    // ---
    return `<a href="https://www.wikidata.org/entity/${qid}" target="_blank" class="text-primary">${label}</a>`
}

function make_tableData(number_Keys, row_Keys, col_Keys, gender_Keys) {
    // ---
    let first_person = ["first-person", "Q21714344"];
    let dual = ["dual", "Q110022"];
    // ---
    const tableData = {};
    for (const num of number_Keys) {
        tableData[num] = {};
        for (const row of row_Keys) {
            tableData[num][row] = {};
            for (const col of col_Keys) {
                tableData[num][row][col] = {};
                for (const gender of gender_Keys) {
                    if (first_person.includes(col) && dual.includes(gender)) continue;
                    tableData[num][row][col][gender] = [];
                }
            }
        }
    }
    return tableData;
}

function wdlink(key) {
    // ---
    if (!key || key === "") return "";
    // ---
    let qid = "";
    // ---
    // if key start With Q
    if (key.startsWith("Q")) {
        qid = key;
    } else {
        qid = en2qid[key.toLowerCase()] ? en2qid[key.toLowerCase()] : key;
    }
    // ---
    let label = keyLabels[qid] ? `${keyLabels[qid]} (${key})` : qid;
    // ---
    return `<a href="https://www.wikidata.org/entity/${qid}" target="_blank" class="text-primary">${label}</a>`
}

function attrFormatter(key) {
    // ---
    if (!key || key === "") return "";
    // ---
    let qid = "";
    // ---
    // if key start With Q
    if (key.startsWith("Q")) {
        qid = key;
    } else {
        qid = en2qid[key.toLowerCase()] ? en2qid[key.toLowerCase()] : key;
    }
    // ---
    return (keyLabels[qid]) ? `${key} - ${keyLabels[qid]}` : key;
}

function entryFormatter(form) {
    // ---
    const formId = form?.id || "L000-F0";
    // ---
    // ar-x-Q775724
    let values = Object.values(form.representations || {})
        .map(r => r.value)
        .filter(Boolean)
        .map(v => `<span word="${v}">${v}</span>`)
        .join(" / ") || `<span word="${form?.form}">${form?.form}</span>` || "";
    // ---
    // Convert formId to a URL-friendly format for linking to Wikidata
    const formIdlink = formId.replace("-", "#");
    const formId_number = formId.split("-")[1]; // Extract F-number part
    // ---
    const feats = form.tags || form.grammaticalFeatures || [];
    let attr = feats.map(attrFormatter).join("\n");
    // ---
    let link = `
		<a title="${attr}" href="https://www.wikidata.org/entity/${formIdlink}" target="_blank">
            ${values}
			<small>(${formId_number})</small>
		</a>`;
    // ---
    const lexemeId = formId.split("-")[0];
    // ---
    if (lexemeId === "L000") {
        link = `
        <span title="${attr}">
            ${values}
			<small>(${formId_number})</small>
        </span>
        `;
    }
    // ---
    return link;
}

function make_thead(first_rows, second_rows, first_person, dual) {
    // ---
    let thead = `
        <tr data-dt-order="disable">
            <th colspan="2"></th>
    `;

    // الصف الأول من الرؤوس
    for (const gender of first_rows) {
        // ---
        let colspan = second_rows.length;
        // ---
        if (second_rows.includes(first_person) && gender === dual) {
            colspan -= 1;
        }
        // ---
        if (!display_empty_cells && second_rows.includes("")) {
            colspan -= 1;
        }
        // ---
        const headerText = (first_rows.length === 1 && gender === "") ? "النوع" : wdlink_2(gender);
        // ---
        if (!display_empty_cells && gender === "" && first_rows.length > 1) continue;
        // ---
        thead += `
            <th colspan="${colspan}">${headerText}</th>
        `;
    }

    thead += `
        </tr>
        <tr>
            <th data-dt-order="disable"></th> <!-- Top-left empty cell, spans two rows -->
            <th data-dt-order="disable">الحالة</th> <!-- Case header (الحالة), spans two rows -->
    `;

    // الصف الثاني من الرؤوس
    for (const gender of first_rows) {
        // ---
        if (!display_empty_cells && gender === "" && first_rows.length > 1) continue;
        // ---
        for (const col of second_rows) {
            // ---
            if (!display_empty_cells && col === "") continue;
            // ---
            if (col === first_person && gender === dual) {
                // تجاهل هذه الخلية
                continue;
            }
            // ---
            let text = wdlink_2(col);
            // ---
            thead += `
                <th>${text}</th>
            `;
        }
    }

    thead += `
        </tr>
    `;
    // ---
    return thead;
}

function right_side_th(i, number, row, row_Keys) {
    let add_to_tbody = "";

    // Add the number header (مفرد or جمع) in the first column, spanning all case rows
    if (i === 0) {
        // ---
        let text = wdlink_2(number);
        // ---
        let rowspan = row_Keys.length;
        // ---
        if (!display_empty_cells && row_Keys.includes("")) {
            rowspan -= 1;
        };
        // ---
        let add_th = `
            <th rowspan="${rowspan}" class="table-light">${text}</th>
        `;
        // ---
        if (!display_empty_cells && number === "") add_th = "";
        // ---
        add_to_tbody += add_th;
    }
    // ---
    let text2 = wdlink_2(row);
    // ---
    let add_th2 = `
        <th>${text2}</th>
    `;
    // ---
    if (!display_empty_cells && row === "") add_th2 = "";
    // ---
    // Add the case header (e.g., رفع) in the second column
    add_to_tbody += add_th2;
    // ---
    return add_to_tbody;
}
// Function to generate the HTML table from structured data
function _generateHtmlTable(tableData, first_collumn, second_collumn, second_rows, first_rows, title_header) {

    let first_person = "Q21714344";
    let second_person = "Q51929049";
    let dual = "Q110022";
    let singular = "Q110786";
    let plural = "Q146786";
    // ---
    let Masculine = "Q499327";
    let Feminine = "Q1775415";
    // ---
    let number_Keys = first_collumn;
    let gender_Keys = first_rows;
    let col_Keys = second_rows;
    let row_Keys = second_collumn;
    // ---
    let thead = make_thead(gender_Keys, col_Keys, first_person, dual);
    // ---
    let tbody = "";

    // Iterate through number categories (مفرد, جمع)
    for (const number of number_Keys) {
        // ---
        let number_data = tableData[number];
        // ---
        if (!display_empty_cells && number === "") continue;
        // ---
        // Check if there is any data for this number category to avoid empty sections
        let hasNumberData = row_Keys.some(row =>
            gender_Keys.some(gender =>
                col_Keys.some(col => (number_data[row][col][gender] || []).length > 0)
            )
        );

        if (!hasNumberData) continue; // Skip displaying this number category if no data

        let singular_fixed = [];
        // Iterate through case rows (وقف, رفع, نصب, إضافة) for each number category
        for (let i = 0; i < row_Keys.length; i++) {
            const row = row_Keys[i];
            // ---
            if (!display_empty_cells && row === "") continue;
            // ---
            let add_to_tbody = right_side_th(i, number, row, row_Keys);

            // Add the data cells for each gender and column type
            for (const gender of gender_Keys) {
                // ---
                if (!display_empty_cells && gender === "" && gender_Keys.length > 1) continue;
                // ---
                let gender_tds = "";
                for (const col of col_Keys) {

                    if (col === first_person && gender === dual) continue;

                    // ---
                    if (!display_empty_cells && col === "") continue;
                    // ---
                    let td = `<td>`;
                    let entries = number_data[row][col][gender] || [];
                    // ---
                    let check_1 = col === first_person && (gender === singular || gender === plural);
                    let check_2 = col === second_person && gender === dual;
                    // ---
                    if (check_1 || check_2) {
                        if (singular_fixed[gender]) continue;
                        let fem_entries = number_data[Feminine][col][gender] || [];
                        let third_entries = number_data[""][col][gender] || [];
                        if (row === Masculine && third_entries.length > 0 && entries.length == 0 && fem_entries.length == 0) {
                            entries = third_entries;
                            singular_fixed[gender] = true;
                            // ---
                            let rowspan = (display_empty_cells) ? 3 : 2;
                            // ---
                            td = `
                                <td rowspan="${rowspan}">
                            `;
                        }
                    };
                    // ---
                    td += entries.map(entryFormatter).join("<br>") || "";
                    td += `
                        </td>
                    `;

                    gender_tds += td
                }
                add_to_tbody += gender_tds;
            }
            if (add_to_tbody !== "") {
                tbody += `
                    <tr>
                    ${add_to_tbody}
                    </tr>
                `;
            }
        }
    }

    if (tbody === "") return "";

    // table-striped

    let html = `
        <table idx="main_table" class="table table-bordered table-sm table-hover text-center align-middle pages_table">
            <thead class="table-light">
                ${thead}
            </thead>
            <tbody>
                ${tbody}
            </tbody>
        </table>
        `;
    // ---
    let card = `
        <div class="card mb-3">
            <div class="card-header">
                <div class="card-title">
                    ${title_header || ""}
                </div>
            </div>
            <div class="card-body">
            ${html}
            </div>
        </div>
    `
    return card;
}

/*

Q24905 الأفعال

*/
async function Q24905(entity) {
    ty = "verb";

    let forms = entity.forms || [];

    let verbs_main = ["Q1317831", "Q1194697", ""];

    let numberKeys = numberKeys_verb;

    let rowKeys = gender_Keys_global;

    let colKeys = first_second_third_person; // Q21714344

    let genderKeys = removeKeysIfNotFound([...singular_plural_dual], forms, ["Q110786", "Q110022", "Q146786"]);

    // Initialize tableData structure: tableData[number][row][col][gender]
    const tableData = {}; // Q1317831

    for (const verb of verbs_main) {
        tableData[verb] = make_tableData(numberKeys, rowKeys, colKeys, genderKeys);
    }

    // Populate the tableData with forms based on their grammatical features
    for (const form of forms) {
        const feats = form.tags || form.grammaticalFeatures || [];

        // البحث عن المطابقة، إذا لم يتم العثور عليها، استخدم المفتاح الفارغ ""

        const verb = verbs_main.find(n => feats.includes(n)) || "";
        const number = numberKeys.find(n => feats.includes(n)) || "";
        const row = rowKeys.find(r => feats.includes(r)) || "";

        const gender = genderKeys.find(g => feats.includes(g)) || "";
        const col = colKeys.find(c => feats.includes(c)) || "";
        // ---
        tableData[verb][number][row][col][gender].push(form);
        // ---
    }
    let result = "";
    // ---
    for (let verb of verbs_main) {
        let verb2 = (verb !== "") ? verb : "فعل آخر";
        let verb_lab = wdlink(verb2);
        let caption = `<div class="text-center"><h3>${verb_lab}</h3></div>`;
        // Call the shared HTML generation function
        result += _generateHtmlTable(tableData[verb], numberKeys, rowKeys, colKeys, genderKeys, caption);
    }
    // ---
    return result;

}

async function adj_and_nouns(entity_type, entity) {

    const forms = entity.forms || [];

    let number_Keys = singular_plural_dual;
    // ---
    let Masculine = "Q499327";
    let Feminine = "Q1775415";
    // ---
    let row_Keys = Pausal_Forms;
    let genderKeys = removeKeysIfNotFound([...gender_Keys_global], forms, [Masculine, Feminine]);

    let colKeys = ["Q53997857", "Q53997851", "Q1641446", "Q118465097", ""];
    colKeys = removeKeysIfNotFound([...colKeys], forms, ["Q118465097", "Q1641446"]);
    // ---
    const tableData = make_tableData(number_Keys, row_Keys, colKeys, genderKeys);

    // Populate the tableData with forms based on their grammatical features
    for (const form of forms) {
        let feats = form.tags || form.grammaticalFeatures || [];

        const number = number_Keys.find(n => feats.includes(n)) || "";
        const row = row_Keys.find(r => feats.includes(r)) || "";
        const col = colKeys.find(c => feats.includes(c)) || "";
        const gender = genderKeys.find(g => feats.includes(g)) || "";

        tableData[number][row][col][gender].push(form);
    }

    // Call the shared HTML generation function
    return _generateHtmlTable(tableData, number_Keys, row_Keys, colKeys, genderKeys);
}

/*

Q34698 الصفات

*/
async function Q34698(entity) {
    return adj_and_nouns("Q34698", entity);
}

/*

Q1084: الاسماء

*/
async function Q1084(entity) {
    return adj_and_nouns("Q1084", entity);
}

/*

Q111029 الجذور

*/
async function Q111029(entity) {
    return adj_and_nouns("Q111029", entity);
}
