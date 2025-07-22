<!--

js

-->
<script src="/js/random.js"></script>
<script src="/js/theme.js"></script>
<script src="/js/autocomplete.js"></script>
<script>
    function setLabel(lexeme) {
        $("#wd_id").val(lexeme);
    }
    $(function() {
        load_search(setLabel);
    });
    $('.soro').DataTable({
        paging: false,
        info: false,
        searching: false,
        order: []
    });
</script>
</body>

</html>
