
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
            ?item1 ?item1Label ?category1Label ?p31_1Label
            ?item2 ?item2Label ?category2Label ?p31_2Label
            WHERE {
            {
                SELECT DISTINCT
                ?item1 ?item2 ?lemma
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
                LIMIT 100
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
    // wdresult هو مصفوفة أزواج

    // هنا ليست حاجة لتجميع مثل السابق، لأن كل صف يمثل زوج مكرر
    // لكن لو أردت يمكنك تجميع الأزواج حسب lemma مثلاً:

    let dataByLemma = {};

    wdresult.forEach(pair => {
        const lemma = pair.lemma.value || pair.lemma;
        if (!dataByLemma[lemma]) {
            dataByLemma[lemma] = [];
        }
        dataByLemma[lemma].push(pair);
    });

    // لو تريد فقط الأزواج التي لها lemma مكرر (أي lemma بعدد أزواج أكثر من 1)
    let dup_lemmas = Object.values(dataByLemma).filter(arr => arr.length > 1);

    return dup_lemmas.length > 0 ? dup_lemmas : Object.values(dataByLemma);
}

async function render_tables_container(data) {
    $('#tables_container').html('');
    // ---
    let groupIndex = 0;
    // ---
    data.forEach(group => {
        groupIndex++;

        let html = `<h5>المجموعة رقم ${groupIndex} - (lemma: ${group[0].lemma.value || group[0].lemma})</h5>`;

        group.forEach((pair, pairIndex) => {
            const getVal = (field) => pair[field]?.value || pair[field] || '';

            // تجهيز قيم العنصر الأول
            const item1Label = getVal('item1Label');
            const item1Id = getVal('item1');
            const category1 = getVal('category1Label');
            const p31_1 = getVal('p31_1Label');
            const lemma = getVal('lemma');

            // تجهيز قيم العنصر الثاني
            const item2Label = getVal('item2Label');
            const item2Id = getVal('item2');
            const category2 = getVal('category2Label');
            const p31_2 = getVal('p31_2Label');

            html += `
            <table border="1" cellpadding="5" cellspacing="0" style="margin-bottom:20px; width:100%; direction: rtl; text-align: right;" class="table compact table-striped table-bordered table_text_right display w-100">
                <thead>
                    <tr>
                        <th>خاصية</th>
                        <th>العنصر 1</th>
                        <th>العنصر 2</th>
                    </tr>
                </thead>
                <tbody>
                    <tr><td>Lemma</td><td>${lemma}</td><td>${lemma}</td></tr>
                    <tr><td>Item ID</td><td><a href="https://www.wikidata.org/entity/${item1Id}" target="_blank">${item1Id}</a></td><td><a href="https://www.wikidata.org/entity/${item2Id}" target="_blank">${item2Id}</a></td></tr>
                    <tr><td>Label</td><td>${item1Label}</td><td>${item2Label}</td></tr>
                    <tr><td>Category</td><td>${category1}</td><td>${category2}</td></tr>
                    <tr><td>P31</td><td>${p31_1}</td><td>${p31_2}</td></tr>
                </tbody>
            </table>
            `;
        });
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
