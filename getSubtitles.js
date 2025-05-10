import he from 'he';
import axios from 'axios';
import _ from 'lodash';
import striptags from 'striptags';

const { find } = _;

const fetchData = async (url) => {
  const { data } = await axios.get(url);
  return data;
};

const convertToMinutesAndSeconds = (seconds) => {
  const mins = Math.floor(seconds / 60); 
  const secs = Math.floor(seconds % 60); 
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export async function getSubtitles({
  videoID,
  preferredLangs = ['vi', 'en', 'fr', 'de'],
  allowAutoTranslate = true, 
}) {

  const data = await fetchData(`https://youtube.com/watch?v=${videoID}`);

  if (!data.includes('captionTracks')) {
    throw new Error(`Error not found  subtitle  for  video: ${videoID}`);
  }

  const regex = /"captionTracks":(\[.*?\])/;
  const match = regex.exec(data);
  if (!match) throw new Error(`can't parse  captionTracks`);

  const { captionTracks } = JSON.parse(`{"captionTracks":${match[1]}}`);

  let subtitle = null;
  let usedLang = null;

  for (const lang of preferredLangs) {
    subtitle =
      find(captionTracks, { vssId: `.${lang}` }) ||
      find(captionTracks, { vssId: `a.${lang}` }) ||
      find(captionTracks, ({ vssId }) => vssId && vssId.includes(`.${lang}`));
    
    if (subtitle && subtitle.baseUrl) {
      usedLang = lang;
      break;
    }
  }

  if (!subtitle?.baseUrl && allowAutoTranslate) {
    subtitle = captionTracks[0];
    subtitle.baseUrl += `&tlang=${preferredLangs[0]}`;
    usedLang = preferredLangs[0];
  }

  if (!subtitle?.baseUrl) {
    throw new Error(`not found  subtitle  precedent: ${preferredLangs.join(', ')}`);
  }


  const transcript = await fetchData(subtitle.baseUrl);

  const lines = transcript
    .replace('<?xml version="1.0" encoding="utf-8" ?><transcript>', '')
    .replace('</transcript>', '')
    .split('</text>')
    .filter(line => line.trim())
    .map(line => {
      const start = (line.match(/start="([\d.]+)"/) || [])[1] || '0';
      const dur = (line.match(/dur="([\d.]+)"/) || [])[1] || '0';

      const htmlText = line
        .replace(/<text.+?>/, '')
        .replace(/<\/?[^>]+>/g, '')
        .replace(/&amp;/gi, '&');

      const decodedText = he.decode(htmlText);
      const text = striptags(decodedText);
      const startInSeconds = parseFloat(start);
      const durInSeconds = parseFloat(dur);

      return {
        start: convertToMinutesAndSeconds(startInSeconds),
        dur: convertToMinutesAndSeconds(startInSeconds + durInSeconds),
        seconds:Math.floor(startInSeconds),
        text,
      };
    });
  return { lang: usedLang, lines };
}
