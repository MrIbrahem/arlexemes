<?php

ini_set("display_errors", 1);
ini_set("display_startup_errors", 1);
error_reporting(E_ALL);

require_once __DIR__ . '/lex_functions.php';
require_once __DIR__ . '/lex_table_generation.php';

/**
 * Fetches entity data from Wikidata API
 * @param string $id The entity ID to fetch
 * @return array|null The entity data or null if not found
 */
function fetch_wikidata_entity($id)
{
    $url = "https://www.wikidata.org/w/api.php?action=wbgetentities&format=json&ids=$id&origin=*";

    try {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_USERAGENT,  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.90 Safari/537.36');
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 30);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

        $response = curl_exec($ch);

        if (curl_errno($ch)) {
            error_log("Curl error: " . curl_error($ch));
            return null;
        }

        curl_close($ch);

        $data = json_decode($response, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            error_log("JSON decode error: " . json_last_error_msg());
            return null;
        }

        $entities = $data['entities'] ?? [];
        return $entities[$id] ?? null;
    } catch (Exception $e) {
        error_log("Exception in fetch_wikidata_entity: " . $e->getMessage());
        return null;
    }
}

/**
 * Filters forms based on excluded tags
 * @param array $forms Array of forms to filter
 * @return array Filtered forms array
 */
function filter_forms($forms)
{
    $to_dis_tags = [
        "مصدر" => ["Q1923028"],
        "المصدر" => ["Q1350145"],
        "اِسْم الْمَفْعُول" => ["Q72249544"],
        "اِسْم الْفَاعِل" => ["Q72249355"],
        "المضارع" => ["non-past"],
        "إضافة" => ["construct"],
        "مؤنث" => ["Q1775415"],
        "مذكر" => ["Q499327"],
        "بديل" => ["alternative"],
        "جمع" => ["Q146786"],
        "فعل مشتق" => ["Q106614340"],
        "جمع مؤنث" => ["Q1775415", "Q146786"],
        "جمع مذكر" => ["Q499327", "Q146786"],
    ];

    // قائمة الوسوم المطلوب استبعادها كأزواج كاملة
    $excludedTags = [];
    foreach ($to_dis_tags as $arr) {
        sort($arr);
        $excludedTags[] = json_encode($arr);
    }

    // فلترة النماذج
    $filtered_forms = [];
    foreach ($forms as $form) {
        $feats = $form['tags'] ?? $form['grammaticalFeatures'] ?? [];
        sort($feats);

        if (!in_array(json_encode($feats), $excludedTags)) {
            $filtered_forms[] = $form;
        }
    }

    // Additional filtering
    $filtered_forms = array_filter($filtered_forms, function ($form) {
        $tags = $form['tags'] ?? $form['grammaticalFeatures'] ?? [];
        return !(count($tags) === 2 && (in_array("common", $tags)));
    });

    return array_values($filtered_forms);
}

/**
 * Fetches lexeme data and generates HTML
 * @param string $id The lexeme ID
 * @param array $entity The entity data
 * @param bool $no_head Whether to skip header
 * @return string Generated HTML
 */
function fetchLexemeById($id, $entity, $no_head = false)
{
    $lemma = $entity['lemma'] ?? "(غير متوفر)";
    if (isset($entity['lemmas']) && is_array($entity['lemmas'])) {
        $lemmaValues = [];
        foreach ($entity['lemmas'] as $l) {
            if (isset($l['value']) && $l['value']) {
                $lemmaValues[] = $l['value'];
            }
        }
        $lemma = !empty($lemmaValues) ? implode(" / ", $lemmaValues) : "(غير متوفر)";
    }

    $Category = $entity['lexicalCategory'] ?? "";

    $forms = $entity['forms'] ?? [];
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

    if (!$entity) {
        return "<div class='alert alert-danger'>لم يتم العثور على الكيان المطلوب.</div>";
    }

    $html = fetchLexemeById($id, $entity, $no_head);

    return $html;
}
