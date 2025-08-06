
async function get_wdresult() {
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
    // ---
    add_sparql_url(sparqlQuery);
    // ---
    let result = await loadsparqlQuery(sparqlQuery);

    let wd_result = [];

    for (const item of result) {
        wd_result.push(item);
    }
    // ---
    return result;
}

async function get_data_dup() {
    // ---
    let wdresult = await get_wdresult();
    let treeData1 = Object.values(wdresult);
    // ---
    let data = [];
    // ---
    // treeData1.forEach(category => {
    treeData1.forEach(wditem => {
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
    // })
    // ---
    let dup_lemmas = [];
    // جمع المكررات فقط
    for (const key in data) {
        if (data[key].length > 1) {
            dup_lemmas.push(data[key]);
        }
    }
    // ---
    return dup_lemmas;
}

async function load_duplicate() {
    let data = await get_data_dup();
    // ---
    HandelDataError(data);

    // تفريغ الحاوية الأساسية أولاً
    $('#tables_container').html('');

    let groupIndex = 0;
    data.forEach(group => {
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

}

