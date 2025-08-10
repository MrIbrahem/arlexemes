function generateColor(index, total) {
    const hue = (index * 500 / total) % 360;
    return `hsl(${hue}, 70%, 85%)`; // لون هادئ فاتح
}

function table_filter() {
    let tables = document.querySelectorAll(".table");

    console.log("table_filter2", tables.length);

    tables.forEach((table, tableIndex) => {
        const wordMap = new Map();
        const wordElements = table.querySelectorAll('[word]');
        console.log("wordElements", wordElements.length);

        wordElements.forEach(el => {
            const word = el.getAttribute("word");
            if (word.trim() === "") {
                return;
            }
            if (!wordMap.has(word)) {
                wordMap.set(word, []);
            }
            wordMap.get(word).push(el);
        });

        const repeatedWords = Array.from(wordMap.entries()).filter(([_, els]) => els.length > 1);

        repeatedWords.forEach(([word, elements], index) => {
            const color = generateColor(index, repeatedWords.length);
            elements.forEach(el => {
                // ---
                // let td = el.parentElement.parentElement;
                let td = el.closest('td');
                // ---
                const wordInSameTd = td.querySelectorAll('[word]');

                if (wordInSameTd.length > 1) {
                    // أكثر من عنصر word داخل نفس td → نلوّن el فقط
                    el.classList.add("highlighted-word");
                    el.classList.add("hide-highlight");
                    // el.style.setProperty('--highlight-color', color);
                    el.style.setProperty('background-color', color);
                } else {
                    // عنصر word وحيد داخل td → نلوّن td
                    td.classList.add("highlighted-word");
                    td.classList.add("hide-highlight");
                    // td.style.setProperty('--highlight-color', color);
                    td.style.setProperty('background-color', color);
                }
            });
        });
    });
}

// زر التبديل
function toggleHighlights() {
    document.querySelectorAll(".highlighted-word").forEach(el => {
        el.classList.toggle("hide-highlight");
    });
}
