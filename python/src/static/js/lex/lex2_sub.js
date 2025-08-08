
let colors = {};

function get_color(form) {
    // ---
    // ar-x-Q775724
    let word = form.representations.ar.value;
    // ---
    if (colors[word]) return colors[word];
    // ---
    let index = Object.keys(colors).length + 1;
    // ---
    let color = generateColor(index, 20);
    // ---
    colors[word] = color;
    // ---
    console.log("get_color:", word, color);
    // ---
    return color;
}

function entryFormatterNoColor(form) {
    // ---
    const formId = form?.id || "L000-F0";
    // ---
    // ar-x-Q775724
    let values = Object.values(form.representations || {})
        .map(r => r.value)
        .filter(Boolean)
        .map(v => `<span>${v}</span>`)
        .join(" / ") || `<span>${form?.form}</span>` || "";
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
			<!-- <small>(${formId_number})</small> -->
        </span>
        `;
    }
    // ---
    return link;
}
