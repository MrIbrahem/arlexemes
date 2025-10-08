
// قاموس لربط مفاتيح ويكيداتا بالتسميات العربية
let keyLabels = {
    "Q1098772": "جمع تكسير",
    "Q13955": "العربية",
    "Q118465097": "الصيغة السياقية",

    // مفتاح بديل للجنس عندما لا يكون هناك فصل حسب الجنس
    "NO_GENDER_PLACEHOLDER": "", // يمكن تركها فارغة أو وضع "عام"

    "Q111029": "جذر",
    "Q1084": "اسم",
    "Q24905": "فعل",
    "Q34698": "صفة",

    "Q1350145": "اسم مصدر",

}

let en2qid = {}

let en2ar = {
    "alternative": "بديل",
}

let difinitions = {
    "sound masculine plural": "جمع مذكر سالم",
    "sound feminine plural": "جمع مؤنث سالم",
    "basic broken plural triptote": "جمع تكسير منصرف بسيط",
    "basic singular diptote": "اسم مفرد منصرف جزئيًا (غير منصرف بسيط)",
    "singular invariable": "اسم مفرد غير متصرف (ثابت الشكل)",
    "singular triptote in ـَة (-a)": "اسم مفرد منصرف منتهٍ بالتاء المربوطة",
    "broken plural invariable": "جمع تكسير غير متصرف (ثابت الشكل)",
    // "": "",
    // "": "",
    // "": "",

}

const grammaticalFeaturesLabels = {

    "Q106614340": { en: "nominal verb", ar: "فعل مشتق" },

    "Q20386151": { en: "sound-form", ar: "جمع سالم" },
    "Q1098772": { en: "broken-form", ar: "جمع تكسير" },

    // "Q20386151": { en: "plural-sound-form", ar: "جمع سالم" },
    // "Q1098772": { en: "plural-broken-form", ar: "جمع تكسير" },

    "": { en: "singular invariable", ar: "مفرد ثابت الشكل" },
    "": { en: "plural invariable", ar: "جمع ثابت الشكل" },

    "Q1424306": { en: "perfective", ar: "تام" },
    "Q682111": { en: "indicative", ar: "الصيغة الخبرية" },
    "Q16916993": { en: "non-past", ar: "ليس ماضي" },

    // الأعداد
    "Q146786": { en: "plural", ar: "جَمْع" },
    "Q110022": { en: "dual", ar: "مُثَنَّى" },
    "Q110786": { en: "singular", ar: "مُفْرَد" },

    // أشكال العدد المتقدمة
    "Q28936290": { en: "singulative", ar: "صيغة المفرد الفردي" },  // Singulative number
    "Q1311051": { en: "collective", ar: "صيغة الجمع الجماعي" }, // Collective noun
    "Q158933": { en: "paucal", ar: "صيغة القلة" },           // Paucal number

    // الحالات الإعرابية
    "Q146233": { en: "genitive", ar: "مَجْرُور" },
    "Q1095813": { en: "genitive!", ar: "إضافة عربي" },
    "Q146078": { en: "accusative", ar: "مَنْصُوب" },
    "Q131105": { en: "nominative", ar: "مَرْفُوع" },
    "Q117262361": { en: "informal", ar: "الوقف" },

    // التعريف
    "Q53997857": { en: "indefinite", ar: "نَكِرَة" },
    "Q53997851": { en: "definite", ar: "مَعْرِفَة" },
    "Q1641446": { en: "construct", ar: "إضافة" }, // Compound

    // الجنس
    "Q499327": { en: "masculine", ar: "مُذَكَّر" },
    "Q1775415": { en: "feminine", ar: "مُؤَنَّث" },

    // الأشخاص
    "Q21714344": { en: "first-person", ar: "متكلم" },
    "Q51929049": { en: "second-person", ar: "مخاطب" },
    "Q51929074": { en: "third-person", ar: "غائب" },

    // البناء
    "Q1317831": { en: "active", ar: "مبني للمعلوم" },
    "Q1194697": { en: "passive", ar: "مبني للمجهول" },

    // الأزمنة
    "Q1994301": { en: "past", ar: "ماضي" },
    "Q23663136": { en: "past perfect", ar: "ماضي تام" },
    "Q56649265": { en: "imperfective", ar: "مضارع ناقص" },
    "Q473746": { en: "subjunctive", ar: "مضارع منصوب" },
    "Q462367": { en: "jussive", ar: "مضارع مجزوم" },
    "Q22716": { en: "imperative", ar: "أمر" },
    "Q12230930": { en: "fi'il muḍāri'", ar: "مضارع" },
    "Q192613": { en: "Q192613", ar: "مضارع" },

    // أخرى
    "Q124351233": { en: "performative", ar: "أدائي" }, // إنجازي

    "Q72249544": { en: "passive participle", ar: "اِسْم الْمَفْعُول" },
    "Q72249355": { en: "active participle", ar: "اِسْم الْفَاعِل" },

    //tense
    "Q113326559": { en: "non-remote", ar: "non-remote tense" },
    "Q113326099": { en: "remote", ar: "remote tense" },
    // "Q192613": { en: "present", ar: "المضارع" },
    "Q113326922": { en: "non-remote past", ar: "non-remote past tense" },
    "Q113326813": { en: "remote past", ar: "remote past tense" },
    "Q501405": { en: "future", ar: "مستقبل مستمر" },
    "Q104872742": { en: "non-remote future", ar: "non-remote future tense" },
    "Q113565070": { en: "remote future", ar: "remote future tense" },
    "Q442485": { en: "preterite", ar: "الماضي البسيط" },
    "Q3502553": { en: "present subjunctive", ar: "المضارع الشرطي" },
    "Q3502544": { en: "past subjunctive", ar: "past subjunctive" },
    "Q7240943": { en: "present continuous", ar: "مضارع مستمر" },
    "Q12547192": { en: "past imperfect", ar: "الماضي غير التام" },
    "Q18088230": { en: "future imperfect", ar: "future imperfect" },
    "Q3910936": { en: "simple present", ar: "مضارع بسيط" },
    "Q1392475": { en: "simple past", ar: "ماضي بسيط" },

}
for (const [qid, { en, ar }] of Object.entries(grammaticalFeaturesLabels)) {
    keyLabels[qid] = ar;
    en2qid[en] = qid;
    en2ar[en] = ar;
}

keyLabels["Q1994301"] = "ماضي";
