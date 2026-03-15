
function generateColor(index) {
    const baseColors = [
        [54, 162, 235], [255, 99, 132],
        [255, 206, 86], [75, 192, 192],
        [153, 102, 255], [255, 159, 64],
        [46, 204, 113], [231, 76, 60],
        [52, 73, 94], [241, 196, 15]
    ];

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

function createLegendHTML(labels, colors) {
    const totalItems = labels.length;
    let numColumns = 1;

    if (totalItems > 10) {
        numColumns = Math.ceil(totalItems / 10);
    } else if (totalItems === 10) {
        numColumns = 2;
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
