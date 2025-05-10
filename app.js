import { getSubtitles } from './getSubtitles.js';

getSubtitles({
  videoID: 'RziNtIBkiLk',
  preferredLangs: ['en'], 
})
  .then(({ lang, lines }) => {
    console.log(`\nPhụ đề ngôn ngữ: ${lang}`);
    lines.forEach(cap => {
      console.log(`[${cap.start}s - ${cap.dur}s - seconds ${cap.seconds}] ${cap.text}`);
    });
  })
  .catch(err => {
    console.error(' Lỗi:', err.message);
  });
