
async function table_toggle() {
    // var table =
    $('.pages_table1').DataTable({
        stateSave: false,
        paging: false,
        info: false,
        searching: false
    });

    /*document.querySelectorAll('a.toggle-vis').forEach((el) => {
        el.addEventListener('click', function (e) {
            e.preventDefault();

            // add class mb_btn_active to this
            el.classList.toggle('btn-outline-primary');
            el.classList.toggle('btn-outline-secondary');

            let columnIdx = e.target.getAttribute('data-column');
            let column = table.column(columnIdx);

            // Toggle the visibility
            column.visible(!column.visible());
        });
    });*/
}
