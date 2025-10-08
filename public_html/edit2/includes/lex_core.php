<?php

ini_set("display_errors", 1);
ini_set("display_startup_errors", 1);
error_reporting(E_ALL);
require_once __DIR__ . '/lex_utils.php';

/**
 * مigrate getentity function from JavaScript to PHP
 */
function fetch_wikidata_entity($id) {
    $entity = null;
    $url = "https://www.wikidata.org/w/api.php?action=wbgetentities&format=json&ids=" . $id . "&origin=*";

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_USERAGENT, 'Lexeme Display Tool');

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

    if (curl_error($ch)) {
        error_log("cURL Error: " . curl_error($ch));
        curl_close($ch);
        return [];
    }

    curl_close($ch);

    if ($httpCode !== 200) {
        error_log("HTTP Error: " . $httpCode . " for URL: " . $url);
        return [];
    }

    $data = json_decode($response, true);

    $entities = isset($data['entities']) ? $data['entities'] : [];
    $entity = isset($entities[$id]) ? $entities[$id] : null;

    if (!$entity) {
        error_log("Entity not found for ID: " . $id);
        return [];
    }

    return $entity;
}

/**
 * مigrate filter_forms function from JavaScript to PHP
 */
function filter_forms($forms) {
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
        $sorted_arr = $arr;
        sort($sorted_arr);
        $excludedTags[] = json_encode($sorted_arr);
    }

    // فلترة النماذج
    $filtered_forms = [];
    foreach ($forms as $form) {
        $feats = isset($form['tags']) ? $form['tags'] : (isset($form['grammaticalFeatures']) ? $form['grammaticalFeatures'] : []);
        $feats_sorted = $feats;
        sort($feats_sorted);
        $feats_json = json_encode($feats_sorted);

        if (!in_array($feats_json, $excludedTags)) {
            // Check for "common" tag filter
            if (!(count($feats) === 2 && (in_array("common", $feats)))) {
                $filtered_forms[] = $form;
            }
        }
    }

    return $filtered_forms;
}

/**
 * مigrate entryFormatterNew function from JavaScript to PHP
 */
function entryFormatterNew($form) {
    $formId = isset($form['id']) ? $form['id'] : "L000-F0";

    // ar-x-Q775724
    $values = "";
    if (isset($form['representations']) && is_array($form['representations'])) {
        $rep_values = [];
        foreach ($form['representations'] as $r) {
            if (isset($r['value']) && $r['value']) {
                $rep_values[] = '<span class="words fs-4" word="' . htmlspecialchars($r['value']) . '">' . htmlspecialchars($r['value']) . '</span>';
            }
        }
        if (!empty($rep_values)) {
            $values = implode(" / ", $rep_values);
        }
    }

    if (!$values) {
        $form_value = isset($form['form']) ? $form['form'] : "";
        $values = '<span class="words fs-4" word="' . htmlspecialchars($form_value) . '">' . htmlspecialchars($form_value) . '</span>';
    }

    $form_claims = isset($form['claims']) ? $form['claims'] : [];
    $lemma_item = isset($form_claims['P6254']) ? $form_claims['P6254'] : [];

    // "claims": { "P6254": [ { "mainsnak": { "snaktype": "value", "property": "P6254", "hash": "af059ae26aed43ea15031db491c9697fa273d0c9", "datavalue": { "value": { "entity-type": "lexeme", "numeric-id": 1490749, "id": "L1490749" }, "type": "wikibase-entityid" }, "datatype": "wikibase-lexeme" }, "type": "statement", "id": "L1485952-F112$51f8aa30-4921-906e-2839-86d2c7c3fc63", "rank": "normal" } ] }
    if ($lemma_item) {
        $lemma_ids = [];
        foreach ($lemma_item as $item) {
            if (isset($item['mainsnak']['datavalue']['value']['id'])) {
                $lemma_ids[] = $item['mainsnak']['datavalue']['value']['id'];
            }
        }
        $lemma_id = !empty($lemma_ids) ? $lemma_ids[0] : null;
        if ($lemma_id) {
            $values = '
            <a href="https://www.wikidata.org/entity/' . $lemma_id . '" target="_blank">
                ' . $values . '
            </a>&nbsp;';
        }
    }

    // Convert formId to a URL-friendly format for linking to Wikidata
    $formIdlink = str_replace("-", "#", $formId);
    $formId_parts = explode("-", $formId);
    $formId_number = !empty($formId_parts) ? $formId_parts[1] : ""; // Extract F-number part

    $feats = isset($form['tags']) ? $form['tags'] : (isset($form['grammaticalFeatures']) ? $form['grammaticalFeatures'] : []);
    $attr = [];
    foreach ($feats as $feat) {
        $attr[] = attrFormatter($feat);
    }
    $attr = implode("\n", $attr);

    $link = '
        ' . $values . ' <a title="' . htmlspecialchars($attr) . '" href="https://www.wikidata.org/entity/' . $formIdlink . '" target="_blank">
            <small>(' . $formId_number . ')</small>
        </a>';

    $lexemeId_parts = explode("-", $formId);
    $lexemeId = !empty($lexemeId_parts) ? $lexemeId_parts[0] : "";

    if ($lexemeId === "L000") {
        $link = '
        <span title="' . htmlspecialchars($attr) . '">
            ' . $values . '
            <!-- <small>(' . $formId_number . ')</small> -->
        </span>
        ';
    }

    $exampleList = isset($form_claims['P5831']) ? $form_claims['P5831'] : [];

    $td = '
        ' . $link . '
    ';

    return $td;
}

?>
