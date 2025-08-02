
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

function make_to_display(formsToProcess) {

    // تجهيز قائمة الوسوم المرتبة المرتبطة بكل QID
    const matchRules = Object.entries(to_dis_tags).map(([qid, tags]) => ({
        qid,
        tagsSorted: [...tags].sort()
    }));

    // نحفظ لكل QID مجموعة القيم المطابقة
    const qidValuesMap = {};

    for (const form of formsToProcess) {
        // ---
        let value = Object.values(form.representations || {}).map(r => r.value).filter(Boolean).join(" / ") || form?.form || "";
        // ---
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
        let label = keyLabels[qid] ? keyLabels[qid] : qid;
        const values = Array.from(valuesSet).join("، ");
        displayHtml += `
            <div class="col">
                <strong>${label}:</strong>
                ${values}
            </div>`;

        count++;

        // بعد كل 3 عناصر، أضف تقسيم جديد
        // if (count % 2 === 0) { displayHtml += "</div><div class='col'>"; }
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
    if (lemma_link_tag.length > 0) {
        lemma_link_tag.html(`<a href="https://www.wikidata.org/entity/${id}" target="_blank" class="text-primary font-weight-bold" id="lemma_link">${lemma}</a>`);
    }
    // ---
    let lemma_link_en = $("#lemma_link_en");
    // ---
    if (lemma_link_en.length > 0) {
        lemma_link_en.html(`
            <span id="lemma_link_en">
            (<a href="https://en.wiktionary.org/wiki/${lemma2}#Arabic" target="_blank" class="text-primary font-sm">en</a>)
            </span>
        `);
    }
    // ---
}

function count_dup_forms(forms) {
    // إزالة التكرار في forms بناءً على form.form و form.tags (مع تجاهل ترتيب الوسوم)
    const seen = new Set();
    const uniqueForms = [];
    let duplicates = 0;
    for (const form of forms) {
        const tagsSorted = (form.tags || form.grammaticalFeatures || []).slice().sort(); // نسخ وفرز الوسوم
        // ---
        // if (tagsSorted.length < 2) continue;
        // ---
        let key = `${tagsSorted.join(",")}`;
        // ---
        if (!seen.has(key)) {
            seen.add(key);
            uniqueForms.push(form);
        } else {
            // console.log("count_dup_forms:", key);
            duplicates += 1;
        }
    }
    console.log("count_dup_forms: ", duplicates);

    return duplicates;
}

async function fetchLexemeById(id, entity) {

    let lemma = entity.lemma || "(غير متوفر)";
    if (entity.lemmas) {
        lemma = Object.values(entity.lemmas || {}).map(l => l.value).filter(Boolean).join(" / ") || "(غير متوفر)";
    }

    // add lemma to title of the page
    add_page_title(id, lemma);
    let lemma2 = fix_it2(lemma);

    let Category = entity.lexicalCategory ?? "";

    // ---

    // ---
    const lexicalCategorylink = (Category) ? wdlink(Category) : "";
    const language = entity.language ? wdlink(entity.language) : "";
    // ---
    let forms = entity.forms || [];
    // ---
    console.log("len forms:", forms.length);
    // ---

    let to_display = make_to_display(forms);

    forms = filter_forms(forms);

    entity.forms = forms;

    let claims = make_claims(entity?.claims);
    let claims_row = (claims !== "") ? `<div class="col">${claims}</div>` : "";
    let forms_len = forms.length;
    // ---
    let pos = "";
    // ---
    let count_duplicate = count_dup_forms(forms);
    // ---
    let dup_forms = "";
    // ---
    if (count_duplicate > 0) {
        dup_forms = `
            <span>(مكرر: ${count_duplicate})</span>`;
    }
    // ---
    let header_main = `
        <div class="col">
            <span class="h4">المفردات:  ${forms_len} ${dup_forms}</span>
        </div>
    `;
    // ---
    let lemma_link_tag = $("#lemma_link");
    let lemma_link_en = $("#lemma_link_en");
    // ---
    if (lemma_link_tag.length === 0 && lemma_link_en.length === 0) {
        header_main = `
            <div class="col-md-4">
                <span class="mb-4 h1" id="header_main">
                ${lemma}
                (<a href="https://en.wiktionary.org/wiki/${lemma2}#Arabic" target="_blank" class="text-primary font-sm">en</a>)
                </span>
                <span class="h4">المفردات: ${forms_len} ${dup_forms}</span>
            </div>
        `;
    }
    // ---
    let html = `
        <div class="row mb-4">
            ${header_main}
            ${claims_row}
            <div class="col">
                <strong>التصنيف:</strong>
                ${lexicalCategorylink}
            </div>
            <div class="col">
                <strong>اللغة:</strong> ${language}
            </div>
            <div class="col">
                ${to_display}
            </div>
        </div>
    `;

    let table_html = "";
    if (Category === "Q1084") {             // nouns
        table_html = await Q1084(entity);

    } else if (Category === "Q24905") {     // verbs
        table_html = await Q24905(entity);

    } else if (Category === "Q34698") {     // adjectives
        table_html = await Q34698(entity);

    } else if (typeof window[Category] === "function") {
        table_html = await window[Category](entity);

    } else {
        table_html = await Q34698(entity);
        // table_html = `<div class='alert alert-warning'>هذا النوع ${pos}-${Category} غير مدعوم</div>`;
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
