

function generateColor(index, total) {
    const hue = (index * 360 / total) % 360;
    return `hsl(${hue}, 70%, 85%)`; // لون هادئ فاتح
}

function table_filter() {

    // لكل جدول على حدة
    document.querySelectorAll(".table").forEach(table => {
        const wordMap = new Map();

        // اجمع كل العناصر التي تحتوي على word="..."
        const wordElements = table.querySelectorAll('[word]');
        wordElements.forEach(el => {
            const word = el.getAttribute("word");
            if (!wordMap.has(word)) {
                wordMap.set(word, []);
            }
            wordMap.get(word).push(el);
        });

        // خذ فقط الكلمات المتكررة (أكثر من 1)
        const repeatedWords = Array.from(wordMap.entries()).filter(([_, els]) => els.length > 1);

        // لوّن كل مجموعة بلون مختلف
        repeatedWords.forEach(([word, elements], index) => {
            const color = generateColor(index, repeatedWords.length);
            elements.forEach(el => {
                el.style.backgroundColor = color;
                el.style.borderRadius = "4px";
                el.style.padding = "2px 4px";
            });
        });
    });
}
