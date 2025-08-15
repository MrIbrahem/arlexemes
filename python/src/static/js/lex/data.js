
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

const grammaticalFeatures = {

    "sound-form": { qid: "Q20386151", ar: "جمع سالم" },
    "broken-form": { qid: "Q1098772", ar: "جمع تكسير" },

    "plural-sound-form": { qid: "Q20386151", ar: "جمع سالم" },
    "plural-broken-form": { qid: "Q1098772", ar: "جمع تكسير" },

    "singular invariable": { qid: "", ar: "مفرد ثابت الشكل" },
    "plural invariable": { qid: "", ar: "جمع ثابت الشكل" },

    "perfective": { qid: "Q1424306", ar: "تام" },
    "indicative": { qid: "Q682111", ar: "الصيغة الخبرية" },
    "non-past": { qid: "Q16916993", ar: "ليس ماضي" },

    // الأعداد
    "plural": { qid: "Q146786", ar: "جمع" },
    "dual": { qid: "Q110022", ar: "مثنى" },
    "singular": { qid: "Q110786", ar: "مفرد" },

    // أشكال العدد المتقدمة
    "singulative": { qid: "Q28936290", ar: "صيغة المفرد الفردي" },  // Singulative number
    "collective": { qid: "Q1311051", ar: "صيغة الجمع الجماعي" }, // Collective noun
    "paucal": { qid: "Q158933", ar: "صيغة القلة" },           // Paucal number

    // الحالات الإعرابية
    "genitive": { qid: "Q146233", ar: "إضافة" },
    "accusative": { qid: "Q146078", ar: "نصب" },
    "nominative": { qid: "Q131105", ar: "رفع" },
    "informal": { qid: "Q117262361", ar: "الوقف" },

    // التعريف
    "indefinite": { qid: "Q53997857", ar: "نكرة" },
    "definite": { qid: "Q53997851", ar: "معرفة" },
    "construct": { qid: "Q1641446", ar: "مركب" }, // Compound

    // الجنس
    "masculine": { qid: "Q499327", ar: "مذكر" },
    "feminine": { qid: "Q1775415", ar: "مؤنث" },

    // الأشخاص
    "first-person": { qid: "Q21714344", ar: "متكلم" },
    "second-person": { qid: "Q51929049", ar: "مخاطب" },
    "third-person": { qid: "Q51929074", ar: "غائب" },

    // البناء
    "active": { qid: "Q1317831", ar: "فعل مبني للمعلوم" },
    "passive": { qid: "Q1194697", ar: "فعل مبني للمجهول" },

    // الأزمنة
    "past": { qid: "Q1994301", ar: "ماضي" },
    "past perfect": { qid: "Q23663136", ar: "ماضي تام" },
    "imperfective": { qid: "Q56649265", ar: "مضارع ناقص" },
    "subjunctive": { qid: "Q473746", ar: "مضارع منصوب" },
    "jussive": { qid: "Q462367", ar: "مضارع مجزوم" },
    "imperative": { qid: "Q22716", ar: "فعل أمر" },
    "fi'il muḍāri'": { qid: "Q12230930", ar: "فعل مضارع" },

    // أخرى
    "performative": { qid: "Q124351233", ar: "أدائي" }, // إنجازي

    "passive participle": { qid: "Q72249544", ar: "اِسْم الْمَفْعُول" },
    "active participle": { qid: "Q72249355", ar: "اِسْم الْفَاعِل" },

}
for (const [en, { qid, ar }] of Object.entries(grammaticalFeatures)) {
    keyLabels[qid] = ar;
    en2qid[en] = qid;
    en2ar[en] = ar;
}

keyLabels["Q1994301"] = "ماضي";
