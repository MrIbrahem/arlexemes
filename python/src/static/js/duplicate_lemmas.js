
let LocalpropLabels = {
    "P5187": "أصل الكلمة",
    "P5186": "التصريف",
    "P31": "فئة",
    "P5920": "الجذر",
    "P5185": "الجنس النحوي",
    "P11038": "الأنطولوجيا",
    "P12900": "ARABTERM",
    "P12901": "الهوراماني",
}

function convertData(data) {
    const newData = {};

    for (const x of data) {
        const lemma = x["lemma"] || "";
        // ---
        if (!newData[lemma]) {
            newData[lemma] = { items: {}, proplabels: {} };
        }
        // ---
        const item1 = x["1_item"] || "";
        const item2 = x["2_item"] || "";
        // ---
        if (!newData[lemma]["items"][item1]) {
            newData[lemma]["items"][item1] = { category: {}, props: {} };
        }
        if (!newData[lemma]["items"][item2]) {
            newData[lemma]["items"][item2] = { category: {}, props: {} };
        }
        // ---
        const item1Category = x["1_categoryLabel"] || "";
        const item2Category = x["2_categoryLabel"] || "";
        // ---
        if (item1Category) {
            newData[lemma]["items"][item1]["category"] = item1Category;
        }
        // ---
        if (item2Category) {
            newData[lemma]["items"][item2]["category"] = item2Category;
        }
        // ---
        const p = x["p"] || "";
        const pLabel = x["pLabel"] || "";
        // ---
        if (!p) {
            continue;
        }
        // ---
        if (pLabel) {
            if (!newData[lemma]["proplabels"][p]) {
                newData[lemma]["proplabels"][p] = pLabel;
            }
        }
        // ---
        if (!newData[lemma]["items"][item1]["props"][p]) {
            newData[lemma]["items"][item1]["props"][p] = { value: "", valuelabel: "" };
        }
        if (!newData[lemma]["items"][item2]["props"][p]) {
            newData[lemma]["items"][item2]["props"][p] = { value: "", valuelabel: "" };
        }
        // ---
        const propValue1 = x["1_p_value"] || "";
        const propValue1Label = x["1_p_valueLabel"] || "";
        // ---
        if (propValue1) {
            newData[lemma]["items"][item1]["props"][p]["value"] = propValue1;
        }
        // ---
        if (propValue1Label) {
            newData[lemma]["items"][item1]["props"][p]["valuelabel"] = propValue1Label;
        }
        // ---
        const propValue2 = x["2_p_value"] || "";
        const propValue2Label = x["2_p_valueLabel"] || "";
        if (propValue2) {
            newData[lemma]["items"][item2]["props"][p]["value"] = propValue2;
        }
        // ---
        if (propValue2Label) {
            newData[lemma]["items"][item2]["props"][p]["valuelabel"] = propValue2Label;
        }
    }
    // ---
    return newData;
}

async function get_wdresult(same_category = false) {
    let same_category_filter = "";
    // ---
    if (same_category) {
        same_category_filter = "FILTER(?1_category = ?2_category)";
    }
    // ---
    const sparqlQuery = `
        SELECT
            ?lemma
            ?1_item ?1_categoryLabel
            ?2_item ?2_categoryLabel

            ?p ?pLabel
            ?1_p_value ?1_p_valueLabel
            ?2_p_value ?2_p_valueLabel

            WHERE {
            {
                SELECT DISTINCT *
                #?1_item ?2_item ?lemma ?1_category ?2_category
                        WHERE
                        {
                        # values ?lemma {"أنتما"@ar }
                        ?1_item rdf:type ontolex:LexicalEntry ;
                                wikibase:lemma ?lemma ;
                                wikibase:lexicalCategory ?1_category;
                                dct:language wd:Q13955 .
                        ?2_item rdf:type ontolex:LexicalEntry ;
                                wikibase:lemma ?lemma ;
                                wikibase:lexicalCategory ?2_category;
                                dct:language wd:Q13955 .
                        FILTER(?1_item != ?2_item && STR(?1_item) < STR(?2_item))
                        ${same_category_filter}
                        {
                            ?1_item ?pz ?1_p_value.
                            ?2_item ?pz ?2_p_value.
                            FILTER(STRSTARTS(STR(?pz), STR(wdt:)))
                            BIND(IRI(REPLACE(STR(?pz), STR(wdt:), STR(wd:))) AS ?p)
                        }
                        UNION {
                            ?2_item ?pz ?2_p_value.
                            FILTER(STRSTARTS(STR(?pz), STR(wdt:)))
                            BIND(IRI(REPLACE(STR(?pz), STR(wdt:), STR(wd:))) AS ?p)
                        }
                        UNION {
                            ?1_item ?pz ?1_p_value.
                            FILTER(STRSTARTS(STR(?pz), STR(wdt:)))
                            BIND(IRI(REPLACE(STR(?pz), STR(wdt:), STR(wd:))) AS ?p)
                        }
                        }
                LIMIT 1000
            }

            SERVICE wikibase:label { bd:serviceParam wikibase:language "ar,en". }
            }
            ORDER BY ?lemma
    `;
    // ---
    add_sparql_url(sparqlQuery);
    // ---
    let result = await loadsparqlQuery(sparqlQuery);
    // ---
    return result;
}

async function get_data_dup(same_category) {
    let wdresult = await get_wdresult(same_category);
    // ---
    console.table(wdresult);
    // ---
    wdresult = convertData(wdresult);
    // ---
    const sortedData = {};
    // ---
    Object.keys(wdresult)
        .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase(), 'ar'))
        .forEach(lemma => {
            sortedData[lemma] = wdresult[lemma];
        });
    // ---
    return sortedData;
}

function getVal(props, p) {
    // ---
    let properties_formts = {
        "P12900": "http://www.arabterm.org/index.php?id=40&L=1&tx_3m5techdict_pi1[id]=$1",
        "P12901": "http://arabiclexicon.hawramani.com/?p=$1",
        "P11038": "https://ontology.birzeit.edu/lemma/$1",
    }
    // ---
    let valuelabel = props?.valuelabel || "";
    let value = props?.value || "";
    // ---
    if (valuelabel == value) valuelabel = ""
    // ---
    let result = (valuelabel ? `${valuelabel} (${value})` : "") || value || '';
    // ---
    if (value === "") {
        return result;
    }
    // ---
    if (properties_formts[p]) {
        result = `
        <a href="${properties_formts[p].replace("$1", value)}" target="_blank">
            ${value}
        </a>`;
    } else if (value.match(/Q\d+/) || value.match(/L\d+/)) {
        // ---
        let label = "";
        // ---
        if (valuelabel !== "") {
            label = `${valuelabel} (${value})`;
        } else {
            label = `<span find-label="${value}" find-label-both="true">${value}</span>`;
        }
        // ---
        result = `<a target="_blank" href="https://www.wikidata.org/entity/${value}">${label}</a>`;
    }
    // ---
    return result;
}
async function render_tables_container(data) {
    $('#tables_container').html('');
    let groupIndex = 0;

    // ترتيب الـ lemma حسب الترتيب الأبجدي
    const sortedLemmas = Object.keys(data).sort();

    sortedLemmas.forEach(lemma => {
        groupIndex++;

        const group = data[lemma];
        const items = Object.keys(group.items);
        if (items.length < 2) return; // تأكد من وجود عنصرين على الأقل

        const item1Id = items[0];
        const item2Id = items[1];

        const item1 = group.items[item1Id];
        const item2 = group.items[item2Id];

        const sharedProps = Object.keys(item1.props).filter(p => item2.props[p]);

        // --- إعداد التسميات
        const propLabels = group.proplabels || {};
        // --- بناء صفوف الجدول
        let rows = '';
        // ---
        sharedProps.forEach(p => {
            const plabel = LocalpropLabels[p] || propLabels[p] || "";
            const label = plabel ? `${plabel} (${p})` : p;
            const val1 = getVal(item1.props[p], p);
            const val2 = getVal(item2.props[p], p);
            rows += `
                <tr>
                    <th>
                        <a target="_blank" href="https://wikidata.org/entity/${p}">${label}</a>
                    </th>
                    <td>${val1}</td>
                    <td>${val2}</td>
                </tr>`;
        });

        // --- HTML النهائي
        const html = `
            <div class="card mb-3">
                <div class="card-header">
                    <h2>${groupIndex} - ${lemma}</h2>
                </div>
                <div class="card-body">
                    <table class="table compact table-striped table-bordered table_text_right display w-100">
                        <thead>
                            <tr>
                                <th class="w-25">خاصية</th>
                                <th>الأول:
                                    <a href="https://www.wikidata.org/entity/${item1Id}" target="_blank">${item1Id}</a> (${item1.category || ''})
                                </th>
                                <th>الثاني:
                                    <a href="https://www.wikidata.org/entity/${item2Id}" target="_blank">${item2Id}</a> (${item2.category || ''})
                                </th>
                            </tr>
                        </thead>
                        <tbody>${rows}</tbody>
                    </table>
                </div>
            </div>`;

        $('#tables_container').append(html);
    });
}

async function load_duplicate() {
    // ---
    let same_category = get_param_from_window_location("same_category", false);
    // ---
    if (same_category) {
        // <input class="form-check-input" type="checkbox" id="same_category" name="same_category" value="1"></input>
        $("#same_category").prop("checked", true);
    }
    // ---
    let data = await get_data_dup(same_category);
    // ---
    HandelDataError(data);
    // ---
    await render_tables_container(data);
    // ---
    await find_labels();
    // ---
    $(`.table`).DataTable({
        searching: false,
        paging: false,
        info: false,
        responsive: false
    });
}
