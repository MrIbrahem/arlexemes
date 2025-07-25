
function generateColor(index, total) {
    const hue = (index * 500 / total) % 500;
    return `hsl(${hue}, 70%, 85%)`; // لون هادئ فاتح
}

function table_filter() {
    // لكل جدول على حدة
    let tables = document.querySelectorAll(".table");

    console.log("table_filter", tables.length);

    tables.forEach(table => {
        const wordMap = new Map();

        // اجمع كل العناصر التي تحتوي على word="..."
        const wordElements = table.querySelectorAll('[word]');

        console.log("wordElements", wordElements.length);

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
                let parent = el.parentElement.parentElement;
                parent.style.backgroundColor = color;
                parent.style.borderRadius = "4px";
                parent.style.padding = "2px 4px";

            });
        });
    });
}
