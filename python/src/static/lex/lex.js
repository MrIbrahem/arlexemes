
// قاموس لربط مفاتيح ويكيداتا بالتسميات العربية
let keyLabels = {
    "Q1098772": "جمع تكسير",

    "Q23663136": "ماضي تام",
    "Q56649265": "مضارع ناقص",
    "Q12230930": "فعل مضارع",
    "Q473746": "فعل مضارع منصوب",
    "Q462367": "مجزوم",
    "Q22716": "فعل أمر",


    "Q13955": "العربية",
    "Q118465097": "الصيغة السياقية",

    // الأعداد
    "Q110786": "مفرد", // Singular
    "Q110022": "مثنى",  // Dual
    "Q146786": "جمع",   // Plural

    // الحالات الإعرابية (Pausal Forms)
    // "Q117262361": "مرفوع", // Nominative/Marfu'
    // "Q131105": "منصوب",    // Accusative/Mansub
    // "Q146078": "مجرور",     // Genitive/Majrur
    // "Q146233": "مجزوم",    // Jussive/Majzoom (أكثر شيوعًا للأفعال)
    "Q117262361": "الوقف",
    "Q131105": "رفع",
    "Q146078": "نصب",
    "Q146233": "إضافة",

    // أنواع الاسم (Definiteness)
    "Q53997851": "معرفة", // Definite
    "Q53997857": "نكرة",  // Indefinite
    "Q1641446": "مركب",  // Compound

    // الأشخاص (Person) - للاستخدام المستقبلي إذا لزم الأمر
    "Q21714344": "متكلم", // First Person
    "Q51929049": "مخاطب",  // Second Person
    "Q51929074": "غائب",   // Third Person

    // الجنس (Gender) - للاستخدام المستقبلي إذا لزم الأمر
    "Q499327": "مذكر", // Masculine
    "Q1775415": "مؤنث", // Feminine

    "Q111029": "جذر",
    "Q1084": "اسم",
    "Q24905": "فعل",
    "Q34698": "صفة",

    "Q1350145": "اسم مصدر",


    "Q1194697": "فعل مبني للمجهول",
    "Q1317831": "فعل مبني للمعلوم",

    "Q124351233": "أدائي",
    // "Q124351233": "إنجازي",

};

// مفرد مثنى جمع
const singular_plural_dual = ["Q110786", "Q110022", "Q146786", ""];

const first_second_third_person = ["Q21714344", "Q51929049", "Q51929074", ""];

const gender_Keys_global = ["Q499327", "Q1775415", ""];

const Pausal_Forms = ["Q117262361", "Q131105", "Q146078", "Q146233", ""];

function wdlink_2(id) {
    if (!id || id === "") return "";
    let label = keyLabels[id] ? keyLabels[id] : id;
    return `<a href="https://www.wikidata.org/entity/${id}" target="_blank" class="text-primary">${label}</a>`
}

function make_tableData(numberKeys, rowKeys, colKeys, genderKeys) {
    const tableData = {};
    for (const num of numberKeys) {
        tableData[num] = {};
        for (const row of rowKeys) {
            tableData[num][row] = {};
            for (const col of colKeys) {
                tableData[num][row][col] = {};
                for (const gender of genderKeys) {
                    if (col === "Q21714344" && gender === "Q110022") continue;
                    tableData[num][row][col][gender] = [];
                }
            }
        }
    }
    return tableData;
}
function wdlink(id) {
    if (!id || id === "") return "";
    let label = keyLabels[id] ? `${keyLabels[id]} (${id})` : id;
    return `<a href="https://www.wikidata.org/entity/${id}" target="_blank" class="text-primary">${label}</a>`
}

function attrFormatter(qid) {
    return (keyLabels[qid]) ? `${qid} - ${keyLabels[qid]}` : qid;
}

function entryFormatter(form) {
    // return `! ${form}`;
    const formId = form.id;
    let value = form.representations?.ar?.value || "";

    if (!value) {
        const reps = Object.values(form.representations || {});
        for (const rep of reps) {
            value = rep.value;
            break; // خذ أول تمثيل متاح
        }
    }
    // Convert formId to a URL-friendly format for linking to Wikidata
    const formIdlink = formId.replace("-", "#");
    const formId_number = formId.split("-")[1]; // Extract F-number part
    // ---
    const feats = form.grammaticalFeatures || [];
    let attr = feats.map(attrFormatter).join("\n");
    let link = `<a title="${attr}" href="https://www.wikidata.org/entity/${formIdlink}" target="_blank" word="${value}">${value} <small>(${formId_number})</small></a>`;
    // ---
    return link;
}

// Function to generate the HTML table from structured data
function _generateHtmlTable(tableData, first_collumn, second_collumn, second_rows, first_rows, title_header) {

    let html = `
        <table id="main_table" class="table display table-bordered table-striped table-sm table-hover text-center">
            <thead class="table-light">
                <tr>
                    <th rowspan="2" class="align-middle"></th> <!-- Top-left empty cell, spans two rows -->
                    <th rowspan="2" class="align-middle">الحالة</th> <!-- Case header (الحالة), spans two rows -->
        `;
    // ---
    let first_person = "Q21714344";
    let second_person = "Q51929049";
    let dual = "Q110022";
    let singular = "Q110786";
    let plural = "Q146786";
    // ---
    let number_Keys = first_collumn;
    let gender_Keys = first_rows;
    let col_Keys = second_rows;
    let row_Keys = second_collumn;
    // ---
    html += gender_Keys.map(gender => {
        const headerText = (gender_Keys.length === 1 && gender === "") ? "النوع" :
            wdlink_2(gender);
        let colspan = col_Keys.length;
        if (col_Keys.includes(first_person) && gender === dual) colspan = colspan - 1;
        return `<th colspan="${colspan}">${headerText}</th>`;
    }).join("")
    // ---
    html += `
        </tr>
        <tr>
        `;
    // ---
    html += gender_Keys.map(gender =>
        col_Keys.map(col => (col === first_person && gender === dual) ? "" : `<th>${wdlink_2(col)}</th>`).join("")
    ).join("")
    // ---
    html += `
            </tr>
        </thead>
        <tbody>`;

    let tbody = "";

    // Iterate through number categories (مفرد, جمع)
    for (const number of number_Keys) {
        // Check if there is any data for this number category to avoid empty sections
        const hasNumberData = row_Keys.some(row =>
            gender_Keys.some(gender =>
                col_Keys.some(col => (tableData[number][row][col][gender] || []).length > 0)
            )
        );

        if (!hasNumberData) continue; // Skip displaying this number category if no data

        let singular_fixed = [];
        // Iterate through case rows (وقف, رفع, نصب, إضافة) for each number category
        for (let i = 0; i < row_Keys.length; i++) {
            const row = row_Keys[i];
            tbody += "<tr>";

            // Add the number header (مفرد or جمع) in the first column, spanning all case rows
            if (i === 0) {
                tbody += `<th rowspan="${row_Keys.length}" class="table-light align-middle">${wdlink_2(number)}</th>`;
            }

            // Add the case header (e.g., رفع) in the second column
            tbody += `<th class="table-light">${wdlink_2(row)}</th>`;

            // Add the data cells for each gender and column type
            for (const gender of gender_Keys) {
                let gender_tds = "";
                for (const col of col_Keys) {

                    if (col === first_person && gender === dual) continue;

                    let td = `<td>`;
                    let entries = tableData[number][row][col][gender] || [];
                    // ---
                    let check_1 = col === first_person && (gender === singular || gender === plural);
                    let check_2 = col === second_person && gender === dual;
                    // ---

                    if (check_1 || check_2) {
                        if (singular_fixed[gender]) continue;
                        let fem_entries = tableData[number]["Q1775415"][col][gender] || [];
                        let third_entries = tableData[number][""][col][gender] || [];
                        if (row === "Q499327" && third_entries.length > 0 && entries.length == 0 && fem_entries.length == 0) {
                            entries = third_entries;
                            singular_fixed[gender] = true;
                            td = `<td rowspan="3" class="table-light align-middle">`;
                        }
                    };
                    // ---
                    td += entries.map(entryFormatter).join("<br>") || "";
                    td += `</td>`;

                    gender_tds += td
                }
                tbody += gender_tds;
            }

            tbody += "</tr>";
        }
    }

    if (tbody === "") return "";

    html += tbody;
    html += "</tbody></table>";
    // ---
    let card = `
        <div class="card">
            <div class="card-header">${title_header || ""}</div>
            <div class="card-body">${html}</div>
        </div>
    `
    return card;
}
function removeKeyIfNotFound(colKeys, forms, keyToRemove) {
    let found = false;

    // Iterate through each form
    for (const form of forms) {
        // Check if grammaticalFeatures exist and is an array
        const feats = form.grammaticalFeatures || [];

        // Check if the keyToRemove exists in the current form's grammaticalFeatures
        if (feats.includes(keyToRemove)) {
            found = true;
            break; // No need to continue searching once found
        }
    }

    // If the keyToRemove was not found in any grammaticalFeatures, remove it from colKeys
    if (!found) {
        const index = colKeys.indexOf(keyToRemove);
        if (index > -1) {
            colKeys.splice(index, 1);
        }
    }

    return colKeys;
}

/*

Q24905 الأفعال

*/
async function Q24905(entity) {

    // "Q1194697": "فعل مبني للمجهول", "Q1317831": "فعل مبني للمعلوم",
    // const numberKeys = ["Q1194697", "Q1317831"];

    let verbs_main = ["Q1317831", "Q1194697", ""];

    let numberKeys = ["Q23663136", "Q56649265", "Q462367", "Q473746", "Q12230930", "Q22716", "Q124351233", ""];

    let rowKeys = gender_Keys_global;

    let colKeys = first_second_third_person; // Q21714344

    let genderKeys = singular_plural_dual; // Q110022

    // Initialize tableData structure: tableData[number][row][col][gender]
    const tableData = {}; // Q1317831

    for (const verb of verbs_main) {
        tableData[verb] = make_tableData(numberKeys, rowKeys, colKeys, genderKeys);
    }
    const forms = entity.forms || [];

    // Populate the tableData with forms based on their grammatical features
    for (const form of forms) {
        const feats = form.grammaticalFeatures || [];
        // البحث عن المطابقة، إذا لم يتم العثور عليها، استخدم المفتاح الفارغ ""
        const verb = verbs_main.find(n => feats.includes(n)) || "";
        const number = numberKeys.find(n => feats.includes(n)) || "";
        const row = rowKeys.find(r => feats.includes(r)) || "";

        const gender = genderKeys.find(g => feats.includes(g)) || "";
        const col = colKeys.find(c => feats.includes(c)) || "";

        tableData[verb][number][row][col][gender].push(form);
        // ---
        // }
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

    let numberKeys = singular_plural_dual;

    let rowKeys = Pausal_Forms;
    let genderKeys, colKeys;

    if (entity_type === "Q1084") {
        genderKeys = [""];
        colKeys = ["Q53997857", "Q53997851", "Q1641446", ""];

    } else if (entity_type === "Q34698") {
        genderKeys = gender_Keys_global;
        colKeys = ["Q53997857", "Q53997851", "Q118465097", ""];

        // find Q118465097 in the grammatical features
        colKeys = removeKeyIfNotFound([...colKeys], forms, "Q118465097");
    }

    const tableData = make_tableData(numberKeys, rowKeys, colKeys, genderKeys);

    // Populate the tableData with forms based on their grammatical features
    for (const form of forms) {
        const feats = form.grammaticalFeatures || [];

        // البحث عن المطابقة، إذا لم يتم العثور عليها، استخدم المفتاح الفارغ ""
        const number = numberKeys.find(n => feats.includes(n)) || "";
        const row = rowKeys.find(r => feats.includes(r)) || "";
        const col = colKeys.find(c => feats.includes(c)) || "";
        const gender = genderKeys.find(g => feats.includes(g)) || "";

        tableData[number][row][col][gender].push(form);
    }

    // Call the shared HTML generation function
    return _generateHtmlTable(tableData, numberKeys, rowKeys, colKeys, genderKeys);
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
