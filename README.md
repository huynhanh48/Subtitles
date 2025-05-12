# YouTube Subtitles Fetcher

## Mô tả

Dự án này cung cấp một hàm `getSubtitles` để lấy phụ đề từ video YouTube. Bạn có thể chỉ định các ngôn ngữ phụ đề ưu tiên (mặc định là `['vi', 'en', 'fr']`) và hàm sẽ trả về phụ đề cho video YouTube.

## Cài đặt

Trước tiên, bạn cần cài đặt các thư viện yêu cầu trong dự án:

1. **Axios**: Dùng để thực hiện các yêu cầu HTTP.
2. **Lodash**: Dùng để xử lý các mảng và đối tượng.
3. **HE**: Dùng để giải mã các ký tự đặc biệt trong phụ đề.
4. **Striptags**: Dùng để loại bỏ các thẻ HTML trong phụ đề.

### Install the required libraries:

```bash
npm i amon-subtitles
```

## Importing the Functions:

```bash
import { getSubtitles, getContentPage } from 'amon-subtitles'
```

## 1. Fetching YouTube Subtitles

`To fetch subtitles from a YouTube video, use the getSubtitles function. You can specify the videoID (the unique identifier of the YouTube video) and the preferredLangs (a list of languages you prefer for the subtitles). The function will return the subtitles for the video in the specified languages.`

# Usage

```bash
const data = await getSubtitles({
    videoID: 'wLuZ0WMyr9U',     // YouTube video ID
    preferredLangs: ['en'],      // Preferred subtitle language(s)
});

```

# Example response:

```bash

{
  lang: 'en',  // Language of the subtitles
  lines: [
    {
      start: '0:01',
      dur: '0:05',
      seconds: 1,
      text: 'Welcome to the video!'
    },
    {
      start: '0:06',
      dur: '0:10',
      seconds: 6,
      text: 'Today, we will learn JavaScript programming.'
    },
    // Additional subtitle lines...
  ]
}

```

## 2. Fetching Content from a Website

`You can use the getContentPage function to extract and clean the content from a website, even if the website has bot protection mechanisms (like captchas or JavaScript rendering). This function will remove HTML tags, scripts, and unnecessary content to return clean text from the page`

# Usage

```bash
const fetchDataWebsite = await getContentPage(url="https://www.base64decode.org/")
```

# Example response:

```bash
[
  "Welcome to Base64 Decode and Encode",
  "Our tool allows you to decode and encode data in Base64 format.",
  // Other lines of clean content...
]
```

## Additional Information:

`getSubtitles will return the subtitles in the specified languages. If the preferred language is unavailable, it will attempt to use the first available language. If no subtitles are found, it throws an error.`

`getContentPage is a robust method for scraping and extracting content, especially useful for bypassing bot protection like CAPTCHAs or JavaScript rendering. It uses Puppeteer to simulate a real user browsing experience, allowing you to get data even from websites that block traditional scrapers`
