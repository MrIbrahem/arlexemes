async function find_labels() {
    const spans = document.querySelectorAll("span[find-label]");
    console.log(`find_labels: ${spans.length}`)
    spans.forEach(async (span) => {
        const qid = span.getAttribute("find-label");
        if (!qid) return;

        // حاول الحصول على الاسم من localStorage أولاً
        const cached = localStorage.getItem(`wikidata-label-${qid}`);
        if (cached) {
            span.textContent = cached;
            return;
        }

        try {
            const url = `https://www.wikidata.org/wiki/Special:EntityData/${qid}.json`;
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
                span.textContent = labelAr;
                // خزن الاسم في localStorage
                localStorage.setItem(`wikidata-label-${qid}`, labelAr);
            }
        } catch (error) {
            console.error(`خطأ في جلب الاسم لـ ${qid}:`, error);
        }
    });
}
