<template>
  <div>
    <button @click="login">Login</button>
    <button @click="getFile">Get File</button>

    <textarea v-model="fileContent" rows="10" cols="50"></textarea>
  </div>
</template>
<script>
const CLIENT_ID = "735739572072-i6e10mu5530gmqa21e1bt3iffperiit8.apps.googleusercontent.com";
const API_KEY = "AIzaSyA1_t274mJWSiJ--Fosg0bVxylPX1AV4Tw";
const SCOPES = "https://www.googleapis.com/auth/drive.readonly";

let tokenClient;

export default {
  data() {
    return {
      fileId: "15rk-0JZFLScKYB4D3sg8AIaR2ahFIOZK",
      fileContent: "",
    };
  },

  mounted() {
    this.initGapi();
    this.initAuth();
  },

  methods: {
    async initGapi() {
      await new Promise((resolve) => {
        gapi.load("client", resolve);
      });

      await gapi.client.init({
        apiKey: API_KEY,
        discoveryDocs: [
          "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest",
        ],
      });
    },

    initAuth() {
      tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: (resp) => {
          gapi.client.setToken({
            access_token: resp.access_token,
          });
        },
      });
    },

    login() {
      tokenClient.requestAccessToken();
    },
    async getFile() {
      const res = await gapi.client.drive.files.get({
        fileId: this.fileId,
        alt: "media", // QUAN TRỌNG
      });
      console.log(res);
      
      this.fileContent = res.body;
    }
  }
}
</script>
<style lang="scss">
  // https://docs.google.com/document/d//edit?usp=drive_link&ouid=107831693588829116850&rtpof=true&sd=true
</style>