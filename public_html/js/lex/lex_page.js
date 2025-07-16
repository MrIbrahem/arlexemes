
function make_to_display(formsToProcess, to_dis) {

    let displayHtml = ""; // تم تغيير اسم المتغير ليكون أكثر وضوحًا لمحتواه

    for (const form of formsToProcess) {
        const formId = form.id;
        const value = form.representations?.ar?.value;
        const feats = form.grammaticalFeatures || [];

        // نمر على كل المفاتيح (QIDs) المعرفة في to_dis
        for (const qid of Object.keys(to_dis)) {
            // نتحقق إذا كانت ميزات الشكل الحالي تتضمن QID هذا
            if (feats.includes(qid)) {
                const label = to_dis[qid]; // نحصل على التسمية العربية المقابلة
                const formIdlink = formId.replace("-", "#");
                const formId_number = formId.split("-")[1]; // استخراج الجزء F-number

                // إضافة HTML المنسق لهذا الشكل ونوعه
                // استخدمنا <div> لفصل أفضل لكل إدخال
                displayHtml += `
                            <div class="col">
                                <strong>${label}:</strong>
                                <a href="https://www.wikidata.org/entity/${formIdlink}" target="_blank">
                                    ${value} <small>(${formId_number})</small>
                                </a>
                            </div>`;

                // إذا كان من المفترض أن يتطابق الشكل مع نوع واحد فقط (مصدر، اسم فاعل، اسم مفعول)،
                // يمكننا استخدام 'break' هنا للانتقال إلى الشكل التالي.
                // إذا كان من الممكن أن يتطابق الشكل مع أنواع متعددة، فأزل 'break'.
                break; // ننتقل إلى الشكل التالي بمجرد العثور على نوع ذي صلة للشكل الحالي
            }
        }
    }
    return displayHtml;
}

function setExample(lexeme) {
    document.getElementById('lexemeId').value = lexeme;
    fetchLexeme();
}

async function getentity(id) {
    let entity;
    let output = document.getElementById("output");
    const url = `https://www.wikidata.org/w/api.php?action=wbgetentities&format=json&ids=${id}&origin=*`;

    try {
        const res = await fetch(url);
        const data = await res.json();

        entity = data.entities[id];
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

async function fetchLexeme() {
    const id = document.getElementById("lexemeId").value.trim();
    if (!id) return;

    const output = document.getElementById("output");
    output.innerHTML = "<div class='alert alert-info'>جاري تحميل البيانات...</div>";

    let entity = await getentity(id);

    const Category = entity.lexicalCategory ?? "";

    const lemma = entity.lemmas?.ar?.value || "(غير متوفر)";
    // add lemma to title of the page

    document.title += ` ${id} - ${lemma}`;
    let lemma2 = fix_it2(lemma);
    $("#header_main").html(`تحليل:
                <a href="https://www.wikidata.org/entity/${id}" target="_blank" class="text-primary font-weight-bold">${lemma}</a>
                (<a href="https://en.wiktionary.org/wiki/${lemma2}" target="_blank" class="text-primary font-sm">en</a>)
            `);

    const lexicalCategory = entity.lexicalCategory ? wdlink(entity.lexicalCategory) : "";
    const language = entity.language ? wdlink(entity.language) : "";
    let forms = entity.forms || [];

    let to_dis = {
        "Q1923028": "مصدر",
        "Q1350145": "المصدر",
        "Q72249544": "اِسْم الْمَفْعُول",
        "Q72249355": "اِسْم الْفَاعِل",
    };
    let to_display = make_to_display(forms, to_dis);

    // filter forms to remove any form has to_dis keys in its grammaticalFeatures
    entity.forms = forms.filter((form) => {
        const feats = form.grammaticalFeatures || [];
        return !feats.some((feat) => Object.keys(to_dis).includes(feat));
    });

    let html = `
                <div class="row mb-4">
                    <div class="col">
                        <strong>التصنيف المعجمي:</strong> ${lexicalCategory}
                    </div>
                    <div class="col">
                        <strong>اللغة:</strong> ${language}
                    </div>
                    ${to_display}
                </div>
                `;


    if (typeof window[Category] === "function") {
        html += await window[Category](entity);
        output.innerHTML = html;
        // $("#main_table").DataTable({ searching: false });
    } else {
        output.innerHTML = "<div class='alert alert-warning'>لم يتم التعامل مع هذا النوع من التصنيف بعد.</div>";
    }
    // ---
    table_filter();
}

function generateColor(index, total) {
    const hue = (index * 360 / total) % 360;
    return `hsl(${hue}, 70%, 85%)`; // لون هادئ فاتح
}

function table_filter() {

    // لكل جدول على حدة
    document.querySelectorAll(".table").forEach(table => {
        const wordMap = new Map();

        // اجمع كل العناصر التي تحتوي على word="..."
        const wordElements = table.querySelectorAll('[word]');
        wordElements.forEach(el => {
            const word = el.getAttribute("word");
            if (!wordMap.has(word)) {
                wordMap.set(word, []);
            }
            wordMap.get(word).push(el);
        });

        // خذ فقط الكلمات المتكررة (أكثر من 1)
        const repeatedWords = Array.from(wordMap.entries()).filter(([_, els]) => els.length > 1);

        // لوّن كل مجموعة بلون مختلف
        repeatedWords.forEach(([word, elements], index) => {
            const color = generateColor(index, repeatedWords.length);
            elements.forEach(el => {
                el.style.backgroundColor = color;
                el.style.borderRadius = "4px";
                el.style.padding = "2px 4px";
            });
        });
    });
}
