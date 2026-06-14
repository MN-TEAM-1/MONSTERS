const express = require('express');
const ffmpeg = require('fluent-ffmpeg');
const app = express();
const PORT = process.env.PORT || 10000;

const STREAM_URL = process.env.STREAM_URL;

// هنا إعدادات اللوجو الافتراضية
// رابط لوجو حقيقي شفاف للتجربة (شعار جيتهاب مصغر)
const LOGO_URL = "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png"; 

const LOGO_WIDTH = 50;   // حجم صغير مناسب للتجربة
const LOGO_HEIGHT = 50;  
const X_POSITION = 20;   // متموضع في الزاوية
const Y_POSITION = 20;
app.get('/live.m3u8', (req, res) => {
    if (!STREAM_URL) return res.status(500).send("خطأ: رابط STREAM_URL غير مضبوط في الإعدادات!");
    res.contentType('application/x-mpegURL');

    const filterString = `movie=${LOGO_URL},scale=${LOGO_WIDTH}:${LOGO_HEIGHT}[logo];[in][logo]overlay=${X_POSITION}:${Y_POSITION}[out]`;

    ffmpeg(STREAM_URL)
        .inputOptions(['-re']) 
        .complexFilter(filterString)
        .outputOptions([
            '-c:v libx264', '-preset superfast', '-tune zerolatency', 
            '-c:a copy', '-f hls', '-hls_time 6', '-hls_list_size 5', '-hls_flags delete_segments'
        ])
        .pipe(res, { end: true });
});

app.get('/', (req, res) => {
    res.send('سيرفر Monsters لـ IPTV يعمل بنجاح! رابط البث النظيف هو: /live.m3u8');
});

app.listen(PORT);
