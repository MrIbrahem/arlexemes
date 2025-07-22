<?php
// show errors
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json; charset=utf-8');

$term = isset($_GET['term']) ? trim($_GET['term']) : 'ا';
$data_source = isset($_GET['data_source']) ? trim($_GET['data_source']) : '';

if ($term === '') {
    echo json_encode([]);
    exit;
}

// 🧠 التخزين المؤقت (ملفات)
$cacheDir = __DIR__ . '/cache';
$cacheTtl = 3600; // 3600 ثانية = ساعة
$cacheKey = md5($term . $data_source);
$cacheFile = "$cacheDir/$cacheKey.json";

// إنشاء المجلد إذا لم يكن موجودًا
if (!is_dir($cacheDir)) {
    mkdir($cacheDir, 0777, true);
}

// إذا كان الملف المؤقت موجودًا ولم تنتهِ صلاحيته → نستخدمه
if (file_exists($cacheFile) && (time() - filemtime($cacheFile) < $cacheTtl)) {
    echo file_get_contents($cacheFile);
    exit;
}

class SPARQLQueryDispatcher
{
    private $endpointUrl;

    public function __construct(string $endpointUrl)
    {
        $this->endpointUrl = $endpointUrl;
    }

    public function parse_sparql_results(array $data): array
    {
        $result = [];

        $items = $data['results']['bindings'] ?? [];
        $vars_list = $data['head']['vars'] ?? [];

        foreach ($items as $row) {
            $new_row = [];

            foreach ($vars_list as $var) {
                $value = $row[$var]['value'] ?? '';

                if (strpos($value, '/entity/') !== false) {
                    $parts = explode('/', $value);
                    $value = end($parts);
                }

                $new_row[$var] = $value;
            }

            $result[] = $new_row;
        }

        return $result;
    }

    public function query(string $sparqlQuery): array
    {
        $opts = [
            'http' => [
                'method' => 'GET',
                'header' => [
                    'Accept: application/sparql-results+json',
                    'User-Agent: Wikidata-Autocomplete-PHP/' . PHP_VERSION,
                ],
            ],
        ];
        $context = stream_context_create($opts);
        $url = $this->endpointUrl . '?query=' . urlencode($sparqlQuery);
        $response = file_get_contents($url, false, $context) ?? '';

        $data = json_decode($response, true) ?? [];

        return $this->parse_sparql_results($data);
    }
}

$endpointUrl = 'https://query.wikidata.org/sparql';

// ⚠️ تأكد من الهروب السليم (بما أن الإدخال من المستخدم)
$escapedTerm = addslashes($term); // لا تستخدم مباشرة داخل SPARQL بدون هروب

$values = "VALUES ?category { wd:Q24905 wd:Q34698 wd:Q1084 } . ";

if ($data_source !== "") {
    $values = "VALUES ?category { wd:" . $data_source . " } . ";
}

$sparqlQueryString = <<<SPARQL
SELECT DISTINCT ?lemma ?item ?categoryLabel (count(?form) as ?count) WHERE {
    $values
    ?item a ontolex:LexicalEntry ;
            wikibase:lexicalCategory ?category ;
            dct:language wd:Q13955 ;
            wikibase:lemma ?lemma .
    optional { ?item ontolex:lexicalForm ?form }
    FILTER(CONTAINS(STR(?lemma), "$escapedTerm")) .
    SERVICE wikibase:label { bd:serviceParam wikibase:language "ar,en". }
}
group by ?lemma ?item ?categoryLabel
ORDER BY DESC(?count)
LIMIT 50
SPARQL;

$queryDispatcher = new SPARQLQueryDispatcher($endpointUrl);

try {
    $result = $queryDispatcher->query($sparqlQueryString);
} catch (Exception $e) {
    error_log($e->getMessage());
}

// تنسيق النتائج على شكل [{ label: "...", value: "...", id: "Q..." }, ...]
$items = [
    "search" => []
];

if ($result) {
    $items = ['search' => []];

    foreach ($result as $row) {
        $item_id = $row['item'];
        $lemma = $row['lemma'];
        $categoryLabel = $row['categoryLabel'];
        $count = isset($row['count']) ? (int)$row['count'] : 0;

        $label = "$lemma - $categoryLabel";
        if ($count > 1) {
            $label .= " - ($count كلمة)";
        }

        $items['search'][] = [
            'label' => $label,
            'value' => $lemma,
            'id' => $item_id
        ];
    }
}

// 💾 حفظ النتيجة في الملف المؤقت
file_put_contents($cacheFile, json_encode($items, JSON_UNESCAPED_UNICODE));

// عرض النتيجة
echo json_encode($items, JSON_UNESCAPED_UNICODE);
