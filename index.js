const express = require('express');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
const app = express();

ffmpeg.setFfmpegPath(ffmpegPath);

const PORT = process.env.PORT || 10000;
const STREAM_URL = process.env.STREAM_URL;

// رابط اللوجو الخاص بك (beIN MONSTERS MAX 2)
const LOGO_URL = "https://i.ibb.co/bj6ZR1Qw/be-IN-MONSTERS-MAX-2.png"; 

// الأبعاد والموضع الدقيق بناءً على تحليل الصورة exported-image.png
const LOGO_WIDTH = 135;   // العرض المناسب لتغطية الشعار و MAX
const LOGO_HEIGHT = 65;   // الارتفاع المناسب
const X_POSITION = 1115;  // الموضع الأفقي (من اليسار) للزاوية العليا اليمنى
const Y_POSITION = 25;    // الموضع الرأسي (من الأعلى) أسفل كلمة LIVE

app.get('/live.m3u8', (req, res) => {
    if (!STREAM_URL) return res.status(500).send("خطأ: رابط STREAM_URL غير مضبوط!");
    res.contentType('application/x-mpegURL');

    // إنشاء فلتر المعالجة بالابعاد والموضع الجديد
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
    res.send('سيرفر Monsters يعمل بنجاح بالشعار الجديد!');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
