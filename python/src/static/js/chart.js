

// نقطة نهاية SPARQL لويكي داتا
const WIKIDATA_ENDPOINT = 'https://query.wikidata.org/sparql';

// تعريف استعلامات SPARQL
const queries = {
    // الاستعلام الأول: الفئات المعجمية للغة العربية (wd:Q13955)
    lexicalCategoriesArabic: `
                SELECT ?category ?categoryLabel ?c WHERE {
                {
                    SELECT * WHERE {
                    SELECT ?category (COUNT(?item) AS ?c) WHERE {
                        ?item dct:language wd:Q13955;
                        wikibase:lexicalCategory ?category.
                    }
                    GROUP BY ?category
                    ORDER BY DESC (?c)
                    LIMIT 10
                    }
                }
                SERVICE wikibase:label { bd:serviceParam wikibase:language "ar,en". }
                }
                ORDER BY DESC (?c)
                LIMIT 10
            `,
    // الاستعلام الثاني: عدد المفردات لأفضل 10 لغات
    lexemesPerLanguage: `
                SELECT ?language ?languageLabel ?c ?ISO WHERE {
                {
                    SELECT ?language (COUNT(?lexeme) AS ?c) WHERE { ?lexeme dct:language ?language. }
                    GROUP BY ?language
                    ORDER BY DESC (?c)
                    LIMIT 9
                }
                UNION
                {
                    SELECT ?language (COUNT(?lexeme) AS ?c) WHERE {
                    VALUES ?language {
                        wd:Q13955
                    }
                    ?lexeme dct:language ?language.
                    }
                    GROUP BY ?language
                }
                SERVICE wikibase:label { bd:serviceParam wikibase:language "ar,en". }
                OPTIONAL { ?language wdt:P218 ?ISO. }
                }
                ORDER BY DESC (?c)

            `
};

/**
 * دالة لجلب البيانات من ويكي داتا
 * @param {string} sparqlQuery - استعلام SPARQL المراد تنفيذه
 * @param {string} labelKey - المفتاح الذي يحتوي على التسمية (مثل 'categoryLabel' أو 'languageLabel')
 * @returns {Promise<object>} - كائن يحتوي على العناوين والبيانات
 */
async function fetchWikidata(sparqlQuery, labelKey, labelKey2) {
    const fullUrl = `${WIKIDATA_ENDPOINT}?query=${encodeURIComponent(sparqlQuery)}`;

    try {
        const response = await fetch(fullUrl, {
            headers: {
                'Accept': 'application/sparql-results+json'
            }
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const json = await response.json();
        const bindings = json.results.bindings;

        const labels = bindings.map(b =>
            b[labelKey2]?.value ? `${b[labelKey]?.value} (${b[labelKey2]?.value})` : b[labelKey]?.value
        );
        const data = bindings.map(b => parseInt(b.c.value, 10));

        return {
            labels,
            data
        };
    } catch (error) {
        console.error("فشل في جلب البيانات:", error);
        // إظهار رسالة خطأ للمستخدم
        // alert(`حدث خطأ أثناء جلب البيانات للاستعلام. يرجى التحقق من وحدة التحكم لمزيد من التفاصيل.`);
        return {
            labels: [],
            data: []
        }; // إرجاع بيانات فارغة عند الفشل
    }
}

/**
 * دالة لإنشاء مخطط دائري
 * @param {CanvasRenderingContext2D} ctx - سياق لوحة الرسم
 * @param {string[]} labels - مصفوفة العناوين للشرائح
 * @param {number[]} data - مصفوفة البيانات المقابلة للشرائح
 * @param {string} title - عنوان المخطط
 */
function createChart(ctx, {
    labels,
    data
}, title) {
    const chartColors = [
        'rgba(54, 162, 235, 0.8)', 'rgba(255, 99, 132, 0.8)',
        'rgba(255, 206, 86, 0.8)', 'rgba(75, 192, 192, 0.8)',
        'rgba(153, 102, 255, 0.8)', 'rgba(255, 159, 64, 0.8)',
        'rgba(46, 204, 113, 0.8)', 'rgba(231, 76, 60, 0.8)',
        'rgba(52, 73, 94, 0.8)', 'rgba(241, 196, 15, 0.8)'
    ];

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
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    // fullSize: true,
                    rtl: true,
                    textDirection: "rtl",
                    labels: {
                        color: 'var(--bs-body-color)',
                        font: {
                            // family: "'Cairo', sans-serif",
                            size: 16
                        },
                        usePointStyle: true
                    }
                },
                tooltip: {
                    // bodyFont: { family: "'Cairo', sans-serif" },
                    // titleFont: { family: "'Cairo', sans-serif" },
                    // callbacks: { label: context => `${context.label || ''}: ${context.parsed}` }
                },
                title: {
                    display: false // تم وضع العنوان في HTML بالفعل
                }
            }
        }
    });
}

/**
 * الدالة الرئيسية لتشغيل العملية عند تحميل الصفحة
 */
async function initializeCharts() {
    // DOM Elements
    const loader1 = document.getElementById('loader1');
    const loader2 = document.getElementById('loader2');

    const ctx1 = document.getElementById('chart1').getContext('2d');
    const ctx2 = document.getElementById('chart2').getContext('2d');
    // جلب البيانات لكلا المخططين بالتوازي
    const [chart1Data, chart2Data] = await Promise.all([
        fetchWikidata(queries.lexicalCategoriesArabic, 'categoryLabel', "c"),
        fetchWikidata(queries.lexemesPerLanguage, 'languageLabel', "ISO")
    ]);

    // رسم المخطط الأول وإخفاء مؤشر التحميل الخاص به
    if (chart1Data.labels.length > 0) {
        createChart(ctx1, chart1Data, 'الفئات المعجمية في اللغة العربية');
    }
    loader1.style.opacity = '0';
    setTimeout(() => loader1.style.display = 'none', 300);


    // رسم المخطط الثاني وإخفاء مؤشر التحميل الخاص به
    if (chart2Data.labels.length > 0) {
        createChart(ctx2, chart2Data, 'أفضل 9 لغات + العربية حسب عدد المفردات');
    }
    loader2.style.opacity = '0';
    setTimeout(() => loader2.style.display = 'none', 300);
}
