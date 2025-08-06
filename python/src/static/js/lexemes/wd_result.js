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

function parse_results(result) {
    let wd_result = {};

    for (const item of result) {
        let to_group = item['categoryLabel'] || '!';

        if (!wd_result[to_group]) {
            // ---
            wd_result[to_group] = {
                group_by: to_group,
                qid: item['category'],
                items: []
            };
        }
        // ---
        wd_result[to_group].items.push(item);
    }
    // ---
    wd_result = Object.fromEntries(Object.entries(wd_result).sort(([, a], [, b]) => b.items.length - a.items.length));
    // ---
    return wd_result;
}

async function load_wd(limit, data_source, sort_by) {
    const sparqlQuery1 = `
        VALUES ?category {
            wd:Q111029	# جذر
            wd:Q1084	# اسم
            wd:Q24905	# فعل
            wd:Q34698	# صفة
        }
    `;
    // ---
    let VALUES = ``;
    // ---
    // if data_source match Q\d+
    if (data_source !== "" && data_source.match(/Q\d+/)) {
        VALUES = `VALUES ?category { wd:${data_source} }`;
    }
    // ---
    let ORDER = "ORDER BY DESC(?count)";
    // ---
    if (sort_by === "id") {
        ORDER = "ORDER BY DESC(xsd:integer(STRAFTER(STR(?item), '/entity/L')))";
    }
    // ---
    let sparqlQuery = `
        SELECT DISTINCT
            ?item
            (SAMPLE(?lemma1) AS ?lemma)
            (GROUP_CONCAT(DISTINCT ?lemma1; separator=' / ') AS ?lemmas)
            ?category ?categoryLabel
            ?P31 ?P31Label
            (count(?form) as ?count)
        WHERE {
            ${VALUES}
            ?item rdf:type ontolex:LexicalEntry;
                wikibase:lemma ?lemma1;
                wikibase:lexicalCategory ?category;
                dct:language wd:Q13955.

            optional {?item ontolex:lexicalForm ?form}
            optional {?item wdt:P31 ?P31}
            SERVICE wikibase:label { bd:serviceParam wikibase:language "ar, en". }
        }
        group by ?item ?category ?categoryLabel ?P31 ?P31Label
        ${ORDER}
    `;
    if (limit && isFinite(limit)) {
        sparqlQuery += ` LIMIT ${limit} `;
    }
    let result = await loadsparqlQuery(sparqlQuery);

    let wd_result = parse_results(result);

    return wd_result;
}

async function make_wd_result(limit, data_source, sort_by) {
    let wd_result = await load_wd(limit, data_source, sort_by);
    // ---
    return wd_result;
}


async function new_ar_lexemes(limit, data_source) {
    // ---
    let VALUES = ``;
    // ---
    // if data_source match Q\d+
    if (data_source !== "" && data_source.match(/Q\d+/)) {
        VALUES = `VALUES ?category { wd:${data_source} }`;
    }
    // ---
    let limit_line = ` LIMIT 100 `;
    // ---
    if (limit && isFinite(limit)) {
        limit_line = ` LIMIT ${limit} `;
    }
    // ---
    let sparqlQuery = `
        SELECT
        ?item
        (SAMPLE(?lemma1) AS ?lemma)
        (GROUP_CONCAT(DISTINCT ?lemma1; separator=" / ") AS ?lemmas)
        ?category ?categoryLabel
        ?P31 ?P31Label
        (COUNT(?form) AS ?count)
        WHERE {
            ${VALUES}
            {
                SELECT ?item
                WHERE {
                ?item rdf:type ontolex:LexicalEntry ;
                        dct:language wd:Q13955 .
                }
                ORDER BY DESC(xsd:integer(STRAFTER(STR(?item), "/entity/L")))
                ${limit_line}
            }

        ?item wikibase:lemma ?lemma1 ;
            wikibase:lexicalCategory ?category .
        OPTIONAL { ?item ontolex:lexicalForm ?form }
        OPTIONAL { ?item wdt:P31 ?P31 }
        SERVICE wikibase:label { bd:serviceParam wikibase:language "ar,en". }
        }
        GROUP BY ?item ?category ?categoryLabel ?P31 ?P31Label
    `;
    // ---
    var url1 = "https://query.wikidata.org/index.html#" + encodeURIComponent(sparqlQuery)
    // ---
    $("#sparql_url").attr("href", url1);
    // remove disabled from class
    $("#sparql_url").removeClass("disabled");
    // ---
    let result = await loadsparqlQuery(sparqlQuery);

    let wd_result = parse_results(result);

    return wd_result;
}

