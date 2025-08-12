{% extends "main.php" %}
{% block title %}
<title>استخدام خاصية الأنطولوجيا P11038</title>
{% endblock %}

{% set common_args = {
    'per_page': result.tab.per_page,
    'order': result.tab.order,
    'filter_data': result.tab.filter_data
} %}

{% set col_class = "col-md-4" %}

{% block content %}
<div class="container-fluid">
    <div class="row justify-content-center">
        <div class="col-lg-10 col-sm-12">
            <div class="card">
                <div class="card-header">
                    <span class="card-title mb-0 d-flex align-items-center justify-content-center h4">
                        استخدام خاصية:
                        <a href="https://www.wikidata.org/wiki/Property:P11038" target="_blank"
                            class="text-primary ms-2">
                            مدخل معجمي في موقع الأنطولوجيا العربية
                        </a>
                    </span>
                </div>
                <div class="card-body">
                    <!-- Filter Form -->
                    <form method="get" action="{{ url_for('view_logs_new') }}" class="form-inline mb-3 gap-2">
                        <div class="row justify-content-center align-items-center">
                            <div class="col-md-6">
                                <div class="row">
                                    <div class="col-md-3">
                                        <div class="form-group">
                                            <label for="per_page" class="form-label">في الصفحة</label>
                                            <select name="per_page" id="per_page" class="form-select w-100">
                                                {% for n in [25, 100, 200, 500, 1000, 5000] %}
                                                <option value="{{ n }}"
                                                    {% if result.tab.per_page == n %}selected{% endif %}>
                                                    {{ n }}
                                                </option>
                                                {% endfor %}
                                            </select>
                                        </div>
                                    </div>
                                    <div class="col-md-5">
                                        <div class="form-group">
                                            <label for="order_by" class="form-label">ترتيب</label>
                                            <select name="order_by" id="order_by" class="form-select w-100">
                                                {% for order_type in result.order_by_types %}
                                                <option value="{{ order_type }}"
                                                    {% if result.tab.order_by == order_type %}selected{% endif %}>
                                                    {{ order_type }}
                                                </option>
                                                {% endfor %}
                                            </select>
                                        </div>
                                    </div>
                                    <div class="col-md-4">
                                        <label for="order" class="input-label">تصاعدي/تنازلي</label>
                                        <div class="input-group">
                                            <div class="form-control d-flex flex-column">
                                                <div class="form-check form-check-inline">
                                                    <input class="form-check-input" type="radio" name="order"
                                                        id="desc" value="DESC"
                                                        {% if result.tab.order == 'DESC' %}checked{% endif %}>
                                                    <label class="form-check-label" for="desc">تنازلي</label>
                                                </div>
                                                <div class="form-check form-check-inline">
                                                    <input class="form-check-input" type="radio" name="order"
                                                        id="asc" value="ASC"
                                                        {% if result.tab.order == 'ASC' %}checked{% endif %}>
                                                    <label class="form-check-label" for="asc">تصاعدي</label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-3">
                                <div class="row">
                                    <div class="col-md-12">
                                        <label for="order" class="input-label">البيانات</label>
                                        <div class="input-group">
                                            <div class="form-control d-flex flex-column">
                                                <div class="form-check form-check-inline">
                                                    <input class="form-check-input" type="radio" name="filter_data"
                                                        id="filter_with" value="with"
                                                        {% if result.tab.filter_data == 'with' %}checked{% endif %}>
                                                    <label class="form-check-label" for="filter_with">
                                                        موصولة {% if result.total_logs_data %}
                                                        ({{ result.total_logs_data.with }}){% endif %}
                                                    </label>
                                                </div>
                                                <div class="form-check form-check-inline">
                                                    <input class="form-check-input" type="radio" name="filter_data"
                                                        id="filter_without" value="without"
                                                        {% if result.tab.filter_data == 'without' %}checked{% endif %}>
                                                    <label class="form-check-label" for="filter_without">
                                                        غير موصولة {% if result.total_logs_data %}
                                                        ({{ result.total_logs_data.without }}){% endif %}
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-1">
                                <button class="btn btn-primary me-3" type="submit"
                                    onclick1="applySettings()">بدء</button>
                            </div>
                        </div>
                    </form>
                    <div class="row mt-4">
                        <div class="col-12">
                            <!-- Pagination Navigation -->
                            <nav aria-label="Page navigation">
                                <ul class="pagination justify-content-center">
                                    <!-- First page -->
                                    <li class="page-item {% if result.tab.page == 1 %}disabled{% endif %}">
                                        <a class="page-link"
                                            href="{{ url_for('view_logs_new', page=1, **common_args) }}"
                                            aria-label="First Page">
                                            <span aria-hidden="true">{% if result.tab.page != 1 %}1{% endif %}
                                                &laquo;&laquo;</span>
                                        </a>
                                    </li>

                                    <!-- Previous page -->
                                    <li class="page-item {% if result.tab.page == 1 %}disabled{% endif %}">
                                        <a class="page-link"
                                            href="{{ url_for('view_logs_new', page=result.tab.page-1, **common_args) }}"
                                            aria-label="Previous Page">
                                            <span aria-hidden="true">&laquo;</span>
                                        </a>
                                    </li>

                                    <!-- Page Numbers -->
                                    {% for p in range(result.tab.start_page, result.tab.end_page + 1) %}
                                    <li class="page-item {% if p == result.tab.page %}active{% endif %}">
                                        <a class="page-link"
                                            href="{{ url_for('view_logs_new', page=p, **common_args) }}">
                                            {{ p }}
                                        </a>
                                    </li>
                                    {% endfor %}

                                    <!-- Next page -->
                                    <li
                                        class="page-item {% if result.tab.page == result.tab.total_pages %}disabled{% endif %}">
                                        <a class="page-link"
                                            href="{{ url_for('view_logs_new', page=result.tab.page+1, **common_args) }}"
                                            aria-label="Next Page">
                                            <span aria-hidden="true">&raquo;</span>
                                        </a>
                                    </li>

                                    <!-- Last page -->
                                    {% if result.tab.page != result.tab.total_pages %}
                                    <li
                                        class="page-item {% if result.tab.page == result.tab.total_pages %}disabled{% endif %}">
                                        <a class="page-link"
                                            href="{{ url_for('view_logs_new', page=result.tab.total_pages, **common_args) }}"
                                            aria-label="Last Page">
                                            <span aria-hidden="true">
                                                &raquo;&raquo; {{ result.tab.total_pages }}
                                            </span>
                                        </a>
                                    </li>
                                    {% endif %}
                                </ul>
                            </nav>
                        </div>

                        <!-- Page info -->
                        <div class="col-12 text-center text-muted">
                            <small>الصفحة {{ result.tab.page }} من {{ result.tab.total_pages }}
                                <!-- ({{ result.tab.start_log }} - {{ result.tab.end_log }} من أصل {{ result.tab.total_logs }} عنصر) -->
                            </small>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-md-12">
                            <table class="table table-striped table-hover table-bordered soro">
                                <thead>
                                    <tr data-dt-order="disable">
                                        <th></th>
                                        <th colspan="2">
                                            قسم الكلام
                                        </th>
                                        <th colspan="2">lemma</th>
                                        <th colspan="2">sama_lemma</th>
                                        <th colspan="2">ويكي بيانات</th>
                                    </tr>
                                    <tr>
                                        <th>#</th>
                                        <th>
                                            <span title="(اسم، فعل، كلمة وظيفية)">
                                                الفئة
                                            </span>
                                        </th>
                                        <th>
                                            <span title="(اسم، فعل ماضي، صفة، ظرف، ضمير، ... الخ)">
                                                الوسم
                                            </span>
                                        </th>
                                        <th>المُعرّف</th>
                                        <th>المدخل المعجمي</th>
                                        <th>المُعرّف</th>
                                        <th>المدخل المعجمي</th>
                                        <th>معرف</th>
                                        <th>التصنيف المعجمي</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {% for log in result.logs %}
                                    <tr>
                                        <!-- { "id": 1, "lemma_id": 2023254709, "lemma": "سَلَاقِيٌّ", "pos": "اسم", "qid": "" } -->
                                        <td>{{ loop.index }}</td>
                                        <td>
                                            {{ log.pos_cat }}
                                        </td>
                                        <td class="ltr_right">
                                            {{ log.pos }}
                                        </td>
                                        <td class="ltr_left">
                                            <a href="https://ontology.birzeit.edu/lemma/{{ log.lemma_id }}"
                                                target="_blank">
                                                {{ log.lemma_id }}
                                            </a>
                                        </td>
                                        <td>
                                            {{ log.lemma }}
                                        </td>
                                        <td class="ltr_left">
                                            {%if log.sama_lemma_id %}
                                            <a href="https://ontology.birzeit.edu/lemma/{{ log.sama_lemma_id }}"
                                                target="_blank">
                                                {{ log.sama_lemma_id }}
                                            </a>
                                            {%endif%}
                                        </td>
                                        <td>
                                            {{ log.sama_lemma }}
                                        </td>
                                        <td>
                                            {%if log.vi_wd_id %}
                                            <a href="https://www.wikidata.org/entity/{{log.vi_wd_id}}#P11038"
                                                target="_blank">
                                                {{log.vi_wd_id}}
                                            </a>
                                            {%endif%}
                                        </td>
                                        <td>
                                            {%if log.vi_wd_id_category %}
                                            {{log.vi_wd_id_category}}
                                            <!-- <a href="https://www.wikidata.org/entity/{{log.vi_wd_id_category}}" target="_blank">{{log.vi_wd_id_category}}</a> -->
                                            {%endif%}
                                        </td>
                                    </tr>
                                    {% endfor %}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    </div>
</div>
{% if time_tab %}
    {% for name, exec_time in time_tab.items() %}
    <span>{{ name }}: {{ exec_time }} s</span><br>
    {% endfor %}
{% endif %}

{% endblock %}
