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

// api key AIzaSyA1_t274mJWSiJ--Fosg0bVxylPX1AV4Tw
// client id 735739572072-i6e10mu5530gmqa21e1bt3iffperiit8.apps.googleusercontent.com