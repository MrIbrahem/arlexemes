
let duplicate_lemmas = [];

async function loadsparqlQuery(sparqlQuery) {

    const endpoint = 'https://query.wikidata.org/sparql';
    const fullUrl = endpoint + '?format=json&query=' + encodeURIComponent(sparqlQuery);
    const headers = { 'Accept': 'application/sparql-results+json' };
    let data;
    try {
        const response = await fetch(fullUrl, { headers });
        data = await response.json();
    } catch (e) {
        console.error(`catch: `, e);
        return {};
    }
    if (typeof data === 'object' && data !== null) {
        return data;
    } else {
        console.error(`loadsparqlQuery: `, data);
        return {};
    }
}

async function load_wb(to_group_by = "categoryLabel") {
    const sparqlQuery = `
    SELECT ?item ?lemma ?category ?categoryLabel ?P31Label WHERE {
        ?item rdf:type ontolex:LexicalEntry;
            wikibase:lemma ?lemma;
            wikibase:lexicalCategory ?category;
            dct:language wd:Q13955.
        SERVICE wikibase:label { bd:serviceParam wikibase:language "ar,en". }
        OPTIONAL { ?item wdt:P31 ?P31. }
        }
    `;

    let result = await loadsparqlQuery(sparqlQuery);
    let vars = result.head.vars;

    const items = result.results.bindings;

    let wd_result = {};
    for (const item of items) {
        // value of all item keys from vars
        let new_item = {};
        for (const key of vars) {
            let value = item[key]?.value ?? '';
            // if value has /entity/ then value = value.split("/").pop();
            if (value.includes("/entity/")) {
                value = value.split("/").pop();
            }
            new_item[key] = value;
        }

        let to_group = new_item[to_group_by] || '!';

        if (!wd_result[to_group]) {
            // ---
            wd_result[to_group] = {
                group_by: to_group,
                items: []
            };
        }
        // ---
        wd_result[to_group].items.push(new_item);
    }
    // ---
    // sort wd_result keys by values length
    wd_result = Object.fromEntries(Object.entries(wd_result).sort(([, a], [, b]) => b.items.length - a.items.length));
    // ---
    return wd_result;
}

async function get_wdresult(to_group_by = "categoryLabel") {
    // ---
    let result = await load_wb(to_group_by = to_group_by);
    return result;
}

async function load_duplicate() {
    let wdresult = await get_wdresult();
    let treeData1 = Object.values(wdresult);
    // ---
    let data = [];
    // ---
    treeData1.forEach(category => {
        category.items.forEach(wditem => {
            if (data[wditem.lemma]) {
                let old = data[wditem.lemma][0];
                // ---
                if (old.item && wditem.item && wditem.item !== old.item) {
                    console.log(wditem.item, old.item);
                    data[wditem.lemma].push(wditem);
                }
            } else {
                data[wditem.lemma] = [wditem];
            }
        });
    })
    // ---
    let duplicate_lemmas = [];

    // جمع المكررات فقط
    for (const key in data) {
        if (data[key].length > 1) {
            duplicate_lemmas.push(data[key]);
        }
    }

    // تفريغ الحاوية الأساسية أولاً
    $('#tables_container').html('');

    let groupIndex = 0;
    duplicate_lemmas.forEach(group => {
        groupIndex++;

        // جمع كل المفاتيح
        const allKeys = new Set(["#"]);
        group.forEach(row => {
            Object.keys(row).forEach(key => allKeys.add(key));
        });
        const sortedKeys = Array.from(allKeys);

        // تحضير الأعمدة
        const columns = sortedKeys.map(key => ({
            title: key,
            data: key
        }));

        // إنشاء جدول جديد بداخل div خاص
        const tableId = `duplicate_table_${groupIndex}`;
        $('#tables_container').append(`
            <h5>المجموعة رقم ${groupIndex}</h5>
            <table id="${tableId}" class="table compact table-striped table-bordered table_text_right display w-100" style="width:100%">
                <thead><tr></tr></thead>
                <tbody></tbody>
            </table>
            <hr/>
        `);

        // توليد البيانات الخاصة بالمجموعة
        let rowsData = [];
        let num = 0;
        group.forEach(lemma => {
            let rowObj = {};
            sortedKeys.forEach(key => {
                if (key === "#") {
                    num++;
                    rowObj[key] = num;
                } else {
                    let value = lemma[key] ?? '';
                    if (value.match(/^Q\d+$/) || value.match(/^L\d+$/)) {
                        value = `<a href="https://www.wikidata.org/entity/${value}" target="_blank">${value}</a>`;
                    }
                    rowObj[key] = value;
                }
            });
            rowsData.push(rowObj);
        });

        // تهيئة الجدول باستخدام DataTable
        $(`#${tableId}`).DataTable({
            data: rowsData,
            columns: columns,
            // order: [[0, 'desc']],
            searching: false,
            paging: false,
            info: false,
            responsive: false
        });
    });

    if (duplicate_lemmas.length) {
        document.getElementById('loading').classList.add('d-none');
    }
    // ---

}

