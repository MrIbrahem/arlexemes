
let urls_types = {
    // "P": "https://www.wikidata.org/w/rest.php/wikibase/v1/entities/properties/$1/labels", // {"ar": "", "en": ""}
    "Q": "https://www.wikidata.org/w/rest.php/wikibase/v1/entities/items/$1/labels",     // {"ar": "", "en": ""}
    "L": "https://www.wikidata.org/wiki/Special:EntityData/$1.json",                      // entities.lemmas
};

async function find_labels() {
    const spans = document.querySelectorAll("span[find-label]");
    console.log(`find_labels: ${spans.length}`);

    spans.forEach(async (span) => {
        const qid = span.getAttribute("find-label");
        const both = span.getAttribute("find-label-both");
        const noCache = span.getAttribute("no-cache");
        if (!qid) return;

        const cached = localStorage.getItem(`wikidata-label-2-${qid}`);
        if (cached && !noCache) {
            span.textContent = cached;
            return;
        }

        try {
            const prefix = qid.charAt(0).toUpperCase();
            const urlTemplate = urls_types[prefix] || urls_types["L"];
            const url = urlTemplate.replace("$1", qid);

            let urls_load = $("#urls_load");
            if (urls_load.length) {
                let link = `<a href="${url}" target="_blank">${url}</a>`;
                urls_load.append(`<li>${link}</li>`);
            }

            const response = await fetch(url);
            if (!response.ok) throw new Error("فشل في جلب البيانات");

            const data = await response.json();

            let labelAr;

            if (urls_types[prefix] && (prefix === "Q" || prefix === "P")) {
                labelAr = data?.ar || data?.en || data?.mul || qid;
            } else {
                const entity = data.entities[qid];
                if (entity?.type === "lexeme") {
                    labelAr = Object.values(entity.lemmas || {})
                        .map(l => l.value)
                        .filter(Boolean)
                        .join(" / ") || "(غير متوفر)";
                } else {
                    let labels = entity?.labels || {};
                    labelAr = labels?.ar?.value || labels?.en?.value || labels?.mul?.value ||  "(غير متوفر)";
                }
            }

            if (labelAr) {
                const labelFinal = both ? `${labelAr} (${qid})` : labelAr;
                span.textContent = labelFinal;
                localStorage.setItem(`wikidata-label-2-${qid}`, labelFinal);
            }

        } catch (error) {
            console.error(`خطأ في جلب الاسم لـ ${qid}:`, error);
        }
    });
}

async function find_labels_old() {
    const spans = document.querySelectorAll("span[find-label]");
    console.log(`find_labels: ${spans.length}`)
    spans.forEach(async (span) => {
        const qid = span.getAttribute("find-label");
        const both = span.getAttribute("find-label-both");
        const noCache = span.getAttribute("no-cache");
        if (!qid) return;

        // حاول الحصول على الاسم من localStorage أولاً
        const cached = localStorage.getItem(`wikidata-label-2-${qid}`);
        if (cached && !noCache) {
            span.textContent = cached;
            return;
        }

        try {
            const url = `https://www.wikidata.org/wiki/Special:EntityData/${qid}.json`;
            let urls_load = $("#urls_load");
            if (urls_load.length) {
                let link = `<a href="${url}" target="_blank">${qid}</a>`;
                urls_load.append(`<li>${link}</li>`);
            }

            const response = await fetch(url);
            if (!response.ok) throw new Error("فشل في جلب البيانات");

            const data = await response.json();
            const entity = data.entities[qid];
            let type = entity.type || "item";

            let labelAr = entity.labels?.ar?.value;

            if (type === "lexeme") {
                labelAr = Object.values(entity.lemmas || {}).map(l => l.value).filter(Boolean).join(" / ") || "(غير متوفر)";
            }

            if (labelAr) {
                let labelAr2 = (both) ? `${labelAr} (${qid})` : labelAr;

                span.textContent = labelAr2;
                // خزن الاسم في localStorage
                localStorage.setItem(`wikidata-label-2-${qid}`, labelAr2);
            }
        } catch (error) {
            console.error(`خطأ في جلب الاسم لـ ${qid}:`, error);
        }
    });
}

