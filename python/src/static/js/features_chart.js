
const queries = {
    // الاستعلام الأول: الفئات المعجمية للغة العربية (wd:Q13955)
    lexicalCategoriesArabic: `
        select
            ?Feature
            ?FeatureLabel
            ?category
            ?categoryLabel
            ?count
            {
            service <https://qlever.cs.uni-freiburg.de/api/wikidata>
                {
                    SELECT ?Feature ?category (count(?form) as ?count) WHERE {
                    ?item dct:language wd:Q13955;
                            wikibase:lexicalCategory ?category;
                            ontolex:lexicalForm ?form.
                    ?form wikibase:grammaticalFeature ?Feature .
                    } group by ?Feature ?category
                }
            SERVICE wikibase:label { bd:serviceParam wikibase:language "ar, en". }
            } order by desc(?count) strlen(str(?Feature)) ?Feature
    `,
};

const baseColors = [
    [54, 162, 235], [255, 99, 132],
    [255, 206, 86], [75, 192, 192],
    [153, 102, 255], [255, 159, 64],
    [46, 204, 113], [231, 76, 60],
    [52, 73, 94], [241, 196, 15]
];

function generateColor(index) {
    const base = baseColors[index % baseColors.length];
    const variation = Math.floor((index / baseColors.length) * 50); // فرق بسيط في اللون
    const r = Math.min(base[0] + variation, 255);
    const g = Math.min(base[1] + variation, 255);
    const b = Math.min(base[2] + variation, 255);
    return `rgba(${r}, ${g}, ${b}, 0.8)`;
}

function getChartColors(n) {
    const colors = [];
    for (let i = 0; i < n; i++) {
        colors.push(generateColor(i));
    }
    return colors;
}
function createChart(ctx, { labels, data }, title, pos, maintainAspectRatio = true) {
    const chartColors = getChartColors(labels.length);

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                label: 'العدد',
                data: data,
                backgroundColor: chartColors,
                borderColor: 'rgba(3, 3, 3, 0.7)',
                borderWidth: 0.2
            }],
            hoverOffset: 4
        },
        options: {
            responsive: true,
            maintainAspectRatio: maintainAspectRatio,
            aspectRatio: 2,
            plugins: {
                legend: {
                    position: pos,
                    rtl: true,
                    textDirection: "rtl",
                    labels: {
                        color: 'var(--bs-body-color)',
                        font: {
                            family: "'Cairo', sans-serif",
                            size: 16
                        }
                    }
                },
                tooltip: {
                    bodyFont: { family: "'Cairo', sans-serif" },
                    titleFont: { family: "'Cairo', sans-serif" }
                },
                title: {
                    display: false
                }
            }
        }
    });
}

function aggregateOthers(featuresArray, maxItems = 15) {
    // ترتيب العناصر تنازليًا حسب count
    const sortedFeatures = featuresArray.sort((a, b) => b.count - a.count);

    const labels = [];
    const data = [];
    let othersCount = 0;

    sortedFeatures.forEach((item, index) => {
        if (index < maxItems) {
            labels.push(`${item.label} (${item.count.toLocaleString()})`);
            data.push(item.count);
        } else {
            othersCount += item.count;
        }
    });

    if (othersCount > 0) {
        labels.push(`أخرى (${othersCount.toLocaleString()})`);
        data.push(othersCount);
    }

    return { labels, data };
}

async function make_main_data(json) {
    const featureMap = new Map();

    for (const row of json) {
        const feature = row["Feature"];
        const label = row["FeatureLabel"];
        const count = parseInt(row["count"], 10);

        if (featureMap.has(feature)) {
            featureMap.get(feature).count += count;
        } else {
            featureMap.set(feature, { label, count });
        }
    }

    // تحويل الخريطة إلى مصفوفة وترتيبها تنازليًا حسب count
    const sortedFeatures = Array.from(featureMap.values())
        .sort((a, b) => b.count - a.count);

    const featureArray = Array.from(sortedFeatures.values());
    const uzz = aggregateOthers(featureArray, 21);

    return uzz;
}

async function make_category_feature_data(json) {
    // خريطة لكل category
    const categoryMap = new Map();

    for (const row of json) {
        const category = row["category"];
        const categoryLabel = row["categoryLabel"];
        const feature = row["Feature"];
        const featureLabel = row["FeatureLabel"];
        const count = parseInt(row["count"], 10);

        // إنشاء الخريطة الداخلية للفئة إذا لم توجد
        if (!categoryMap.has(category)) {
            categoryMap.set(category, { label: categoryLabel, features: new Map() });
        }

        const featuresMap = categoryMap.get(category).features;

        // جمع القيم لكل Feature داخل الفئة
        if (featuresMap.has(feature)) {
            featuresMap.get(feature).count += count;
        } else {
            featuresMap.set(feature, { label: featureLabel, count });
        }
    }

    // تحويل الخريطة إلى مصفوفة جاهزة للرسم
    const result = [];

    for (const [category, { label: categoryLabel, features }] of categoryMap.entries()) {
        const featureArray = Array.from(features.values());
        const { labels, data } = aggregateOthers(featureArray, 15);

        result.push({
            category,
            categoryLabel,
            labels,
            data
        });
    }

    return result;
}

async function one_chart(n, char1Data, title, pos, maintainAspectRatio = true) {
    // ---
    const loader = document.getElementById(`loader${n}`);
    let ctx = document.getElementById(`chart${n}`);
    // ---
    if (!ctx) return;
    // ---
    let ctx2d = ctx.getContext('2d');
    // ---
    // رسم المخطط وإخفاء مؤشر التحميل الخاص به
    if (char1Data.labels.length > 0) {
        createChart(ctx2d, char1Data, title, pos, maintainAspectRatio);
        // ---
    }
    // ---
    // تحديث إجمالي عدد المفردات
    const all_lemmas = document.getElementById(`all_lemmas_${n}`);
    // ---
    if (all_lemmas) {
        // sum achar1Data.data
        let total = char1Data.data.reduce((a, b) => a + b, 0);
        // ---
        // format total
        total = total.toLocaleString();
        // ---
        all_lemmas.innerHTML = ` (${total}) `
    }
    // ---
    if (loader) {
        loader.style.opacity = '0';
        setTimeout(() => loader.style.display = 'none', 300);
    }
}

function make_card(index, title, height) {
    return `
        <div class="card mb-2">
            <div class="card-header">
                <h2 class="card-title h4 fw-bold text-center">
                    ${title}
                </h2>
            </div>
            <div class="card-body">
                <div class="position-relative" style="min-height: ${height}; width: 100%;">
                    <div id="loader${index}" class="loader">
                        <div class="d-flex align-items-center">
                            <div class="spinner-border text-primary" role="status">
                                <span class="visually-hidden">Loading...</span>
                            </div>
                            <span class="ms-3 h5 fw-semibold text-secondary">جاري تحميل البيانات...</span>
                        </div>
                    </div>
                    <canvas id="chart${index}"></canvas>
                </div>
            </div>
        </div>
    `;
}
const GlobalLabels = {
    "Q1317831": "مبني للمعلوم",
    "Q1194697": "مبني للمجهول",

    "Q51929074": "ضمير> غائب",
    "Q51929049": "ضمير> مخاطب",
    "Q21714344": "ضمير> متكلم",

    "Q53997857": "أقسام الاسم> نكرة",
    "Q53997851": "أقسام الاسم> معرفة",

    "Q499327": "الجنس> مذكر",
    "Q1775415": "الجنس> مؤنث",

    "Q110786": "الكمية> مفرد",
    "Q146786": "الكمية> جمع",
    "Q110022": "الكمية> مثنى",

    "Q23663136": "فعل> ماضي تام",
    "Q192613": "فعل> مضارع",
    "Q1994301": "فعل> ماض",
    "Q22716": "فعل> أمر",
    "Q12230930": "فعل> مضارع",
    "Q24905": "فعل",

    "Q473746": "منصوب",
    "Q462367": "حالة الإعراب > جزم",
    "Q56649265": "مضارع ناقص",
    "Q146078": "حالة الإعراب > نصب",
    "Q131105": "حالة الإعراب > رفع",
    "Q146233": "إضافة",
    "Q117262361": "صيغة الوقف",
    "Q1641446": "مركب",

    "Q72249355": "اِسْم الْفَاعِل",
    "Q72249544": "اِسْم الْمَفْعُول",
    "Q1350145": "اسم مصدر",

    "Q124351233": "أدائي",
    "Q682111": "الصيغة الخبرية",
    "Q1923028": "مصدر",
    "Q1084": "اسم",
    "Q118465097": "الصيغة السياقية",
    "Q1401131": "الجملة الاسمية",
    "Q1098772": "جمع التكسير",
    "Q625420": "perfect tense",
    "Q175026": "مفعول به",
    "Q20386151": "جمع سالم",
    "Q64005357": "past perfect",
    "Q77768943": "غير رسمي",
    "Q108834751": "توكيد الأفعال بالنون",
    "Q28640": "مهنة",
    "Q34698": "صفة",
    "Q181970": "لفظ أثري",
    "Q694268": "collective",
    "Q1478451": "لا",
    "Q1555419": "اسم تفضيل",
    "Q1969448": "مصطلح",
    "Q12185455": "الجر",
    "Q22928968": "اسم مفعول",
    "Q51929154": "الجمع",
    "Q71470598": "first-person possessive",
    "Q78191294": "ضمير الملكية للمفرد",
    "Q96406455": "long form",
    "Q96406487": "short form",
    "Q120867784": "مَفْعُول"
}
function change_labels(data) {
    // set categoryLabel from GlobalLabels if category in GlobalLabels
    // set FeatureLabel from GlobalLabels if Feature in GlobalLabels
    for (const row of data) {
        if (GlobalLabels[row["category"]]) {
            row["categoryLabel"] = GlobalLabels[row["category"]];
        }
        if (GlobalLabels[row["Feature"]]) {
            row["FeatureLabel"] = GlobalLabels[row["Feature"]];
        }
    }
    return data;
}

async function initializeCharts() {
    let title = ' إجمالي استخدامات الميزات النحوية في المفردات العربية <span id="all_lemmas_00"></span>';
    // ---
    let json = await loadsparqlQuery(queries.lexicalCategoriesArabic, true);
    // ---
    json = change_labels(json);
    // ---
    let main_data = await make_main_data(json);
    // ---
    let pos = (main_data.labels.length > 15) ? "bottom" : "right";
    let height = "320px"; //(main_data.labels.length > 15) ? "400px" : "220px";
    // ---
    $("#canvas_container").append(make_card(0, title, height));
    // ---
    await one_chart(0, main_data, title, "right", false);
    // ---
    let all_categories_data = await make_category_feature_data(json);
    // ---
    for (const [index, categoryData] of all_categories_data.entries()) {
        // ---
        let index2 = index + 1;
        // ---
        let title = `
            الميزات النحوية في مفردات التصنيف المعجمي:
            <a target="_blank" href="https://www.wikidata.org/entity/${categoryData.category}">
            ${categoryData.categoryLabel} (${categoryData.category})</a>
            <span id="all_lemmas_${index2}"></span>
            `;
        // ---
        let pos = (categoryData.labels.length > 20) ? "bottom" : "right";
        let height = (categoryData.labels.length > 20) ? "400px" : "220px";
        let maintainAspectRatio = (categoryData.labels.length > 20) ? true : false;
        // ---
        $("#canvas_container").append(make_card(index2, title, height));
        // ---
        await one_chart(index2, categoryData, title, pos, false);
    }
}
