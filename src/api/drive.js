import axios from "axios";

export async function fetchWordFile(url) {
  const response = await axios.get(url, {
    responseType: 'blob',
  })
  if (!response.data.type.includes('word')) {
    console.warn('MIME type khong phai Word, van tiep tuc');
  }
  return response.data;
}