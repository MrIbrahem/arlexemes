<?php

require __DIR__ . "/main.php";

?>
<div class="container-fluid my-5">
    <div class="card shadow rounded-4">
        <div class="card-header text-center h4">
            <div class="row">
                <div class="col-md-4">
                    <h1 id="h1" class="card-title text-center fs-3 fw-bold mb-3">تحليل المكرر</h1>
                </div>
            </div>
        </div>

        <div class="card-body">
            <div id="loading" class="text-center text-blue-600">جارٍ التحميل...</div>
            <div id="rowCount" class="mb-3 text-center fw-bold"></div>
            <div id="tables_container"></div>
        </div>
    </div>
</div>
<script src="/js/duplicate_lemmas.js"></script>
<script>
    document.addEventListener('DOMContentLoaded', () => load_duplicate());
</script>

<?php

require __DIR__ . "/footer.php";

?>
