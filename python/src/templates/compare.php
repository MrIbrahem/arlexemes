{% extends "main.php" %}

{% block content %}

<style>
    /* حد عمودي بين الإطارين */
    .border-between {
        border-left: 3px solid #ccc;
    }

    /* إذا الوضع عمودي نغير الحد ليكون أفقي */
    .flex-column .border-between {
        border-left: none;
        border-bottom: 3px solid #ccc;
    }
</style>
<div class="container my-4">
    <div class="d-flex align-items-center justify-content-center">
        <div class="row col-md-10 border rounded">
            <div class="max-w-3xl mx-auto rounded-lg shadow-md p-6 bg-light-subtle">
                <div class="row m-6 p-3">
                    <div class="col-md-10 col-sm-10 mb-2 mb-md-0">
                        <span class="text-2xl font-bold text-center h2">
                            مقارنة المفردات:
                        </span>
                        ({%for qid in qids %}
                        {%if not loop.first%} - {%endif%}
                        <a href="https://www.wikidata.org/entity/{{qid}}" target="_blank">
                            <span class="fs-5">
                                <span find-label="{{qid}}" find-label-both="true">{{qid}}</span>
                            </span>
                        </a>
                        {%endfor%})
                    </div>
                    <div class="col-md-2 col-sm-2 mb-2 mb-md-0">
                        <a href="#" target="_blank" id="sparql_url" class="btn btn-outline-primary disabled" role="button">
                            <span class="d-flex text-center align-items-center">
                                <span class="query"></span>&nbsp;
                                استعلام
                            </span>
                        </a>
                        <!-- <span id="query_time" class="ms-3"></span> -->
                    </div>
                </div>
                <hr>
                <div id="loading" class="text-center text- hidden">
                    <div class="spinner-border spinner-border-sm" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    جارٍ التحميل (بطيء)...<br>أي مقترح لتحسين الاستعلام مرحب به
                </div>
                <div id="tables_container"></div>
            </div>
        </div>
    </div>
</div>
<script src="/static/js/lex/find_labels.js"></script>
<script src="/static/js/lexemes/queries.js"></script>
<script src="/static/js/lexemes/compare.js"></script>

<!-- نافذة Modal fullscreen -->
<div class="modal fade" id="splitViewModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-fullscreen">
        <div class="modal-content">
            <div class="modal-headerx" style="padding: 1rem 1rem">
                <!-- جزء العنوان مع أيقونة التبديل بجانبه -->
                <div class="d-flex justify-content-between align-items-center">
                    <span class="modal-title h5 me-2">عرض الصفحتين</span>
                    <button type="button" class="btn btn-sm btn-outline-secondary"
                        onclick="toggleViewMode()" title="تبديل العرض">
                        <i class="bi bi-layout-split"></i>
                    </button>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="إغلاق"></button>
                </div>
                <!-- زر الإغلاق في أقصى اليمين -->
            </div>
            <div class="modal-body p-0">
                <div id="splitContainer" class="row g-0 flex-nowrap" style="height: 100%;">
                    <div class="col border-between" style="flex: 1 1 50%;">
                        <iframe id="iframe1" style="width:100%; height:100%; border:none;"></iframe>
                    </div>
                    <div class="col" style="flex: 1 1 50%;">
                        <iframe id="iframe2" style="width:100%; height:100%; border:none;"></iframe>
                    </div>
                </div>
            </div>

        </div>
    </div>
</div>
<script>
    let isHorizontal = true;

    function openSplitView(id1, id2) {
        document.getElementById("iframe1").src = "/lex_just_table.php?wd_id=" + id1;
        document.getElementById("iframe2").src = "/lex_just_table.php?wd_id=" + id2;
    }

    function toggleViewMode() {
        const container = document.getElementById("splitContainer");
        const icon = document.getElementById("toggleIcon");

        if (isHorizontal) {
            // تحويل لعرض عمودي
            container.classList.remove("flex-nowrap");
            container.classList.add("flex-column");
            icon.style.transform = "rotate(90deg)";
        } else {
            // تحويل لعرض أفقي
            container.classList.remove("flex-column");
            container.classList.add("flex-nowrap");
            icon.style.transform = "rotate(0deg)";
        }
        isHorizontal = !isHorizontal;
    }
    document.addEventListener('DOMContentLoaded', () => load_compare());
</script>

{% endblock %}
