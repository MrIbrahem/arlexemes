<?php

require __DIR__ . "/main.php";

?>

<div class="container my-4">
    <div class="d-flex align-items-center justify-content-center">
        <div class="row col-md-10 border rounded">
            <div class="max-w-3xl mx-auto rounded-lg shadow-md p-6 bg-light-subtle">
                <div class="d-flex align-items-center justify-content-between  m-6 p-3">
                    <span class="text-2xl font-bold text-center h2">
                        قائمة المفردات العربية: <span id="total"></span>
                    </span>

                    <form method="GET">
                        <div class="row">
                            <div class="col-md-6">
                                <div class="input-group">
                                    <span class="input-group-text">التصنيف</span>
                                    <select name="data_source" id="data_source" class="form-select d-inline-block" onchange="toggleCustomInput()">
                                        <option value="all">الكل</option>
                                        <option value="Q34698">صفة</option>
                                        <option value="Q24905">فعل</option>
                                        <option value="Q1084">اسم</option>
                                        <option value="Q111029">جذر</option>
                                        <option value="custom">إدخال مخصص</option>
                                    </select>
                                </div>
                            </div>
                            <div class="col-md-3 text-center">
                                <input type="number" id="limit" name="limit" class="form-control" placeholder="عدد النتائج" value="1000">
                            </div>
                            <div class="col-md-3 text-center">
                                <button type="submit" class="btn btn-primary">تحميل</button>
                            </div>

                            <input type="text" name="custom_data_source" id="custom_data_source" class="form-control mt-2" placeholder="أدخل القيمة يدويًا مثل Q12345" style="display: none;" pattern="^Q\d+$">
                        </div>

                    </form>
                </div>
                <hr>
                <div id="loading" class="text-center text-primary hidden">جارٍ التحميل...</div>

                <div id="error" class="hidden alert alert-danger p-4 rounded text-center">
                    <p id="errorMessage" class="text-danger"></p>
                    <button onclick="loadfetchData()" class="mt-3 btn btn-primary">إعادة
                        المحاولة</button>
                </div>

                <ul id="tree" class="list-unstyled space-y-2"></ul>
                <ul class="nav nav-tabs" id="myTab" role="tablist">
                </ul>
                <div class="tab-content row list-group mt-3" id="myTabContent">
                </div>
                <p id="noResults" class="hidden text-center text-muted">لا توجد نتائج مطابقة للبحث.</p>
            </div>
        </div>
    </div>
</div>
<script src="/js/lexemes/wd_result.js"></script>
<script src="/js/lexemes/list_lexemes.js"></script>
<script>
    function loadfetchData() {
        // ---
        showLoading();
        // ---
        let limit = get_param_from_window_location("limit", 100);
        let data_source = get_param_from_window_location("data_source", "all");
        let custom_data_source = get_param_from_window_location("custom_data_source", "");
        // ---
        // document.getElementById('custom_data_source').value = custom_data_source;
        // ---
        $("#limit").val(limit);
        $("#data_source").val(data_source);
        // ---
        if (custom_data_source !== "" && data_source === "custom") {
            $("#custom_data_source").val(custom_data_source);
            data_source = custom_data_source;
            document.getElementById('custom_data_source').style.display = 'block';
        }
        // ---
        fetchListData(limit, data_source);
    }

    function toggleCustomInput() {
        let select = document.getElementById('data_source');
        const customInput = document.getElementById('custom_data_source');
        if (select.value === 'custom') {
            customInput.style.display = 'block';
        } else {
            customInput.style.display = 'none';
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        // ---
        loadfetchData();
        // ---
        toggleCustomInput();
    });
</script>
<?php

require __DIR__ . "/footer.php";

?>
