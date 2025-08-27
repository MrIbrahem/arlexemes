
let isHorizontal = true;

function add_html() {
    let splitViewModal = `
        <div class="modal fade" id="splitViewModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-fullscreen">
                <div class="modal-content">
                    <div class="modal-headerx" style="padding: 1rem 1rem">
                        <!-- جزء العنوان مع أيقونة التبديل بجانبه -->
                        <div class="d-flex justify-content-between align-items-center w-100">
                            <span class="modal-title h5 me-2">مقارنة الصفحات:</span>
                            <button type="button" id="toggleIcon" class="btn btn-sm btn-outline-secondary"
                                onclick="toggleViewMode()" title="تبديل العرض">
                                <i class="bi bi-layout-split"></i>
                            </button>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="إغلاق"></button>
                        </div>
                        <!-- زر الإغلاق في أقصى اليمين -->
                    </div>
                    <div class="modal-body p-0">
                        <div id="splitContainer" class="d-flex flex-nowrap" style="height: 100%; overflow-x: auto;">
                            <!-- الأقسام سيتم توليدها ديناميكيًا هنا -->
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    // ---
    document.body.insertAdjacentHTML('beforeend', splitViewModal);
}

function openSplitView(ids) {
    const container = document.getElementById("splitContainer");
    container.innerHTML = ""; // مسح المحتوى القديم

    ids.forEach(id => {
        const col = document.createElement("div");
        col.className = "flex-fill border-between";
        col.style.flex = "1 1 " + (100 / ids.length) + "%";
        col.style.height = "100%";

        const iframe = document.createElement("iframe");
        iframe.style.width = "100%";
        iframe.style.height = "100%";
        iframe.style.border = "none";
        iframe.src = "/lex_just_table.php?wd_id=" + id;

        col.appendChild(iframe);
        container.appendChild(col);
    });

    // إعادة ضبط الاتجاه عند فتح نافذة جديدة
    if (isHorizontal) {
        container.classList.add("flex-nowrap");
        container.classList.remove("flex-column");
    } else {
        container.classList.add("flex-column");
        container.classList.remove("flex-nowrap");
    }
}

function toggleViewMode() {
    const container = document.getElementById("splitContainer");
    const icon = document.getElementById("toggleIcon");

    if (isHorizontal) {
        container.classList.remove("flex-nowrap");
        container.classList.add("flex-column");
        if (icon) icon.style.transform = "rotate(90deg)";
    } else {
        container.classList.remove("flex-column");
        container.classList.add("flex-nowrap");
        if (icon) icon.style.transform = "rotate(0deg)";
    }
    isHorizontal = !isHorizontal;
}

document.addEventListener('DOMContentLoaded', () => add_html());
