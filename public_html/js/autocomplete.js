
// هنا سيأتي كود JavaScript
const searchInput = document.getElementById('wikidatasearch');
const resultsContainer = document.getElementById('autocomplete-results');
let debounceTimeout;

async function fetchWikidataSuggestions(query, callback) {
    const loader = $('#autocomplete-loader');

    if (!query) {
        resultsContainer.innerHTML = '';
        loader.hide();
        return;
    }

    loader.show();

    let apiUrl;
    // ---
    apiUrl = `https://www.wikidata.org/w/api.php?action=wbsearchentities&format=json&language=ar&search=${encodeURIComponent(query)}&utf8=1&type=lexeme&limit=10&origin=*`;
    // ---
    let data_source = document.getElementById("data_source");
    data_source = data_source ? data_source.value.trim() : "";
    // ---
    apiUrl = `/autocomplete.php?data_source=${data_source}&term=${encodeURIComponent(query)}`;

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        callback(data.search); // دالة لعرض الاقتراحات
    } catch (error) {
        console.error('Error fetching Wikidata suggestions:', error);
        resultsContainer.innerHTML = '<div class="autocomplete-item text-danger">خطأ في جلب البيانات.</div>';
    } finally {
        loader.hide();
    }
}

// دالة لعرض الاقتراحات في الـ UI
function displaySuggestions(suggestions) {
    resultsContainer.innerHTML = ''; // مسح النتائج السابقة

    if (suggestions && suggestions.length > 0) {
        suggestions.forEach(item => {
            const div = document.createElement('div');
            div.classList.add('autocomplete-item');
            div.dataset.id = item.id; // تخزين الـ QID
            div.dataset.label = item.label; // تخزين التسمية

            let htmlContent = `<strong>${item.label}</strong>`;
            if (item.description) {
                htmlContent += ` <span class="description">(${item.description})</span>`;
            }
            div.innerHTML = htmlContent;

            resultsContainer.appendChild(div);
        });
    } else {
        resultsContainer.innerHTML = '<div class="autocomplete-item">لا توجد نتائج</div>';
    }
}

function load_search(callback) {
    // الاستماع لأحداث الكتابة في مربع الإدخال مع Debounce
    if (searchInput) {

        searchInput.addEventListener('input', (event) => {
            clearTimeout(debounceTimeout); // مسح المؤقت السابق
            const query = event.target.value.trim();

            debounceTimeout = setTimeout(() => {
                fetchWikidataSuggestions(query, displaySuggestions);
            }, 300); // الانتظار 300 مللي ثانية بعد آخر كتابة
        });

        // الاستماع لأحداث النقر على الاقتراحات
        resultsContainer.addEventListener('click', (event) => {
            const clickedItem = event.target.closest('.autocomplete-item'); // التأكد من النقر على العنصر الصحيح أو أحد أبنائه

            if (clickedItem) {
                const selectedId = clickedItem.dataset.id;
                const selectedLabel = clickedItem.dataset.label;

                searchInput.value = selectedId || selectedLabel; // وضع التسمية المختارة في مربع الإدخال
                resultsContainer.innerHTML = ''; // مسح قائمة الاقتراحات
                // هنا يمكنك استخدام selectedId (الـ QID) للقيام بشيء آخر، مثل حفظه أو تحميل بيانات إضافية.
                console.log('Selected Wikidata ID:', selectedId);

                if (typeof callback === 'function') {
                    callback(selectedId);
                }
            }
        });

        // إخفاء النتائج عند النقر خارج مربع البحث أو قائمة النتائج
        document.addEventListener('click', (event) => {
            if (!searchInput.contains(event.target) && !resultsContainer.contains(event.target)) {
                resultsContainer.innerHTML = ''; // مسح النتائج
            }
        });
    }
}
