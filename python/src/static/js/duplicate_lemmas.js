
async function get_wdresult(same_category = false) {
    let same_category_filter = "";
    // ---
    if (same_category) {
        same_category_filter = "FILTER(?category1 = ?category2)";
    }
    // ---
    const sparqlQuery = `
        SELECT
            ?lemma
            ?item1 ?category1Label ?p31_1Label
            ?item2 ?category2Label ?p31_2Label
            WHERE {
            {
                SELECT DISTINCT
                ?item1 ?item2 ?lemma ?category1 ?category2
                    WHERE
                    {
                        ?item1 rdf:type ontolex:LexicalEntry ;
                                wikibase:lemma ?lemma ;
                                wikibase:lexicalCategory ?category1;
                                dct:language wd:Q13955 .
                        ?item2 rdf:type ontolex:LexicalEntry ;
                                wikibase:lemma ?lemma ;
                                wikibase:lexicalCategory ?category2;
                                dct:language wd:Q13955 .
                        FILTER(?item1 != ?item2 && STR(?item1) < STR(?item2))
                        ${same_category_filter}
                    }
                LIMIT 1000
            }
            OPTIONAL { ?item1 wdt:P31 ?p31_1. }
            OPTIONAL { ?item2 wdt:P31 ?p31_2. }

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

    // ترتيب الصفوف حسب lemma.value
    wdresult.sort((a, b) => {
        const lemmaA = (a.lemma?.value || a.lemma || '').toLowerCase();
        const lemmaB = (b.lemma?.value || b.lemma || '').toLowerCase();
        return lemmaA.localeCompare(lemmaB, 'ar');
    });

    // إرجاع النتائج مباشرة
    return wdresult;
}


async function render_tables_container(data) {
    // ---
    $('#tables_container').html('');
    // ---
    let groupIndex = 0;
    // ---
    data.forEach(pair => {
        groupIndex++;

        const getVal = (field) => pair[field]?.value || pair[field] || '';

        // تجهيز قيم العنصر الأول
        const item1Id = getVal('item1');
        const category1 = getVal('category1Label');
        const p31_1 = getVal('p31_1Label');
        const lemma = getVal('lemma');

        // تجهيز قيم العنصر الثاني
        const item2Id = getVal('item2');
        const category2 = getVal('category2Label');
        const p31_2 = getVal('p31_2Label');

        let html = `
            <div class="card mb-3">
                <div class="card-header">
                    <h2 >${groupIndex} - ${pair.lemma.value || pair.lemma}</h2>
                </div>
                <div class="card-body">
                    <table class="table compact table-striped table-bordered table_text_right display w-100">
                        <thead>
                            <tr>
                                <th class="w-25">خاصية</th>
                                <th>الأول: <a href="https://www.wikidata.org/entity/${item1Id}" target="_blank">${item1Id}</a></th>
                                <th>الثاني: <a href="https://www.wikidata.org/entity/${item2Id}" target="_blank">${item2Id}</a></th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <th>التصنيف المعجمي</th>
                                <td>${category1}</td>
                                <td>${category2}</td>
                            </tr>
                            <tr>
                                <th>P31</th>
                                <td>${p31_1}</td>
                                <td>${p31_2}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

        `;
        // ---
        $('#tables_container').append(html);
    });
    // ---
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
    $(`.table`).DataTable({
        searching: false,
        paging: false,
        info: false,
        responsive: false
    });
}
