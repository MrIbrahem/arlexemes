
function get_body(html) {
    // ---
    const parser = new DOMParser();
    // ---
    const doc = parser.parseFromString(html, 'text/html');
    // ---
    // any href="./سورة_البقرة" should be like: https://ar.wikipedia.org/سورة_البقرة
    // ---
    doc.querySelectorAll('a[href^="./"]').forEach(link => {
        const href = link.getAttribute('href');
        link.setAttribute('href', `https://ar.wikipedia.org/wiki/${href}`);
    });
    // ---
    let body = doc.body.innerHTML; // أو doc.body.outerHTML
    // ---
    return body;
}
async function convertContent(input) {
    let endPoint = 'https://ar.wikipedia.org/w/rest.php/v1/transform/wikitext/to/html/Sandbox';

    let params = {
        "wikitext": input
    }

    const response = await fetch(endPoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)
    });
    const text = await response.text() || "";

    if (!text || text === "") {
        return "";
    }
    return text;
}

async function get_ref_from_wikipedia(qid, form_id) {
    // إنشاء النص الويكي
    const wikitext = `{{#invoke:ملعب/Mr. Ibrahem/Render|render_json|${qid}|${form_id}|P5831}}`;

    const params = {
        action: "expandtemplates",
        text: wikitext,
        format: "json",
        origin: "*",
        formatversion: "2"
    };

    const url = "https://ar.wikipedia.org/w/api.php" + "?" + new URLSearchParams(params);

    try {
        const response = await fetch(url);
        const data = await response.json();
        return data.expandtemplates.wikitext;
    } catch (error) {
        console.error("فشل في استدعاء API:", error);
        return null;
    }
}

async function render_source(qid, form_id, index) {
    // ---
    const wikitext = await get_ref_from_wikipedia(qid, form_id);
    if (!wikitext) return ""; // تأكد من وجود النص
    // ---
    let data;
    try {
        data = JSON.parse(wikitext);
    } catch (e) {
        console.error("فشل تحليل JSON:", e);
        return "خطأ في تحميل المصدر";
    }
    // ---
    const index_source = data[index];
    if (!index_source || typeof index_source !== "object") {
        return "";
    }
    // ---
    // تحويل كائن الخصائص إلى مصفوفة من القيم
    const result = Object.values(index_source).map(item => {
        const value = item.value || "";
        const label = item.label || "";
        return `<span class="">${label}</span>: ${value}</span>`;
    });
    // ---
    let newwikitext = "<span class='fw-bold'>المصدر:</span>" + result.join("، ");
    // ---
    let html = await convertContent(newwikitext);
    // ---
    if (!html || html === "") return newwikitext;
    // ---
    html = get_body(html);
    // ---
    return html;
}

function getLanguageName(code, targetLanguage = 'ar') {
    try {
        return new Intl.DisplayNames([targetLanguage], { type: 'language' }).of(code);
    } catch (error) {
        console.warn(`رمز اللغة غير صالح: ${code}`);
        return "";
    }
}
function examples_div(item, index, formId) {
    // ---
    let text = item?.mainsnak?.datavalue?.value?.text || '';
    let language = item?.mainsnak?.datavalue?.value?.language || '';
    // ---
    if (language !== "") {
        language = getLanguageName(language);
    }
    // ---
    let references = item?.references || [];
    // ---
    let [qid, form_id] = formId.split("-");
    // ---
    let ref = (references.length > 0) ? `
            <div class="text-end">
                <span data-qid="${qid}" data-form-id="${form_id}" data-index="${index}" class="example-ref">
                المصدر: <i class="spinner-border spinner-border-sm"></i>
                </span>
            </div>
        ` : "";
    // ---
    return `
            <div style="margin-bottom: 8px;">
                <span style="font-size: 1.5rem;">
                    <!-- مثال ${index + 1}  -->
                    (${language}): ${text}
                </span>
                ${ref}
            </div>
    `;
}
function createExampleIconAndModal(exampleList, formId, iconPosition = "top:2px; right:2px;") {
    // ---
    if (exampleList.length === 0) return '';
    // ---
    let rand_id = Math.random().toString(36).substring(7);
    let modalId = `exampleModal_${rand_id}`;
    // ---
    // تحويل جميع الأمثلة إلى HTML
    let examples = exampleList.map((item, index) => examples_div(item, index + 1, formId)).join('<hr>');
    // ---
    return `
        <span class="example-icon" data-bs-toggle="modal" data-bs-target="#${modalId}"
            style="position:absolute; ${iconPosition}; cursor:pointer; color:#0d6efd;">
            <i class="bi bi-info-circle-fill"></i>
        </span>
        <div class="modal fade" id="${modalId}" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <!-- <h5 class="modal-title">أمثلة</h5> -->
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body text-start">
                        ${examples}
                    </div>
                </div>
            </div>
        </div>
    `;
    // ---
}

async function loadReferencesAfterPageLoad() {
    const refElements = document.querySelectorAll(".example-ref");

    if (refElements.length === 0) {
        console.log("لا توجد عناصر مصدرية لتحميلها.");
        return;
    }

    // نعالج كل عنصر على حدة
    for (const el of refElements) {
        const qid = el.getAttribute("data-qid");
        const formId = el.getAttribute("data-form-id");
        const index = el.getAttribute("data-index");

        console.log("load ref:", index, qid, formId);

        try {
            const sourceHtml = await render_source(qid, formId, index);
            el.innerHTML = sourceHtml;
        } catch (error) {
            el.innerHTML = "";
            console.error("loadReferencesAfterPageLoad error: ", qid, formId, error);
        }
    }

    console.log("تم الانتهاء من تحميل جميع المصادر.");
}
