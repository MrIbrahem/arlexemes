function getRandomArabicLetter() {
    const arabicLetters = 'ابتثجحخدذرزسشصضطظعغفقكلمنهوي';
    const index = Math.floor(Math.random() * arabicLetters.length);
    return arabicLetters[index];
}

function show_random(data) {
    if (data && data.length > 0) {
        // اختيار عنصر عشوائي من النتائج
        const randomIndex = Math.floor(Math.random() * data.length);
        const item = data[randomIndex];
        if (item && item.id) {
            $("#wikidatasearch_label").text(item.label);
            $("#wd_id").val(item.id);
        }
    }
}

function randomCategory() {
    $("#wd_id").removeClass("alert-danger");

    // اختيار حرف عربي عشوائي
    const query = getRandomArabicLetter();

    // إرسال الطلب مع الحرف العشوائي
    fetchWikidataSuggestions(query, show_random);
}
