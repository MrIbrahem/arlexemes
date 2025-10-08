<?php

ini_set("display_errors", 1);
ini_set("display_startup_errors", 1);
error_reporting(E_ALL);

require_once __DIR__ . '/lex_data.php';
require_once __DIR__ . '/lex_utils.php';
require_once __DIR__ . '/lex_core.php';
require_once __DIR__ . '/lex_table_generation.php';
require_once __DIR__ . '/lex_types.php';


function fetchLexemeById($id, $entity)
{
    $lemma = isset($entity['lemma']) ? $entity['lemma'] : "(غير متوفر)";
    if (isset($entity['lemmas']) && is_array($entity['lemmas'])) {
        $lemma_values = [];
        foreach ($entity['lemmas'] as $l) {
            if (isset($l['value']) && $l['value']) {
                $lemma_values[] = $l['value'];
            }
        }
        $lemma = !empty($lemma_values) ? implode(" / ", $lemma_values) : "(غير متوفر)";
    }

    $Category = isset($entity['lexicalCategory']) ? $entity['lexicalCategory'] : "";

    $entity['forms'] = isset($entity['forms']) ? $entity['forms'] : [];
    error_log("len forms: " . count($entity['forms']));

    // $entity['forms'] = filter_forms($entity['forms']);

    $forms_len = count($entity['forms']);

    $header_main = <<<HTML
        <div class="col">
            <span class="h4">المفردات:  $forms_len</span>
        </div>
    HTML;

    // Assuming these elements don't exist in PHP context as they would in JS
    $lemma_link_tag = false;
    $lemma_link_en = false;

    if (!$lemma_link_tag && !$lemma_link_en) {
        $header_main = <<<HTML
            <div class="col-md-4">
                <span class="mb-4 h1" id="header_main">
                <a href="https://wikidata.org/entity/$id" target="_blank" class="text-primary font-sm">$lemma</a>
                </span>
                <span class="h4">المفردات: $forms_len</span>
            </div>
        HTML;
    }

    $html = <<<HTML
        <div class="row mb-4">
            $header_main
        </div>
    HTML;

    $table_html = "";
    if ($Category === "Q24905") {     // verbs
        $table_html = generate_verb_table($entity);
    } else {
        $table_html = generate_noun_adj_table($Category, $entity);
    }

    if ($table_html) {
        $html .= $table_html;
    } else {
        $html .= <<<HTML
            <div class="alert alert-warning">لا يوجد بيانات</div>
        HTML;
    }

    return $html;
}


function start_lexeme($id)
{
    $entity = fetch_wikidata_entity($id);

    if (empty($entity)) {
        return <<<HTML
            <div class="alert alert-danger">لم يتم العثور على الكيان المطلوب.</div>
        HTML;
    }

    $html = fetchLexemeById($id, $entity);

    return $html;
}
