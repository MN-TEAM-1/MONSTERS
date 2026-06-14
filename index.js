const express = require('express');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
const path = require('path'); // مكتبة للتعامل مع المسارات المحلية
const app = express();

ffmpeg.setFfmpegPath(ffmpegPath);

const PORT = process.env.PORT || 10000;
const STREAM_URL = process.env.STREAM_URL;

// تحديد مسار اللوجو المحلي بداخل السيرفر بعد ما رفعته للجيتهاب
const LOGO_PATH = path.join(__dirname, 'logo.png'); 

// الأبعاد المطلوبة للوجو
const LOGO_WIDTH = 135;   
const LOGO_HEIGHT = 65;   

app.get('/live.m3u8', (req, res) => {
    if (!STREAM_URL) return res.status(500).send("خطأ: رابط STREAM_URL غير مضبوط!");
    res.contentType('application/x-mpegURL');

    // استخدام المسار المحلي للوجو، والمعادلة التلقائية لتحديد زاوية أعلى اليمين بدقة
    const filterString = `movie='${LOGO_PATH}',scale=${LOGO_WIDTH}:${LOGO_HEIGHT}[logo];[in][logo]overlay=main_w-overlay_w-20:25[out]`;

    ffmpeg(STREAM_URL)
        .inputOptions(['-re']) 
        .complexFilter(filterString)
        .outputOptions([
            '-c:v libx264', '-preset superfast', '-tune zerolatency', 
            '-c:a copy', '-f hls', '-hls_time 6', '-hls_list_size 5', '-hls_flags delete_segments'
        ])
        .on('error', (err) => {
            console.error('FFmpeg Error:', err.message);
        })
        .pipe(res, { end: true });
});

app.get('/', (req, res) => {
    res.send('سيرفر Monsters يعمل بنجاح بالشعار المحلي الدقيق!');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
