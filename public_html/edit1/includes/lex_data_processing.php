<?php

ini_set("display_errors", 1);
ini_set("display_startup_errors", 1);
error_reporting(E_ALL);

require_once __DIR__ . '/lex_data.php';
require_once __DIR__ . '/lex_utils.php';
require_once __DIR__ . '/lex_core.php';
require_once __DIR__ . '/lex_table_generation.php';
require_once __DIR__ . '/lex_types.php';

/**
 * Fetches lexeme data and generates HTML
 * @param string $id The lexeme ID
 * @param array $entity The entity data
 * @param bool $no_head Whether to skip header
 * @return string Generated HTML
 */
function fetchLexemeById($id, $entity, $no_head = false)
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

    $forms = isset($entity['forms']) ? $entity['forms'] : [];
    error_log("len forms: " . count($forms));

    $forms = filter_forms($forms);

    $entity['forms'] = $forms;

    $forms_len = count($forms);

    $header_main = "
        <div class=\"col\">
            <span class=\"h4\">المفردات:  $forms_len</span>
        </div>
    ";

    // Assuming these elements don't exist in PHP context as they would in JS
    $lemma_link_tag = false;
    $lemma_link_en = false;

    if (!$lemma_link_tag && !$lemma_link_en) {
        $header_main = "
            <div class=\"col-md-4\">
                <span class=\"mb-4 h1\" id=\"header_main\">
                <a href=\"https://wikidata.org/entity/$id\" target=\"_blank\" class=\"text-primary font-sm\">$lemma</a>
                </span>
                <span class=\"h4\">المفردات: $forms_len</span>
            </div>
        ";
    }

    $html = "
        <div class=\"row mb-4\">
            $header_main
        </div>
    ";

    $table_html = "";
    if ($Category === "Q24905") {     // verbs
        $table_html = generate_verb_table($entity);
    } else {
        $table_html = generate_noun_adj_table($Category, $entity);
    }

    if ($table_html) {
        $html .= $table_html;
    } else {
        $html .= "<div class='alert alert-warning'>لا يوجد بيانات</div>";
    }

    return $html;
}

/**
 * Starts the lexeme processing
 * @param string $id The lexeme ID
 * @param bool $no_head Whether to skip header
 * @return string Generated HTML
 */
function start_lexeme($id, $no_head = false)
{
    $entity = fetch_wikidata_entity($id);

    if (empty($entity)) {
        return "<div class='alert alert-danger'>لم يتم العثور على الكيان المطلوب.</div>";
    }

    $html = fetchLexemeById($id, $entity, $no_head);

    return $html;
}
