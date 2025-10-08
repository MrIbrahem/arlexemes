<?php

ini_set("display_errors", 1);
ini_set("display_startup_errors", 1);
error_reporting(E_ALL);
require_once __DIR__ . '/lex_utils.php';


/**
 * migrate getentity function from JavaScript to PHP
 */
function fetch_wikidata_entity($id)
{
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
 * migrate filter_forms function from JavaScript to PHP
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
