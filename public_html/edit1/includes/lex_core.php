<?php

ini_set("display_errors", 1);
ini_set("display_startup_errors", 1);
error_reporting(E_ALL);



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
