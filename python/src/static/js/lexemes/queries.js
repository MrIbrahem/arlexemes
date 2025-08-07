
function most_used_properties_query(data_source) {
    // ---
    let VALUES = ``;
    // ---
    // if data_source match Q\d+
    if (data_source !== "" && data_source.match(/Q\d+/)) {
        VALUES = `VALUES ?category { wd:${data_source} }`;
    }
    // ---
    let query = `
        SELECT ?prop ?usage ?propLabel
            WHERE {
            {
                SELECT
                ?wdtProp

                (COUNT(?item) AS ?usage)
                WHERE {
                ${VALUES}
                ?item dct:language wd:Q13955.
                ?item ?wdtProp ?value.
                FILTER(STRSTARTS(STR(?wdtProp), STR(wdt:)))
                }
                GROUP BY ?wdtProp
            }
            BIND(IRI(REPLACE(STR(?wdtProp), STR(wdt:), STR(wd:))) AS ?prop)
            SERVICE wikibase:label { bd:serviceParam wikibase:language "ar,en". }
            }
        ORDER BY DESC(?usage)
    `;
    // ---
    return query;
}

function wg_tree_query(data_source, to_group_by, limit) {
    // ---
    let VALUES = ``;
    // ---
    if (data_source !== "" && data_source.match(/Q\d+/)) {
        VALUES = `VALUES ?category { wd:${data_source} }`;
    }
    // ---
    let sparqlQuery = `
        SELECT
            ?item
            (GROUP_CONCAT(DISTINCT ?lemma1; separator=' / ') AS ?lemmas)
            ?category ?categoryLabel
            (SAMPLE(?P31_z) AS ?P31) ?P31_zLabel

            WHERE
                {
                    {
                        ${VALUES}
                        ?item rdf:type ontolex:LexicalEntry;
                            wikibase:lemma ?lemma1;
                            wikibase:lexicalCategory ?category;
                            dct:language wd:Q13955.
                        ?item wdt:P31 ?P31_z.
                    }
                    SERVICE wikibase:label { bd:serviceParam wikibase:language "ar,en". }
                }
        GROUP BY ?item ?category ?categoryLabel ?P31Label ?P31_zLabel
        limit ${limit}
    `;
    // ---
    if (to_group_by.startsWith("P") && to_group_by.match(/^P[0-9]+$/) && to_group_by !== "P31") {
        // replace P31
        sparqlQuery = sparqlQuery.replaceAll("P31", to_group_by);
    }
    // ---
    return sparqlQuery;
}

function new_ar_lexemes_query(data_source, limit) {
    // ---
    let VALUES = ``;
    // ---
    // if data_source match Q\d+
    if (data_source !== "" && data_source.match(/Q\d+/)) {
        VALUES = `VALUES ?category { wd:${data_source} }`;
    }
    // ---
    let limit_line = ` LIMIT 1000 `;
    // ---
    if (limit && isFinite(limit)) {
        limit_line = ` LIMIT ${limit} `;
    }
    // ---
    let sparqlQuery = `
        SELECT
            ?item
            (GROUP_CONCAT(DISTINCT ?lemma1; SEPARATOR = " / ") AS ?lemma)
            ?category
            ?categoryLabel
            (SAMPLE(?P31) AS ?P31)
            (SAMPLE(?P31Label) AS ?P31Label)
            (COUNT(?form) AS ?count)
            WHERE {
            {
                SELECT *
                WHERE {
                    ${VALUES}
                    ?item dct:language wd:Q13955.
                    hint:Prior hint:rangeSafe "true"^^xsd:boolean.
                    ?item wikibase:lexicalCategory ?category.
                }
                ORDER BY DESC (xsd:integer(STRAFTER(STR(?item), "/entity/L")))
                ${limit_line}
            }
            OPTIONAL { ?item wikibase:lemma ?lemma1. }
            OPTIONAL { ?item ontolex:lexicalForm ?form. }
            OPTIONAL { ?item wdt:P31 ?P31. }
            SERVICE wikibase:label { bd:serviceParam wikibase:language "ar,en". }
        }
        GROUP BY ?item ?category ?categoryLabel
        ORDER BY DESC (?item)
    `;
    // ---
    return sparqlQuery;
}


function list_lexemes_query(limit, data_source) {
    // ---
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
    let limit_line = ` LIMIT 1000 `;
    // ---
    if (limit && isFinite(limit)) {
        limit_line = ` LIMIT ${limit} `;
    }
    // ---
    let sparqlQuery = `
        SELECT
            ?item
            (GROUP_CONCAT(DISTINCT ?lemma1; SEPARATOR = " / ") AS ?lemma)
            ?category
            ?categoryLabel
            ?P31Label
            (COUNT(?form) AS ?count)
            WHERE {
            {
                SELECT *
                WHERE {
                ${VALUES}
                ?item dct:language wd:Q13955.
                hint:Prior hint:rangeSafe "true"^^xsd:boolean.
                ?item wikibase:lexicalCategory ?category.
                }
                # ORDER BY DESC (xsd:integer(STRAFTER(STR(?item), "/entity/L")))
                ${limit_line}
            }
            OPTIONAL { ?item wikibase:lemma ?lemma1. }
            OPTIONAL { ?item ontolex:lexicalForm ?form. }
            OPTIONAL { ?item wdt:P31 ?P31. }
            SERVICE wikibase:label { bd:serviceParam wikibase:language "ar,en". }
            }
            GROUP BY ?item ?category ?categoryLabel ?P31Label
            ORDER BY DESC (?count)
    `;
    // ---
    return sparqlQuery;
}


function duplicate_lemmas_query(same_category) {
    // ---
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
    return sparqlQuery;
}
