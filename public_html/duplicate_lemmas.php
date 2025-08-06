<?php

require __DIR__ . "/main.php";

?>

<div class="container-fluid">
    <div class="row justify-content-center">
        <div class="col-lg-10 col-sm-12">
            <div class="card shadow rounded-4">
                <div class="card-header">
                    <span id="h1" class="card-title fs-3 fw-bold mb-3"> المفردات المكررة </span>
                </div>

                <div class="card-body">
                    <div id="loading" class="text-center text-blue-600">جارٍ التحميل...</div>
                    <div id="rowCount" class="mb-3 text-center fw-bold"></div>
                    <div id="tables_container"></div>
                </div>
            </div>
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
