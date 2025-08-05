let Labels = {
    "P5187": "أصل الكلمة",
    "P5186": "التصريف",
    "P31": "فئة",
    "P5920": "الجذر",
    "P5185": "الجنس النحوي",
    "P11038": "الأنطولوجيا",
    "P12900": "ARABTERM",
    "P12901": "الهوراماني",
}

let only_show = [
    "P11038",
    "P5920",
    "P5185",
]

let properties_formts = {
    "P12900": "http://www.arabterm.org/index.php?id=40&L=1&tx_3m5techdict_pi1[id]=$1",
    "P12901": "http://arabiclexicon.hawramani.com/?p=$1",
    "P11038": "https://ontology.birzeit.edu/lemma/$1",
}

function make_claims(claims) {
    let row = "";
    // ---
    if (!claims) return "";
    // ---
    let filterd_claims = Object.fromEntries(Object.entries(claims).filter(([prop]) => only_show.includes(prop)));
    // ---
    for (const prop in filterd_claims) {
        // ---
        if (!only_show.includes(prop)) continue;
        // ---
        let label = Labels[prop] ? `<span class="fw-bold">${Labels[prop]}</span>` : `<span class="fw-bold" find-label="${prop}">${prop}</span>`;
        let pv = [];
        // ---
        for (const v of filterd_claims[prop]) {
            let value = v.mainsnak.datavalue.value;
            if (typeof value === "object") {
                if (value.id) {
                    value = `
                    <a href="https://wikidata.org/entity/${value.id}" target="_blank">
                        <span find-label="${value.id}">${value.id}</span>
                    </a>`;
                } else if (value.text) {
                    value = `${value.text} (${value.language})`;
                }
            } else if (properties_formts[prop]) {
                value = `
                <a href="${properties_formts[prop].replace("$1", value)}" target="_blank">
                    ${value}
                </a>`;
            }
            pv.push(value);
        }
        // ---
        let pv_value = pv.join("، ");
        row += `
            <div class='col'>
                <a href="https://wikidata.org/entity/${prop}" target="_blank">${label}</a>: ${pv_value}
            </div>
        `;
    }
    // ---
    return row;
}
