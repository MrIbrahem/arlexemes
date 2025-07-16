const categories = [
    "جذر", // wd:Q111029	1409
    "اسم", // wd:Q1084	703
    "فعل", // wd:Q24905	146
    "صفة", // wd:Q34698	114
    "اسم علم", // wd:Q147276	59
    "حرف", // wd:Q9788	29
    "حرف جر", // wd:Q4833830	18
    "ضمير شخصي", // wd:Q468801	16
    "حرف ربط", // wd:Q36484	15
    "اسم عدد", // wd:Q63116	13
    "أداة استفهام", // wd:Q2304610	11
    "الجملة الاسمية", // wd:Q1401131	9
    "عبارة اسمية", // wd:Q29888377	9
    "ظرف", // wd:Q380057	5
    "Q576271", // wd:Q576271	4
    "Q65279776", // wd:Q65279776	4
    "كلمة وظيفية", // wd:Q2120608	3
    "اسم موصول", // wd:Q1050744	3
    "التعجب", // wd:Q83034	2
    "Q10319520", // wd:Q10319520	2
    "حرف معنى", // wd:Q184943	2
    "Q1167104", // wd:Q1167104	1
    "عدد", // wd:Q11563	1
    "أداة تعريف", // wd:Q2865743	1
    "Q361669", // wd:Q361669	1
    "الاسم الوظيفي", // wd:Q503992	1
    "Q124288191", // wd:Q124288191	1
    "Q124312584", // wd:Q124312584	1
    "Q2146100", // wd:Q2146100	1
    "Q2339337", // wd:Q2339337	1
    "ضمير إشارة", // wd:Q34793275	1
    "ضمير", // wd:Q36224	1
    "Q28833099", // wd:Q28833099	1
    "شبه جملة", // wd:Q187931	1
    "Q10319522", // wd:Q10319522	1
    "Q7075064", // wd:Q7075064	1
]

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

async function load_wd() {
    const sparqlQuery1 = `
        VALUES ?category {
            wd:Q111029	# جذر
            wd:Q1084	# اسم
            wd:Q24905	# فعل
            wd:Q34698	# صفة
        }
    `;
    const sparqlQuery = `
        SELECT DISTINCT ?item ?lemma ?category ?categoryLabel ?P31 ?P31Label (count(?form) as ?count) WHERE {

        ?item rdf:type ontolex:LexicalEntry;
                wikibase:lemma ?lemma;
                wikibase:lexicalCategory ?category;
                dct:language wd:Q13955.

        optional {?item ontolex:lexicalForm ?form}
        optional {?item wdt:P31 ?P31}
        SERVICE wikibase:label { bd:serviceParam wikibase:language "ar, en". }
        }
        group by ?item ?lemma ?category ?categoryLabel ?P31 ?P31Label
        ORDER BY DESC(?count)
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
        let to_group = new_item['categoryLabel'] || '!';

        if (!wd_result[to_group]) {
            // ---
            wd_result[to_group] = {
                group_by: to_group,
                qid: new_item['category'],
                items: []
            };
        }
        // ---
        wd_result[to_group].items.push(new_item);
    }
    // ---
    wd_result = Object.fromEntries(Object.entries(wd_result).sort(([, a], [, b]) => b.items.length - a.items.length));
    // ---
    return wd_result;
}

async function get_wd_result(group_by) {
    let wd_result = await load_wd();
    // ---
    return wd_result;
}
