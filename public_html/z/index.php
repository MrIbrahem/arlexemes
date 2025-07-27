<?php
$url = "https://ontology.birzeit.edu/sina/api/SearchLemmaByID/3032775500/ar?apikey=25092018";

// التهيئة
$ch = curl_init();

// تعيين عنوان الطلب
curl_setopt($ch, CURLOPT_URL, $url);

// تعيين الهيدر
$headers = [
    "accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
    "accept-language: ar-EG,ar;q=0.9,en-US;q=0.8,en;q=0.7",
    "cache-control: no-cache",
    "pragma: no-cache",
    "priority: u=0, i",
    "sec-ch-ua: \"Not)A;Brand\";v=\"8\", \"Chromium\";v=\"138\", \"Google Chrome\";v=\"138\"",
    "sec-ch-ua-mobile: ?0",
    "sec-ch-ua-platform: \"Windows\"",
    "sec-fetch-dest: document",
    "sec-fetch-mode: navigate",
    "sec-fetch-site: none",
    "sec-fetch-user: ?1",
    "upgrade-insecure-requests: 1",
    "cookie: lang=en; G_ENABLED_IDPS=google; filterFlag=7; id=22647596; JSESSIONID=7DEC605AEBFE0022A81172C42DCE6A31; _ga=GA1.1.419562132.1751602493; csrftoken=oUqAO86mm0HQGYvjsfJVZGnXDO1IvwT1rfArOeKdGz3ZN8V2hI2IW2m4DvKGu2UX; _ga_SV0Y0V4JTT=GS2.1.s1752813170\$o1\$g1\$t1752813767\$j60\$l0\$h0; _ga_HFK4BZJ9WV=GS2.1.s1753574043\$o22\$g1\$t1753576373\$j58\$l0\$h0"
];
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

// الحصول على النتيجة
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

// إرسال الطلب
$response = curl_exec($ch);

// التحقق من الأخطاء
if(curl_errno($ch)) {
    echo "cURL Error: " . curl_error($ch);
}

// إغلاق الاتصال
curl_close($ch);

// عرض النتيجة
echo $response;
