let Labels = {
    "P31": "فئة",
    "P5920": "الجذر",
    "P11038": "أنطولوجيا",
}

let to_dis_tags = {
    "مصدر": ["Q1923028"],
    "المصدر": ["Q1350145"],
    "اِسْم الْمَفْعُول": ["Q72249544"],
    "اِسْم الْفَاعِل": ["Q72249355"],
    "المضارع": ["non-past"],
    "مركب": ["construct"],
    "مؤنث": ["Q1775415"],
    "مذكر": ["Q499327"],
    "بديل": ["alternative"],
    "جمع": ["Q146786"],
    "جمع مؤنث": ["Q1775415", "Q146786"],
    "جمع مذكر": ["Q499327", "Q146786"],
};

function make_claims(claims) {
    let row = "";
    // ---
    for (const prop in claims) {
        let label = Labels[prop] ? Labels[prop] : prop;
        let pv = ``;
        for (const v of claims[prop]) {
            let value = v.mainsnak.datavalue.value;
            if (typeof value === "object") {
                value = `<a href="https://wikidata.org/entity/${value.id}" target="_blank">${value.id}</a>`;
            }
            pv += `${value}`;
        }
        row += `
            <div class='col'>
                <a href="https://wikidata.org/entity/${prop}" target="_blank">${label}</a>: ${pv}
            </div>
        `;
    }
    // ---
    return row;
}

function make_to_display(formsToProcess) {

    // تجهيز قائمة الوسوم المرتبة المرتبطة بكل QID
    const matchRules = Object.entries(to_dis_tags).map(([qid, tags]) => ({
        qid,
        tagsSorted: [...tags].sort()
    }));

    // نحفظ لكل QID مجموعة القيم المطابقة
    const qidValuesMap = {};

    for (const form of formsToProcess) {
        const value = form.representations?.ar?.value || form?.form;
        const feats = (form.tags || form.grammaticalFeatures || []).slice().sort();

        for (const { qid, tagsSorted } of matchRules) {
            // تحقق من تطابق الوسوم تمامًا
            if (
                feats.length === tagsSorted.length &&
                feats.every((tag, i) => tag === tagsSorted[i])
            ) {
                if (!qidValuesMap[qid]) qidValuesMap[qid] = new Set();
                qidValuesMap[qid].add(value); // نضيف القيمة إلى المجموعة الفريدة
                break;
            } else if (feats.length === 1) {
                let to_skip = ["canonical"];
                // ---
                if (to_skip.includes(feats[0])) continue;
                // ---
                let qid1 = en2ar[feats[0]] ? en2ar[feats[0]] : feats[0];
                // ---
                if (!qidValuesMap[qid1]) qidValuesMap[qid1] = new Set();
                // ---
                qidValuesMap[qid1].add(value); // نضيف القيمة إلى المجموعة الفريدة
                // ---
                break;
            }
        }
    }

    let displayHtml = "<div class='col'>";
    let count = 0;
    // نعرض كل QID مع القيم الخاصة به
    for (const [qid, valuesSet] of Object.entries(qidValuesMap)) {
        const values = Array.from(valuesSet).join("، ");
        displayHtml += `
            <div class="col">
                <strong>${qid}:</strong>
                ${values}
            </div>`;

        count++;

        // بعد كل 3 عناصر، أضف تقسيم جديد
        if (count % 3 === 0) {
            displayHtml += "</div><div class='col'>";
        }
    }
    displayHtml += "</div>";
    return displayHtml;
}

function filter_forms(forms) {
    // قائمة الوسوم المطلوب استبعادها كأزواج كاملة
    const excludedTags = Object.values(to_dis_tags).map((arr) => JSON.stringify(arr.sort()));

    // فلترة النماذج
    forms = forms.filter((form) => {
        const feats = (form.tags || form.grammaticalFeatures || []).slice().sort(); // ننسخ ونرتب
        return !excludedTags.includes(JSON.stringify(feats));
    });

    /*
    forms = forms.filter((form) => {
        const tags = form.tags || form.grammaticalFeatures || [];
        return !(tags.length === 1 && tags[0] === "canonical");
    });
    */

    forms = forms.filter((form) => {
        const tags = form.tags || form.grammaticalFeatures || [];
        return !(tags.length === 2 && (tags[0] === "common" || tags[1] === "common"));
    });

    return forms;
}


function fix_it2(lemma) {
    // ---
    if (!lemma || typeof lemma !== 'string') return '';
    // ---
    // remove all arabic diacritics
    const regex = /[\u064B-\u065F\u066A-\u06EF]/g;
    // ---
    let new_lemma = lemma.replace(regex, '');
    // ---
    return new_lemma;
}

function add_page_title(id, lemma) {

    document.title += ` ${id} - ${lemma}`;
    // ---
    let lemma2 = fix_it2(lemma);
    // ---
    let lemma_link_tag = $("#lemma_link");
    // ---
    if (lemma_link_tag) {
        lemma_link_tag.html(`<a href="https://www.wikidata.org/entity/${id}" target="_blank" class="text-primary font-weight-bold" id="lemma_link">${lemma}</a>`);
    }
    // ---
    let lemma_link_en = $("#lemma_link_en");
    // ---
    if (lemma_link_en) {
        lemma_link_en.html(`
        <span id="lemma_link_en">
        (<a href="https://en.wiktionary.org/wiki/${lemma2}" target="_blank" class="text-primary font-sm">en</a>)
        </span>
    `);
        // ---
    }
}
async function fetchLexemeById(id, entity) {

    const Category = entity.lexicalCategory ?? "";

    const lemma = entity.lemmas?.ar?.value || "(غير متوفر)";
    // add lemma to title of the page
    add_page_title(id, lemma);

    const lexicalCategory = entity.lexicalCategory ? wdlink(entity.lexicalCategory) : "";
    const language = entity.language ? wdlink(entity.language) : "";
    let forms = entity.forms || [];

    let to_display = make_to_display(forms);

    forms = filter_forms(forms);

    entity.forms = forms;

    let claims = make_claims(entity?.claims);
    let forms_len = forms.length;
    let html = `
        <div class="row mb-4">
            <div class="col">
                <span class="h4">المفردات:  ${forms_len}</span>
            </div>
            <div class="col">
                ${claims}
            </div>
            <div class="col">
                <strong>التصنيف المعجمي:</strong> ${lexicalCategory}
            </div>
            <div class="col">
                <strong>اللغة:</strong> ${language}
            </div>
            ${to_display}
        </div>
    `;

    let table_html = "";
    if (typeof window[Category] === "function") {
        table_html = await window[Category](entity);
        // $("#main_table").DataTable({ searching: false });
    } else {
        table_html = `<div class='alert alert-warning'>لم يتم التعامل مع هذا النوع ${Category} من التصنيف بعد.</div>`;
    }
    if (table_html) {
        html += table_html;
    } else {
        html += `<div class='alert alert-warning'>لا يوجد بيانات</div>`
    }
    return html;
}

async function start_lexeme(id) {
    // const id = document.getElementById("lexemeId").value.trim();
    // if (!id) return;

    const output = document.getElementById("output");
    output.innerHTML = "<div class='alert alert-info'>جاري تحميل البيانات...</div>";

    let entity = await getentity(id);

    let html = await fetchLexemeById(id, entity);

    output.innerHTML = html;

    table_filter();
}
