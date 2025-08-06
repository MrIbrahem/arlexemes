<?php

require __DIR__ . "/main.php";

?>

<div class="container my-4">
    <div class="d-flex align-items-center justify-content-center">
        <div class="row col-md-9">
            <div class="max-w-3xl mx-auto rounded-lg shadow-md p-6 bg-light-subtle">
                <h3 class="text-2xl font-bold text-center m-6 p-3"> المخطط الشجري للكلمات <span id="total"></span>
                </h3>
                <form method="GET" class="mb-0">
                    <div class="row">
                        <div class="col-md-3">
                            <div class="form-group">
                                <label for="group_by" class="form-label fw-bold">التصنيف:</label>
                                <select name="data_source" id="data_source" class="form-select d-inline-block">
                                    <option value="all">الكل</option>
                                    <option value="Q34698">صفة</option>
                                    <option value="Q24905">فعل</option>
                                    <option value="Q1084">اسم</option>
                                    <option value="Q111029">جذر</option>
                                </select>
                            </div>
                        </div>
                        <div class="col-md-4 col-sm-6">
                            <div class="form-group">
                                <label for="group_by" class="form-label fw-bold">جمع بـ:</label>
                                <select name="group_by" id="group_by" class="form-select w-100 d-inline-block" onchange="toggleCustomInput()">
                                    <!-- <option value="P31Label">Instance of - P31</option>
                                    <option value="P5185">الجنس النحوي - P5185</option>
                                    <option value="categoryLabel">التصنيف المعجمي</option>
                                    <option value="P6771">Arabic Ontology concept ID - P6771</option>
                                    <option value="P11038">Arabic Ontology lemma ID - P11038</option>
                                    <option value="P12451">Arabic Ontology lexical concept ID - P12451</option> -->
                                    <option value="custom">-- إدخال مخصص --</option>
                                </select>

                                <input type="text" name="custom_group_by" id="custom_group_by" class="form-control mt-2" placeholder="أدخل الخاصية يدويًا مثل P12345" style="display: none;" pattern="^P\d+$">
                            </div>
                        </div>
                        <div class="col-md-2 col-sm-6">
                            <label for="limit" class="form-label fw-bold">العدد:</label>
                            <input type="number" id="limit" name="limit" class="form-control"
                                placeholder="عدد النتائج" value="1000">
                        </div>
                        <div class="col-md-3 col-sm-12">
                            <label class="form-label fw-bold"></label>
                            <button type="submit" class="form-control btn btn-outline-primary">تحميل</button>
                        </div>
                    </div>
                    <div class="mb-3">
                        <hr>
                        <input type="text" id="searchInput" placeholder="ابحث عن كلمة..." class="form-control" />
                    </div>
                </form>

                <div id="loading" class="text-center text-primary hidden">جارٍ التحميل...</div>

                <div id="error" class="hidden alert alert-danger p-4 rounded text-center">
                    <p id="errorMessage" class="text-danger"></p>
                    <button onclick="loadfetchData()" class="mt-3 btn btn-primary">إعادة
                        المحاولة</button>
                </div>

                <ul id="tree" class="list-unstyled space-y-2"></ul>

                <p id="noResults" class="hidden text-center text-muted">لا توجد نتائج مطابقة للبحث.</p>
            </div>
        </div>
    </div>
</div>
<script src="/js/lex/find_labels.js"></script>
<script src="/js/lexemes/wd.js"></script>
<script>
    async function add_options_to_select(data_source, group_by) {
        let select = document.getElementById('group_by');
        // ---
        let data = await most_used_properties(data_source);
        // ---
        // console.log(data);
        // { "prop": "P5238", "propLabel": "يجمع بين وحدات معجمية", "usage": "10463" }
        // ---
        for (let i = 0; i < data.length; i++) {
            let option = document.createElement('option');
            option.value = data[i].prop;
            option.text = `${data[i].propLabel} (${data[i].usage})`;
            select.appendChild(option);
        }
        // ---
        $("#group_by").val(group_by);
    }

    async function loadfetchData() {
        // ---
        showLoading();
        // ---
        let group_by = get_param_from_window_location1("group_by", "P31Label")
        let custom_group_by = get_param_from_window_location1("custom_group_by", "")
        let limit = get_param_from_window_location1("limit", 100)
        let data_source = get_param_from_window_location1("data_source", "all");
        // ---
        // let group_by_item = document.getElementById('group_by');
        // if (group_by_item) group_by_item.value = group_by;
        // ---
        $("#limit").val(limit);
        $("#data_source").val(data_source);
        // ---
        if (custom_group_by !== "" && group_by === "custom") {
            $("#custom_group_by").val(custom_group_by);
            group_by = custom_group_by;
            document.getElementById('custom_group_by').style.display = 'block';
        }
        // ---
        await add_options_to_select(data_source, group_by);
        // ---
        await fetchData(limit, data_source, group_by);
        // ---
        await find_labels();
    }

    function toggleCustomInput() {
        let select = document.getElementById('group_by');
        const customInput = document.getElementById('custom_group_by');
        if (select.value === 'custom') {
            customInput.style.display = 'block';
        } else {
            customInput.style.display = 'none';
        }
    }

    document.addEventListener('DOMContentLoaded', async () => {
        // ---
        await loadfetchData();
        // ---
        toggleCustomInput();
    });
</script>
<?php

require __DIR__ . "/footer.php";

?>
