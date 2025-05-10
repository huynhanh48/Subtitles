


# YouTube Subtitles Fetcher

## Mô tả

Dự án này cung cấp một hàm `getSubtitles` để lấy phụ đề từ video YouTube. Bạn có thể chỉ định các ngôn ngữ phụ đề ưu tiên (mặc định là `['vi', 'en', 'fr']`) và hàm sẽ trả về phụ đề cho video YouTube.

## Cài đặt

Trước tiên, bạn cần cài đặt các thư viện yêu cầu trong dự án:

1. **Axios**: Dùng để thực hiện các yêu cầu HTTP.
2. **Lodash**: Dùng để xử lý các mảng và đối tượng.
3. **HE**: Dùng để giải mã các ký tự đặc biệt trong phụ đề.
4. **Striptags**: Dùng để loại bỏ các thẻ HTML trong phụ đề.

### Cài đặt các thư viện yêu cầu:

```bash
npm install axios lodash he striptags
import { getSubtitles } from './getSubtitles.js';
getSubtitles({
  videoID: 'wLuZ0WMyr9U',
  preferredLangs: ['vi'], 
})
