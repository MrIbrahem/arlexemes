
function filter_forms(forms) {

    let to_dis_tags = {
        "مصدر": ["Q1923028"],
        "المصدر": ["Q1350145"],
        "اِسْم الْمَفْعُول": ["Q72249544"],
        "اِسْم الْفَاعِل": ["Q72249355"],
        "المضارع": ["non-past"],
        "إضافة": ["construct"],
        "مؤنث": ["Q1775415"],
        "مذكر": ["Q499327"],
        "بديل": ["alternative"],
        "جمع": ["Q146786"],
        "فعل مشتق": ["Q106614340"],
        "جمع مؤنث": ["Q1775415", "Q146786"],
        "جمع مذكر": ["Q499327", "Q146786"],
    };

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

async function fetchLexemeById(id, entity, no_head = false) {

    let lemma = entity.lemma || "(غير متوفر)";
    if (entity.lemmas) {
        lemma = Object.values(entity.lemmas || {}).map(l => l.value).filter(Boolean).join(" / ") || "(غير متوفر)";
    }

    let Category = entity.lexicalCategory ?? "";

    let forms = entity.forms || [];
    // ---
    console.log("len forms:", forms.length);
    // ---
    forms = filter_forms(forms);

    entity.forms = forms;

    let forms_len = forms.length;
    // ---
    let header_main = `
        <div class="col">
            <span class="h4">المفردات:  ${forms_len}</span>
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
                <a href="https://wikidata.org/entity/${id}" target="_blank" class="text-primary font-sm">${lemma}</a>
                </span>
                <span class="h4">المفردات: ${forms_len}</span>
            </div>
        `;
    }
    // ---
    let html = `
        <div class="row mb-4">
            ${header_main}
        </div>
    `;
    let table_html = "";
    if (Category === "Q24905") {     // verbs
        table_html = await Q24905(entity);

    } else {
        table_html = await adj_and_nouns(Category, entity);
    }
    if (table_html) {
        html += table_html;
    } else {
        html += `<div class='alert alert-warning'>لا يوجد بيانات</div>`
    }
    return html;
}

async function getentity(id) {
    let entity;
    let output = document.getElementById("output");
    const url = `https://www.wikidata.org/w/api.php?action=wbgetentities&format=json&ids=${id}&origin=*`;

    try {
        const res = await fetch(url);
        let data = await res.json();

        let entities = data?.entities || {};
        entity = entities[id] || null;
        if (!entity) {
            output.innerHTML = "<div class='alert alert-danger'>لم يتم العثور على الكيان المطلوب.</div>";
            return [];
        }

    } catch (err) {
        console.error(err);
        output.innerHTML = "<div class='alert alert-danger'>حدث خطأ أثناء جلب البيانات.</div>";
    }

    return entity;
}

async function start_lexeme(id, no_head = false) {
    // const id = document.getElementById("lexemeId").value.trim();
    // if (!id) return;

    const output = document.getElementById("output");
    output.innerHTML = "<div class='alert alert-info'>جاري تحميل البيانات...</div>";

    let entity = await getentity(id);

    let html = await fetchLexemeById(id, entity, no_head = no_head);

    output.innerHTML = html;

}
