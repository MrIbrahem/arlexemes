
async function getentity(id) {
    let entity;
    let output = document.getElementById("output");
    const url = `https://www.wikidata.org/w/api.php?action=wbgetentities&format=json&ids=${id}&origin=*`;

    try {
        const res = await fetch(url);
        let data = await res.json();

        let entities = data?.entities || {};
        entity = entities[id] || null;
        if (!entity) {
            output.innerHTML = "<div class='alert alert-danger'>لم يتم العثور على الكيان المطلوب.</div>";
            return [];
        }

    } catch (err) {
        console.error(err);
        output.innerHTML = "<div class='alert alert-danger'>حدث خطأ أثناء جلب البيانات.</div>";
    }

    return entity;
}
