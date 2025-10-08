<?php

ini_set("display_errors", 1);
ini_set("display_startup_errors", 1);
error_reporting(E_ALL);

// قاموس لربط مفاتيح ويكيداتا بالتسميات العربية
$GLOBALS['keyLabels'] = [
    "Q1098772" => "جمع تكسير",
    "Q13955" => "العربية",
    "Q118465097" => "الصيغة السياقية",

    // مفتاح بديل للجنس عندما لا يكون هناك فصل حسب الجنس
    "NO_GENDER_PLACEHOLDER" => "", // يمكن تركها فارغة أو وضع "عام"

    "Q111029" => "جذر",
    "Q1084" => "اسم",
    "Q24905" => "فعل",
    "Q34698" => "صفة",
    "Q1350145" => "اسم مصدر",

    "Q106614340" => "فعل مشتق",
    "Q20386151" => "جمع سالم",
    "Q1098772" => "جمع تكسير",
    "" => "مفرد ثابت الشكل",

    "Q1424306" => "تام",
    "Q682111" => "الصيغة الخبرية",
    "Q16916993" => "ليس ماضي",

    // الأعداد
    "Q146786" => "جَمْع",
    "Q110022" => "مُثَنَّى",
    "Q110786" => "مُفْرَد",

    // أشكال العدد المتقدمة
    "Q28936290" => "صيغة المفرد الفردي",  // Singulative number
    "Q1311051" => "صيغة الجمع الجماعي", // Collective noun
    "Q158933" => "صيغة القلة",           // Paucal number

    // الحالات الإعرابية
    "Q146233" => "مَجْرُور",
    "Q1095813" => "إضافة عربي",
    "Q146078" => "مَنْصُوب",
    "Q131105" => "مَرْفُوع",
    "Q117262361" => "الوقف",

    // التعريف
    "Q53997857" => "نَكِرَة",
    "Q53997851" => "مَعْرِفَة",
    "Q1641446" => "إضافة", // Compound

    // الجنس
    "Q499327" => "مُذَكَّر",
    "Q1775415" => "مُؤَنَّث",

    // الأشخاص
    "Q21714344" => "متكلم",
    "Q51929049" => "مخاطب",
    "Q51929074" => "غائب",

    // البناء
    "Q1317831" => "مبني للمعلوم",
    "Q1194697" => "مبني للمجهول",

    // الأزمنة
    "Q1994301" => "ماضي",
    "Q23663136" => "ماضي تام",
    "Q56649265" => "مضارع ناقص",
    "Q473746" => "مضارع منصوب",
    "Q462367" => "مضارع مجزوم",
    "Q22716" => "أمر",
    "Q12230930" => "مضارع",
    "Q192613" => "مضارع",

    // أخرى
    "Q124351233" => "أدائي", // إنجازي
    "Q72249544" => "اِسْم الْمَفْعُول",
    "Q72249355" => "اِسْم الْفَاعِل",

    //tense
    "Q113326559" => "non-remote tense",
    "Q113326099" => "remote tense",
    "Q113326922" => "non-remote past tense",
    "Q113326813" => "remote past tense",
    "Q501405" => "مستقبل مستمر",
    "Q104872742" => "non-remote future tense",
    "Q113565070" => "remote future tense",
    "Q442485" => "الماضي البسيط",
    "Q3502553" => "المضارع الشرطي",
    "Q3502544" => "past subjunctive",
    "Q7240943" => "مضارع مستمر",
    "Q12547192" => "الماضي غير التام",
    "Q18088230" => "future imperfect",
    "Q3910936" => "مضارع بسيط",
    "Q1392475" => "ماضي بسيط",
];

$GLOBALS['en2qid'] = [];
$GLOBALS['en2ar'] = [
    "alternative" => "بديل",
];

$GLOBALS['difinitions'] = [
    "sound masculine plural" => "جمع مذكر سالم",
    "sound feminine plural" => "جمع مؤنث سالم",
    "basic broken plural triptote" => "جمع تكسير منصرف بسيط",
    "basic singular diptote" => "اسم مفرد منصرف جزئيًا (غير منصرف بسيط)",
    "singular invariable" => "اسم مفرد غير متصرف (ثابت الشكل)",
    "singular triptote in ـَة (-a)" => "اسم مفرد منصرف منتهٍ بالتاء المربوطة",
    "broken plural invariable" => "جمع تكسير غير متصرف (ثابت الشكل)",
];

// Build en2qid from grammaticalFeaturesLabels
$GLOBALS['grammaticalFeaturesLabels'] = [
    "Q106614340" => ["en" => "nominal verb", "ar" => "فعل مشتق"],
    "Q20386151" => ["en" => "sound-form", "ar" => "جمع سالم"],
    "Q1098772" => ["en" => "broken-form", "ar" => "جمع تكسير"],
    "" => ["en" => "singular invariable", "ar" => "مفرد ثابت الشكل"],
    "" => ["en" => "plural invariable", "ar" => "جمع ثابت الشكل"],
    "Q1424306" => ["en" => "perfective", "ar" => "تام"],
    "Q682111" => ["en" => "indicative", "ar" => "الصيغة الخبرية"],
    "Q16916993" => ["en" => "non-past", "ar" => "ليس ماضي"],
    // الأعداد
    "Q146786" => ["en" => "plural", "ar" => "جَمْع"],
    "Q110022" => ["en" => "dual", "ar" => "مُثَنَّى"],
    "Q110786" => ["en" => "singular", "ar" => "مُفْرَد"],
    // أشكال العدد المتقدمة
    "Q28936290" => ["en" => "singulative", "ar" => "صيغة المفرد الفردي"],  // Singulative number
    "Q1311051" => ["en" => "collective", "ar" => "صيغة الجمع الجماعي"], // Collective noun
    "Q158933" => ["en" => "paucal", "ar" => "صيغة القلة"],           // Paucal number
    // الحالات الإعرابية
    "Q146233" => ["en" => "genitive", "ar" => "مَجْرُور"],
    "Q1095813" => ["en" => "genitive!", "ar" => "إضافة عربي"],
    "Q146078" => ["en" => "accusative", "ar" => "مَنْصُوب"],
    "Q131105" => ["en" => "nominative", "ar" => "مَرْفُوع"],
    "Q117262361" => ["en" => "informal", "ar" => "الوقف"],
    // التعريف
    "Q53997857" => ["en" => "indefinite", "ar" => "نَكِرَة"],
    "Q53997851" => ["en" => "definite", "ar" => "مَعْرِفَة"],
    "Q1641446" => ["en" => "construct", "ar" => "إضافة"], // Compound
    // الجنس
    "Q499327" => ["en" => "masculine", "ar" => "مُذَكَّر"],
    "Q1775415" => ["en" => "feminine", "ar" => "مُؤَنَّث"],
    // الأشخاص
    "Q21714344" => ["en" => "first-person", "ar" => "متكلم"],
    "Q51929049" => ["en" => "second-person", "ar" => "مخاطب"],
    "Q51929074" => ["en" => "third-person", "ar" => "غائب"],
    // البناء
    "Q1317831" => ["en" => "active", "ar" => "مبني للمعلوم"],
    "Q1194697" => ["en" => "passive", "ar" => "مبني للمجهول"],
    // الأزمنة
    "Q1994301" => ["en" => "past", "ar" => "ماضي"],
    "Q23663136" => ["en" => "past perfect", "ar" => "ماضي تام"],
    "Q56649265" => ["en" => "imperfective", "ar" => "مضارع ناقص"],
    "Q473746" => ["en" => "subjunctive", "ar" => "مضارع منصوب"],
    "Q462367" => ["en" => "jussive", "ar" => "مضارع مجزوم"],
    "Q22716" => ["en" => "imperative", "ar" => "أمر"],
    "Q12230930" => ["en" => "fi'il muḍāri'", "ar" => "مضارع"],
    "Q192613" => ["en" => "Q192613", "ar" => "مضارع"],
    // أخرى
    "Q124351233" => ["en" => "performative", "ar" => "أدائي"], // إنجازي
    "Q72249544" => ["en" => "passive participle", "ar" => "اِسْم الْمَفْعُول"],
    "Q72249355" => ["en" => "active participle", "ar" => "اِسْم الْفَاعِل"],
    //tense
    "Q113326559" => ["en" => "non-remote", "ar" => "non-remote tense"],
    "Q113326099" => ["en" => "remote", "ar" => "remote tense"],
    "Q113326922" => ["en" => "non-remote past", "ar" => "non-remote past tense"],
    "Q113326813" => ["en" => "remote past", "ar" => "remote past tense"],
    "Q501405" => ["en" => "future", "ar" => "مستقبل مستمر"],
    "Q104872742" => ["en" => "non-remote future", "ar" => "non-remote future tense"],
    "Q113565070" => ["en" => "remote future", "ar" => "remote future tense"],
    "Q442485" => ["en" => "preterite", "ar" => "الماضي البسيط"],
    "Q3502553" => ["en" => "present subjunctive", "ar" => "المضارع الشرطي"],
    "Q3502544" => ["en" => "past subjunctive", "ar" => "past subjunctive"],
    "Q7240943" => ["en" => "present continuous", "ar" => "مضارع مستمر"],
    "Q12547192" => ["en" => "past imperfect", "ar" => "الماضي غير التام"],
    "Q18088230" => ["en" => "future imperfect", "ar" => "future imperfect"],
    "Q3910936" => ["en" => "simple present", "ar" => "مضارع بسيط"],
    "Q1392475" => ["en" => "simple past", "ar" => "ماضي بسيط"],
];

// ملء المصفوفات من grammaticalFeaturesLabels
foreach ($GLOBALS['grammaticalFeaturesLabels'] as $qid => $data) {
    $GLOBALS['keyLabels'][$qid] = $data['ar'];
    $GLOBALS['en2qid'][$data['en']] = $qid;
    $GLOBALS['en2ar'][$data['en']] = $data['ar'];
}

$GLOBALS['keyLabels']["Q1994301"] = "ماضي";

// Data arrays from js/lex_data.js
$GLOBALS['Pausal_Forms'] = [
    "Q117262361",
    "Q131105",
    "Q146078",
    "Q146233",
    "Q1095813",
    ""
];

// مفرد مثنى جمع
$GLOBALS['singular_plural_dual'] = ["Q110786", "Q110022", "Q146786", ""];

$GLOBALS['first_second_third_person'] = [
    "Q88778575",
    "Q21714344",
    "Q51929049",
    "Q51929074",
    ""
];

$GLOBALS['gender_Keys_global'] = ["Q499327", "Q1775415", "Q1775461", "Q1305037", ""];

$GLOBALS['numberKeys_verb'] = [
    "Q1994301", // past
    "Q23663136", // past perfect
    "Q192613", //     مضارع
    "Q56649265", // imperfective    مضارع ناقص
    "Q12230930", // fi'il muḍāri'
    "Q473746", // subjunctive
    "Q462367", // jussive
    "Q22716",  // imperative
    "Q124351233", // أدائي
    ""
];

$GLOBALS['additional_tenses'] = [
    "Q113326559", //non-remote
    "Q113326099", //remote
    "Q113326922", //non-remote past
    "Q113326813", //remote past
    "Q501405", //future
    "Q104872742", //non-remote future
    "Q113565070", //remote future
    "Q442485", //preterite
    "Q3502553", //present subjunctive
    "Q3502544", //past subjunctive
    "Q7240943", //present continuous
    "Q12547192", //past imperfect
    "Q18088230", //future imperfect
    "Q3910936", // مضارع بسيط
    "Q1392475", // ماضي بسيط
    "Q1230649",
    "Q10345583",
];

// دمج المصفوفات
$GLOBALS['numberKeys_verb'] = array_merge($GLOBALS['numberKeys_verb'], $GLOBALS['additional_tenses']);

// تعريف المتغيرات
$GLOBALS['first_person'] = "Q21714344";
$GLOBALS['second_person'] = "Q51929049";

$GLOBALS['dual'] = "Q110022";
$GLOBALS['singular'] = "Q110786";
$GLOBALS['plural'] = "Q146786";

$GLOBALS['Masculine'] = "Q499327";
$GLOBALS['Feminine'] = "Q1775415";

$GLOBALS['verbs_main_g'] = ["Q1317831", "Q1194697", ""];

$GLOBALS['indefinite_definite_construct'] = ["Q53997857", "Q53997851", "Q1641446", "Q118465097", ""];

$GLOBALS['construct_contextform'] = ["Q1641446", "Q118465097"];

$GLOBALS['adj_and_nouns_keys'] = [
    "Q34698" => $GLOBALS['singular_plural_dual'],
    "Q1084" => $GLOBALS['singular_plural_dual']
];

$GLOBALS['past_qid'] = "Q1994301";
$GLOBALS['past_perfect_qid'] = "Q23663136";
