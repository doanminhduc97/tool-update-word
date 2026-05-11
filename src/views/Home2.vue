<template>
  <div class="editor">
      <!-- <p v-if="loading" class="status">Đang tải và phân tích file...</p> -->
    <!-- <button v-if="!tokenClient" @click="login">Login</button> -->
    <div class="field">
      <!-- <input type="url" disabled id="link" v-model="docLink" placeholder="https://drive.google.com/..." @keyup.enter="getFile"> -->
      <!-- <button @click="getFile" :disabled="loading">Tải File</button>/ -->
    </div>
    <section style="display: flex; padding: 12px;">
      <!-- Input link -->
      <!-- STATUS -->
      <div class="wrapper">
        <!-- PREVIEW (mammoth)-->
        <!-- <section v-if="previewHtml" class="preview">
          <h3 class="title-form">Preview hiện tại</h3>
          <div v-html="previewHtml" class="docx-preview"></div>
        </section> -->
        <!-- FORM chỉnh sửa -->
        <section v-if="placeholdersCommon.length" class="edit-form" style="width: 400px;">
          <h3 class="title-form">Thông Tin Chung Của Các File</h3>
          <form>
            <div v-for="ph in placeholdersCommon" :key="ph" class="form-group">
              <label :for="ph">{{ ph.includes('ct_ct') ? ph.slice(5) : ph.slice(4) }}</label>
              <input type="text" :id="ph" v-model="formValuesCommon[ph]" required>
            </div>
          </form>
        </section>
        <section v-if="placeholders.length" class="edit-form">
          <h3 class="title-form">Thông Tin File(Điều lệ.docx)</h3>
          <form>
            <div v-for="ph in placeholders" :key="ph" class="form-group">
              <label :for="ph">{{ ph.includes('ct_ct') ? ph.slice(5) : ph.slice(4) }}</label>
              <input type="text" :id="ph" v-model="formValues[ph]" required>
            </div>
          </form>
        </section>
        <section v-if="placeholders2.length" class="edit-form">
          <h3 class="title-form">Thông Tin File(GĐN đăng ký doanh nghiệp.docx)</h3>
          <form>
            <div v-for="ph in placeholders2" :key="ph" class="form-group">
              <label :for="ph">{{ ph.includes('ct_ct') ? ph.slice(5) : ph.slice(4) }}</label>
              <input type="text" :id="ph" v-model="formValues2[ph]" required>
            </div>
          </form>
        </section>
        <section v-if="placeholders3.length" class="edit-form">
          <h3 class="title-form">Thông Tin File(Giấy ủy quyền.docx)</h3>
          <form>
            <div v-for="ph in placeholders3" :key="ph" class="form-group">
              <label :for="ph">{{ ph }}</label>
              <input type="text" :id="ph" v-model="formValues3[ph]" required>
            </div>
          </form>
        </section>
        <section v-if="placeholders4.length" class="edit-form">
          <h3 class="title-form">Thông Tin File(DANH SÁCH CHỦ SỞ HỮU HƯỞNG LỢI CỦA DOANH NGHIỆP.docx)</h3>
          <form>
            <div v-for="ph in placeholders4" :key="ph" class="form-group">
              <label :for="ph">{{ ph }}</label>
              <input type="text" :id="ph" v-model="formValues4[ph]" required>
            </div>
          </form>
        </section>
        <section class="edit-form" v-if="placeholdersCommon.length">
          <h3 class="title-form">Ngành Nghề</h3>
          <div class="form-group1">
            <input type="checkbox" id="nnbbth" class="checkbox" v-model="nnbbth">
            <label class="checkbox-item" for="nnbbth">Ngành Nghề Buôn Bán Tổng Hợp</label>
          </div>
          <div class="form-group1">
            <input type="checkbox" class="checkbox" id="nnmm" v-model="nnmm">
            <label class="checkbox-item" for="nnmm">Ngành Nghề May Mặc</label>
          </div>
          <div class="form-group1">
            <input type="checkbox" class="checkbox" id="nnxd" v-model="nnxd">
            <label class="checkbox-item" for="nnxd">Ngành Nghề Xây Dựng</label>
          </div>
          <div class="form-group1">
            <input type="checkbox" class="checkbox" id="bbqa" v-model="bbqa">
            <label class="checkbox-item" for="bbqa">Buôn Bán Quần Áo</label>
          </div>
          <div class="form-group1">
            <input type="checkbox" class="checkbox" id="nnth" v-model="nnth">
            <label class="checkbox-item" for="nnth">Ngành Nghề Tổng Hợp</label>
          </div>
          <div class="form-group1">
            <input type="checkbox" class="checkbox" id="nncxcq" v-model="nncxcq">
            <label class="checkbox-item" for="nncxcq">Ngành Nghề Cây Xanh, Cảnh Quan</label>
          </div>
          <div class="form-group1">
            <input type="checkbox" class="checkbox" id="nngd" v-model="nngd">
            <label class="checkbox-item" for="nngd">Ngành Nghề Giáo Dục</label>
          </div>
        </section>
      </div>
      <!-- Download link -->
      <!-- <section v-if="downloadUrl" class="download">
        <h3>File mới đã sẵn sàng</h3>
        <a id="btn-download" class="btn-download">Tải file</a>
      </section> -->
    </section>
    <section v-if="placeholdersCommon.length" class="btn-group">
      <button @click="resetAll()" class="btn-refesh">Làm Mới</button>
      <button :disabled="updating" @click="applyChanges()" class="btn-primary">{{ updating ? 'Đang Tạo File...' : 'Tạo File Mới' }}</button>
    </section>
    <!-- <button @click="getFile">Get File</button> -->

    <!-- <textarea v-model="fileContent" rows="10" cols="50"></textarea> -->
  </div>
</template>
<script>
const CLIENT_ID = "735739572072-i6e10mu5530gmqa21e1bt3iffperiit8.apps.googleusercontent.com";
const API_KEY = "AIzaSyA1_t274mJWSiJ--Fosg0bVxylPX1AV4Tw";
const SCOPES = "https://www.googleapis.com/auth/drive.readonly";
import PizZip from 'pizzip';
import Docxtemplater from  'docxtemplater';
import buonBanTongHop from '@/data/buonBanTongHop.json'
import buonBanQuanAo from '@/data/buonBanQuanAo.json'
import cayXanhCanhQuan from '@/data/cayXanhCanhQuan.json'
import giaoDuc from '@/data/giaoDuc.json'
import mayMac from '@/data/mayMac.json'
import nganhNgheTongHop from '@/data/nganhNgheTongHop.json'
import xayDung from '@/data/xayDung'
export default {
  // Đăng kí kinh doanh 1 thành viên
  data() {
    return {
      fileId: "",
      fileContent: "",
      docLink: 'https://docs.google.com/document/d/1dwA-IX7KrQ9bYa8rasDngsvVQseYEsZq/edit?usp=drive_link&ouid=107831693588829116850&rtpof=true&sd=true',
      link1: 'https://docs.google.com/document/d/1ZeslPYMNwXKrThmUovvDFg4LfjNAlLhL/edit?usp=drive_link&ouid=107831693588829116850&rtpof=true&sd=true',
      link2: 'https://docs.google.com/document/d/1YzqneGER0Ka24MNSZPUw1-ZXCc_NHdSS/edit?usp=drive_link&ouid=107831693588829116850&rtpof=true&sd=true',
      link3: 'https://docs.google.com/document/d/1l8UnC6ANaxXUDi2hq0swL6Ce3eRxJz1k/edit?usp=sharing&ouid=107831693588829116850&rtpof=true&sd=true',
      loading: false,
      updating: false,
      previewHtml: '',
      downloadUrl: '',
      placeholders: [],
      placeholders2: [],
      placeholders3: [],
      placeholders4: [],
      placeholdersCommon: [],
      formValues: {},
      formValues2: {},
      formValues3: {},
      formValues4: {},
      formValuesCommon: {},
      uniq: [],
      uniq2: [],
      uniq3: [],
      uniq4: [],
      nngd: false,
      nncxcq: false,
      nnth: false,
      bbqa: false,
      nnxd: false,
      nnmm: false,
      nnbbth: false,


      // tokenClient: null,
    };
  },

  mounted() {
    
  },
  async created() {
    await this.initGapi();
    await this.initAuth();
    await this.getFile();
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
      this.tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: (resp) => {
          gapi.client.setToken({
            access_token: resp.access_token,
          });
        },
      });
    },

    // login() {
    //   this.tokenClient.requestAccessToken();
    // },
    async getFile() {
      try {
      if (!this.docLink) return alert('Vui Lòng Nhập Link!');
      if (this.docLink) {
        this.fileId = this.extractDocId(this.docLink);
      }
      this.loading = true;

        const [uniq, uniq2, uniq3, uniq4] = await Promise.all([
          this.getPlaceholdersFromDoc(this.docLink),
          this.getPlaceholdersFromDoc(this.link1),
          this.getPlaceholdersFromDoc(this.link2),
          this.getPlaceholdersFromDoc(this.link3),
        ]);
        
        const {commonAtLeast2, uniqueByArray} = this.analyzeArrays([uniq, uniq2, uniq3, uniq4]);
        this.uniq = uniq;
        this.uniq2 = uniq2;
        this.uniq3 = uniq3;
        this.uniq4 = uniq4;
        
        commonAtLeast2.forEach(key => (this.formValuesCommon[key] = ''));
        uniqueByArray[0].forEach(key => (this.formValues[key] = ''));
        uniqueByArray[1].forEach(key => (this.formValues2[key] = ''));
        uniqueByArray[2].forEach(key => (this.formValues3[key] = ''));
        uniqueByArray[3].forEach(key => (this.formValues4[key] = ''));
        this.placeholders = uniqueByArray[0];
        
        
        this.placeholders2 = uniqueByArray[1];
        this.placeholders3 = uniqueByArray[2];
        this.placeholders4 = uniqueByArray[3];
        this.placeholdersCommon = commonAtLeast2;
        
        // object table word
        const removeList = ["#d", "id", "name", "code", "/d"]
        const result = this.placeholdersCommon.filter(item => !removeList.includes(item))
        this.placeholdersCommon = result;
        console.log("123", this.placeholdersCommon);
        this.placeholdersCommon = this.sortCustom(this.placeholdersCommon).reverse();
      } catch (error) {
        alert("Lỗi khi tải hoặc phân tích file: " + error.message);
      } finally {
        this.loading = false;
      }
    },
    async getPlaceholdersFromDoc(link) {
      const fileId = this.extractDocId(link);

      const res = await gapi.client.drive.files.get(
        {
          fileId,
          alt: "media",
        },
        {
          responseType: "arraybuffer",
        }
      );

      const buffer = res.body;

      const zip = new PizZip(buffer);
      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
      });

      const rawText = doc.getFullText();

      const matches = rawText.match(/\[\[\s*([^[\]]+?)\s*\]\]/g) || [];

      return [
        ...new Set(
          matches.map(m => m.replace(/\[\[|\]\]/g, "").trim())
        ),
      ];
    },
    analyzeArrays(arrays) {
      const countMap = new Map();

      // Đếm số mảng chứa mỗi phần tử
      arrays.forEach(arr => {
        [...new Set(arr)].forEach(item => {
          countMap.set(item, (countMap.get(item) || 0) + 1);
        });
      });

      // 1. Xuất hiện từ 2 mảng trở lên
      const commonAtLeast2 = [...countMap]
        .filter(([_, count]) => count >= 2)
        .map(([item]) => item);

      // 2. Phần tử riêng từng mảng (chỉ xuất hiện 1 lần)
      const uniqueByArray = arrays.map(arr => {
        return [...new Set(arr)].filter(item => countMap.get(item) === 1);
      });

      return {
        commonAtLeast2,
        uniqueByArray
      };
    },
    resetAll() {
      Object.keys(this.formValues).forEach(k => this.formValues[k]='');
      Object.keys(this.formValues2).forEach(k => this.formValues2[k]='');
      Object.keys(this.formValues3).forEach(k => this.formValues3[k]='');
      Object.keys(this.formValues4).forEach(k => this.formValues4[k]='');
      Object.keys(this.formValuesCommon).forEach(k => this.formValuesCommon[k]='');
      this.nngd = false;
      this.nncxcq = false;
      this.nnth = false;
      this.bbqa = false;
      this.nnxd = false;
      this.nnmm = false;
      this.nnbbth = false;
    },
    // APPLY CHANGES
    async applyChanges() {
      for (const key in this.formValuesCommon) {
        if (this.uniq.indexOf(key) !== -1) {
          this.formValues[key] = this.formValuesCommon[key];
        }
        if (this.uniq2.indexOf(key) !== -1) {
          this.formValues2[key] = this.formValuesCommon[key];
        }
        if (this.uniq3.indexOf(key) !== -1) {
          this.formValues3[key] = this.formValuesCommon[key];
        }
        if (this.uniq4.indexOf(key) !== -1) {
          this.formValues4[key] = this.formValuesCommon[key];
        }
      }
      // if (!this.placeholders.length) return;
      this.updating = true;
      try {
        // Lấy lại file gốc (đảm bảo không dùng file đã bị thay đổi)
        // extract fileId
        const ids = [
          this.fileId,
          this.extractDocId(this.link1),
          this.extractDocId(this.link2),
          this.extractDocId(this.link3),
        ];

        // fetch song song
        const [buffer, buffer2, buffer3, buffer4] = await Promise.all(
          ids.map(id => this.fetchDocBuffer(id))
        );
        // tạo doc
        const docs = [
          this.createDoc(buffer),
          this.createDoc(buffer2),
          this.createDoc(buffer3),
          this.createDoc(buffer4),
        ];
        // filter ngành nghề
        const mapping = [
          { condition: this.nnbbth, data: buonBanTongHop },
          { condition: this.nnmm, data: mayMac },
          { condition: this.nnxd, data: xayDung },
          { condition: this.bbqa, data: buonBanQuanAo },
          { condition: this.nnth, data: nganhNgheTongHop },
          { condition: this.nncxcq, data: cayXanhCanhQuan },
          { condition: this.nngd, data: giaoDuc },
        ];
        this.formValues.d = mapping
          .filter(item => item.condition)
          .flatMap(item => item.data);
        this.formValues.d.forEach((item, index) => {
          item.id = index + 1;
        })
        // GDN
        this.formValues2.d = this.formValues.d;
        const [doc, doc2, doc3, doc4] = docs;
        const outBlob = this.renderToBlob(doc, this.formValues);
        const outBlob2 = this.renderToBlob(doc2, this.formValues2);
        const outBlob3 = this.renderToBlob(doc3, this.formValues3);
        const outBlob4 = this.renderToBlob(doc4, this.formValues4);

        let fileArr = [
          {
            name: 'Điều lệ',
            data: outBlob,
          },
          {
            name: 'GĐN đăng ký doanh nghiệp',
            data: outBlob2,
          },
          {
            name: 'Giấy ủy quyền',
            data: outBlob3,
          },
          {
            name: 'DANH SÁCH CHỦ SỞ HỮU HƯỞNG LỢI CỦA DOANH NGHIỆP',
            data: outBlob4,
          },
        ]
        fileArr.forEach(item => {
          // Tạo url để người dùng tải về
          const url = URL.createObjectURL(item.data);
          // this.downloadUrl = url;
          const link = document.createElement('a');
          link.href = url;
          link.download = item.name + ".docx";
          
          // Append to document (required for some browsers like Firefox)
          document.body.appendChild(link);
          
          // Trigger the click event
          link.click();
          
          // Clean up by removing the element from the DOM
          document.body.removeChild(link);
          // (Tùy chọn) mở hộp thoại Save As ngay lập tức
          // saveAs(item.data, item.name + '.docx');
        })
        // this.resetAll();
      } catch (error) {
        alert("không thể tạo file: " + error.message);
        console.log(JSON.stringify(error, null, 2));
        console.log(error.properties.errors);
      } finally {
        this.updating = false;
      }
    },
    async fetchDocBuffer(fileId) {
      const res = await gapi.client.drive.files.get(
        { fileId, alt: "media" },
        { responseType: "arraybuffer" }
      );
      return res.body;
    },

    createDoc(buffer) {
      const zip = new PizZip(buffer);
      return new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
        delimiters: {
          start: "[[",
          end: "]]",
        },
      });
    },

    renderToBlob(doc, data) {
      doc.render(data);
      return doc.getZip().generate({
        type: "blob",
        mimeType:
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });
    },
    extractDocId(url) {
      const match = url.match(/\/document\/d\/([a-zA-Z0-9-_]+)/);
      return match ? match[1] : null;
    },
    sortCustom(arr) {
      return arr.sort((a, b) => {
        const prefixA = a.substring(0, 4);
        const prefixB = b.substring(0, 4);

        if (prefixA === prefixB) return a.localeCompare(b);
        return prefixA.localeCompare(prefixB);
      });
    }
  }
}
</script>
<style lang="scss">
  .editor {
    max-width: 800px;
    margin: 2rem auto;
    font-family: system-ui sans-serif;
    padding: 1rem;

    .field {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1rem;
      input {
        flex: 1;
        padding: 0.4rem;
      }
      button {
        padding: 0.4rem 1rem;
      }
    }
    .status {
      font-style: italic;
      color: #555;
    }
    .preview {
      margin-top: 1.5rem;
      border: 1px solid #e0e0e0;
      background: #fafafa;
      padding: 1rem;

      .docx-preview img {
        max-width: 100%;
      }
    }
    .wrapper {
      .edit-form {
        margin-left: 30px;
        margin-top: 2rem;
        .form-group {
          margin-bottom: 0.8rem;
  
          label {
            display: block;
            font-weight: 500;
            margin-bottom: 0.2rem;
          }
          input {
            width: 100%;
            padding: 0.3rem;
          }
        }
        button {
          margin-top: 0.5rem;
          padding: 0.4rem 1rem;
        }
      }
      .download {
        margin-top: 2rem;
  
        .btn-download {
          background: #1976d2;
          color: #fff;
          padding: 0.6rem 1.2rem;
          text-decoration: none;
          border-radius: 4px;
          &:hover {
            background: #1565c0;
          }
        }
      }
    }
  }
  .wrapper {
    display: flex;
    justify-content: space-between;
    width: 1024px;
  }
  .title-form {
    font-size: 18px;
    font-weight: 700;
  }
  .form-group1 {
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  line-height: 36px;
}

.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.checkbox {
  height: 18px;
  width: 18px;
  cursor: pointer;
}
.checkbox-item {
  gap: 8px;
  cursor: pointer;
  min-width: 300px;
  margin-left: 12px;
  font-size: 18px;

}
.btn-primary {
  height: 46px;
  align-items: center;
  background-color: #1991d1;
  color: #fff;
  outline: #1991d1;
  border: 1px solid #1991d1;
  font-size: 16px;
  padding: 6px;
}
.btn-group {
  display: flex;
  justify-content: end;
}
.btn-refesh {
  height: 46px;
  color: #727070;
  border: 1px solid #ccc;
  font-size: 16px;
  background-color: #fff;
  margin-right: 16px;
  width: 103px;
}
</style>