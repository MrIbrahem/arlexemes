
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
                    display: false,
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

    const dzz = aggregateOthers(sortedFeatures, 19);

    const labels = [];
    const data = [];
    let othersCount = 0;

    sortedFeatures.forEach((item, index) => {
        if (index < 19) {
            labels.push(`${item.label} (${item.count})`);
            data.push(item.count);
        } else {
            othersCount += item.count;
        }
    });

    // إضافة العنصر "أخرى" إذا كانت هناك عناصر متبقية
    if (othersCount > 0) {
        labels.push(`أخرى (${othersCount})`);
        data.push(othersCount);
    }

    // return { labels, data };
    return dzz;
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

async function one_chart(n, char1Data, maintainAspectRatio) {
    // ---
    const loader = document.getElementById(`loader${n}`);
    let ctx = document.getElementById(`chart${n}`);
    // ---
    let pos = (char1Data.labels.length > 15) ? "bottom" : "right";
    // ---
    if (!ctx) return;
    // ---
    let ctx2d = ctx.getContext('2d');
    // ---
    // رسم المخطط وإخفاء مؤشر التحميل الخاص به
    if (char1Data.labels.length > 0) {
        createChart(ctx2d, char1Data, "", pos, maintainAspectRatio);
        // ---
        // إضافة الـ legend داخل card
        const chartColors = getChartColors(char1Data.labels.length);
        const legendContainer = document.getElementById(`legend${n}`);
        if (legendContainer) {
            legendContainer.innerHTML = createLegendHTML(char1Data.labels, chartColors);
        }
    }
    // ---
    // تحديث إجمالي عدد المفردات
    const all_lemmas = document.getElementById(`all_lemmas_${n}`);
    // ---
    if (all_lemmas) {
        all_lemmas.innerHTML = ` (${char1Data.labels.length.toLocaleString()}) `
    }
    // ---
    if (loader) {
        loader.style.opacity = '0';
        setTimeout(() => loader.style.display = 'none', 300);
    }
}

function createLegendHTML(labels, colors) {
    const totalItems = labels.length;
    let numColumns = 1;

    if (totalItems === 10 || totalItems === 20) {
        numColumns = 2;
    }
    else if ((totalItems >= 11 && totalItems <= 19) ||
        (totalItems >= 20 && totalItems <= 29) ||
        (totalItems >= 31 && totalItems <= 39)) {
        numColumns = Math.ceil(totalItems / 10); // تقريبًا عمود لكل 10 عناصر

    } else if ((totalItems > 10 && totalItems < 20) || (totalItems > 20 && totalItems < 30)) {
        numColumns = Math.ceil(totalItems / 10);
    }

    const itemsPerColumn = Math.ceil(totalItems / numColumns);

    let html = `<div class="row custom-legend">`;

    for (let col = 0; col < numColumns; col++) {
        html += `<div class="col">`; // عمود bootstrap
        html += `<ul class="list-group list-group-flushx">`;

        const start = col * itemsPerColumn;
        const end = Math.min(start + itemsPerColumn, totalItems);

        for (let i = start; i < end; i++) {
            html += `
                <li class="list-group-item p-1">
                    <span style="display:inline-block;width:20px;height:20px;background-color:${colors[i]};margin-right:8px;border:1px solid #333;"></span>
                    <span>${labels[i]}</span>
                </li>
            `;
        }

        html += `</ul></div>`; // نهاية العمود
    }

    html += `</div>`; // نهاية row
    return html;
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
                <div class="row">
                    <div class="col-7">
                        <div id="legend${index}" class="ms-1 mt-1">
                            <!-- Legend سيضاف هنا -->
                        </div>
                    </div>
                    <div class="col-5">
                        <div class="position-relative" style="max-height: ${height}">
                            <div id="loader${index}" class="loader">
                                <div class="align-items-center">
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
            </div>
        </div>
    `;
}

async function initializeCharts() {
    // ---
    const json = await loadsparqlQuery(queries.lexicalCategoriesArabic, true);
    // ---
    let main_data = await make_main_data(json);
    // ---
    await one_chart(0, main_data, false);
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
        let height = (categoryData.labels.length > 15) ? "400px" : "220px";
        // ---
        $("#canvas_container").append(make_card(index2, title, height));
        // ---
        let maintainAspectRatio = (categoryData.labels.length > 20) ? true : false;
        // ---
        await one_chart(index2, categoryData, maintainAspectRatio);
    }
}
