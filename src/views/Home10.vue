<template>
  <div class="editor">
    <div class="card common-card" style="margin-bottom: 24px; text-align: center;">
      <h2 style="font-size: 1.25rem; font-weight: 700; color: #0284c7;">Hồ sơ giải thể công ty cổ phần</h2>
    </div>
    <section v-if="placeholdersCommon.length" class="card common-card">
      <h3 class="title-form">Thông tin chung các file</h3>
      <form>
        <div v-for="ph in placeholdersCommon" :key="'c-' + ph" class="form-group">
          <label :for="'c-' + ph">{{ formatLabel(ph) }}</label>
          <PhongDkkdInput v-if="ph === 'Phòng ĐKKD Tỉnh/TP'" :input-id="'c-' + ph" v-model="formValuesCommon[ph]" />
          <input v-else type="text" :id="'c-' + ph" v-model="formValuesCommon[ph]" required>
        </div>
      </form>
    </section>
    <template v-for="(file, i) in filesWithPlaceholders" :key="file.name">
      <section class="card file-card">
        <h3 class="title-form">Thông Tin File ({{ file.name }}.docx)</h3>
        <form>
          <div v-for="ph in file.placeholders" :key="'f' + i + '-' + ph" class="form-group">
            <label :for="'f' + i + '-' + ph">{{ formatLabel(ph) }}</label>
            <PhongDkkdInput v-if="ph === 'Phòng ĐKKD Tỉnh/TP'" :input-id="'f' + i + '-' + ph" v-model="file.formValues[ph]" />
            <input v-else type="text" :id="'f' + i + '-' + ph" v-model="file.formValues[ph]" required>
          </div>
        </form>
      </section>

      <!-- Block thông tin cổ đông (merge 2 bảng: 1. Biên bản họp ĐHĐCĐ + 4. Sổ cổ đông) -->
      <section v-if="i === 0" class="card members-card">
        <div class="card-head">
          <h3 class="title-form">Thông Tin Cổ Đông (Biên bản họp ĐHĐCĐ + Sổ cổ đông)</h3>
        </div>
        <div v-for="(sh, index) in shareholders" :key="index" class="member-card">
          <div class="member-head">
            <h4 class="member-title">{{ index === 2 ? 'Chủ tịch HĐQT' : 'Cổ đông ' + (index + 1) }}</h4>
          </div>
          <div class="member-grid">
            <div class="form-group">
              <label>Họ tên</label>
              <input type="text" v-model="sh.name" placeholder="Nguyễn Văn A">
            </div>
            <div class="form-group">
              <label>Ngày sinh</label>
              <input type="text" v-model="sh.birthday" placeholder="DD/MM/YYYY">
            </div>
            <div class="form-group">
              <label>Số định danh cá nhân</label>
              <input type="text" v-model="sh.idNumber" placeholder="Số CCCD">
            </div>
            <div class="form-group">
              <label>Địa chỉ</label>
              <input type="text" v-model="sh.address" placeholder="Số nhà, đường, phường, tỉnh...">
            </div>
            <div class="form-group">
              <label>Số cổ phần</label>
              <input type="text" v-model="sh.soCoPhan" placeholder="Ví dụ: 1000">
            </div>
            <div class="form-group">
              <label>Số phiếu</label>
              <input type="text" v-model="sh.soPhieu" placeholder="Số giấy chứng nhận cổ phần">
            </div>
            <div class="form-group">
              <label>Số mua cổ phần</label>
              <input type="text" v-model="sh.soMuaCoPhan" placeholder="Số lượng cổ phần mua">
            </div>
            <div class="form-group">
              <label>Tỷ lệ % vốn góp</label>
              <input type="text" v-model="sh.tyLe" placeholder="Ví dụ: 50% hoặc 50">
            </div>
          </div>
        </div>

        <!-- Cổ đông bổ sung (render qua loop [[#listUser]] trong file 1 & file 4) -->
        <template v-if="extraShareholders.length > 0">
          <div v-for="(sh, eIdx) in extraShareholders" :key="'e' + eIdx" class="member-card">
            <div class="member-head">
              <h4 class="member-title">Cổ đông bổ sung {{ eIdx + 1 }}</h4>
              <button type="button" @click="removeExtraShareholder(eIdx)" class="btn-remove">Xóa</button>
            </div>
            <div class="member-grid">
              <div class="form-group">
                <label>Họ tên</label>
                <input type="text" v-model="sh.name" placeholder="Nguyễn Văn A">
              </div>
              <div class="form-group">
                <label>Ngày sinh</label>
                <input type="text" v-model="sh.birthday" placeholder="DD/MM/YYYY">
              </div>
              <div class="form-group">
                <label>Số định danh cá nhân</label>
                <input type="text" v-model="sh.idNumber" placeholder="Số CCCD">
              </div>
              <div class="form-group">
                <label>Địa chỉ</label>
                <input type="text" v-model="sh.address" placeholder="Số nhà, đường, phường, tỉnh...">
              </div>
              <div class="form-group">
                <label>Số cổ phần</label>
                <input type="text" v-model="sh.soCoPhan" placeholder="Ví dụ: 1000">
              </div>
              <div class="form-group">
                <label>Số phiếu</label>
                <input type="text" v-model="sh.soPhieu" placeholder="Số giấy chứng nhận cổ phần">
              </div>
              <div class="form-group">
                <label>Số mua cổ phần</label>
                <input type="text" v-model="sh.soMuaCoPhan" placeholder="Số lượng cổ phần mua">
              </div>
              <div class="form-group">
                <label>Tỷ lệ % vốn góp</label>
                <input type="text" v-model="sh.tyLe" placeholder="Ví dụ: 50% hoặc 50">
              </div>
            </div>
          </div>
        </template>
        <p v-else class="empty-hint">Chưa có cổ đông bổ sung nào. Nhấn "Thêm cổ đông" để bắt đầu.</p>

        <div class="card-head">
          <h3 class="title-form"></h3>
          <button type="button" @click="addExtraShareholder" class="btn-add">Thêm cổ đông</button>
        </div>
      </section>
    </template>
    <section v-if="placeholdersCommon.length || filesWithPlaceholders.length" class="btn-group">
      <button @click="resetAll()" class="btn-refesh">Làm Mới</button>
      <button :disabled="updating" @click="applyChanges()" class="btn-primary">
        {{ updating ? 'Đang Tạo File...' : 'Tạo File Mới' }}
      </button>
    </section>
  </div>
</template>

<script>
const CLIENT_ID = "735739572072-i6e10mu5530gmqa21e1bt3iffperiit8.apps.googleusercontent.com";
const API_KEY = "AIzaSyA1_t274mJWSiJ--Fosg0bVxylPX1AV4Tw";
const SCOPES = "https://www.googleapis.com/auth/drive.readonly";
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import { deductExportFee } from '@/services/wallet';
import { useAuth } from '@/stores/auth';
import { autofillLoginPlaceholders } from '@/lib/loginPlaceholders';

export default {
  name: 'Home10',
  // Giải thể cổ phần
  data() {
    const files = [
      {
        name: '1. Biên bản họp ĐHĐCĐ',
        link: 'https://docs.google.com/document/d/13pq_dOHLyPFmN8kd5bcxfkwSlkwcV0iO/edit?usp=drivesdk&rtpof=true&sd=true',
      },
      {
        name: '2. Quyết định của ĐHĐCĐ',
        link: 'https://docs.google.com/document/d/1A5zHItk0CbhDwvhjbTlWUTW8eXHZInzI/edit?usp=drivesdk&rtpof=true&sd=true',
      },
      {
        name: '3. TB giải thể',
        link: 'https://docs.google.com/document/d/1LZlG8iYDReiqlM1DC29ikHF1uETL5KNy/edit?usp=drivesdk&rtpof=true&sd=true',
      },
      {
        name: '4. Sổ cổ đông',
        link: 'https://docs.google.com/document/d/1Wn_E-1jk9YbfMPsf5lL9tnyCU2CE8ytY/edit?usp=drivesdk&rtpof=true&sd=true',
      },
      {
        name: '5. Biên bản thanh lý tài sản',
        link: 'https://docs.google.com/document/d/1J_8G0oRXYSyr63dOSM6SNx8m2YIBAN07/edit?usp=drivesdk&rtpof=true&sd=true',
      },
      {
        name: '6. Danh sách nợ',
        link: 'https://docs.google.com/document/d/1Hr73vZ-fLX2RET1eeRpM48VEvFYunRO5/edit?usp=drivesdk&rtpof=true&sd=true',
      },
      {
        name: '7. GUQ',
        link: 'https://docs.google.com/document/d/1XFkL-o7e01g4dRBcpRsAJ880zlO7L-gJ/edit?usp=drivesdk&rtpof=true&sd=true',
      },
    ].map(f => ({
      ...f,
      placeholders: [],
      allPlaceholders: [],
      formValues: {},
    }));
    return {
      files,
      placeholdersCommon: [],
      formValuesCommon: {},
      updating: false,
      // 3 slot cố định khớp template: CĐ1, CĐ2, Chủ tịch HĐQT
      shareholders: [
        { name: '', birthday: '', idNumber: '', address: '', soCoPhan: '', soPhieu: '', soMuaCoPhan: '', tyLe: '' },
        { name: '', birthday: '', idNumber: '', address: '', soCoPhan: '', soPhieu: '', soMuaCoPhan: '', tyLe: '' },
        { name: '', birthday: '', idNumber: '', address: '', soCoPhan: '', soPhieu: '', soMuaCoPhan: '', tyLe: '' },
      ],
      // Cổ đông bổ sung đi vào loop [[#listUser]] của file 1 & file 4
      extraShareholders: [],
    };
  },

  computed: {
    filesWithPlaceholders() {
      return this.files.filter(f => f.placeholders.length > 0);
    },
  },

  async mounted() {
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

    formatLabel(ph) {
      if (!ph) return '';
      const s = String(ph);
      return s.startsWith('Login_') ? s.slice(6) : s;
    },

    addExtraShareholder() {
      this.extraShareholders.push({
        name: '', birthday: '', idNumber: '', address: '', soCoPhan: '', soPhieu: '', soMuaCoPhan: '', tyLe: ''
      });
    },

    removeExtraShareholder(index) {
      this.extraShareholders.splice(index, 1);
    },

    async getFile() {
      const loading = document.getElementById("loading-overlay");
      if (loading) loading.style.display = "flex";
      try {
        const arrays = await Promise.all(
          this.files.map(f => this.getPlaceholdersFromDoc(f.link))
        );
        const { commonAtLeast2, uniqueByArray } = this.analyzeArrays(arrays);

        // Lọc các biến cổ đông CĐ1/CĐ2/Chủ tịch HĐQT + cú pháp loop listUser
        // (block "Thông Tin Cổ Đông" riêng, merge 2 bảng file 1 + file 4)
        const isShareholderVar = (item) => {
          if (!item) return false;
          const t = String(item).trim();
          if (
            t === '#listUser' || t === '/listUser' || t === 'listUser' ||
            t === 'index'
          ) return true;
          // Key của các cột trong loop listUser (dùng chung trong block cổ đông)
          if (
            t === 'Họ tên' || t === 'Ngày sinh' || t === 'Số định danh cá nhân' ||
            t === 'Địa chỉ' || t === 'Số cổ phần' || t === 'Số phiếu' ||
            t === 'Số mua cổ phần' || t === 'Tỷ lệ % vốn góp'
          ) return true;
          return t.endsWith('CĐ1') || t.endsWith('CĐ2') || t.endsWith('HĐQT');
        };

        this.files.forEach((f, i) => {
          f.allPlaceholders = arrays[i];
          const filteredUnique = uniqueByArray[i].filter(key => !isShareholderVar(key));
          f.placeholders = this.sortCustom(filteredUnique);
          f.formValues = {};
          filteredUnique.forEach(key => {
            f.formValues[key] = '';
          });
        });

        this.placeholdersCommon = this.sortCustom(commonAtLeast2.filter(key => !isShareholderVar(key)));
        this.formValuesCommon = {};
        this.placeholdersCommon.forEach(key => {
          this.formValuesCommon[key] = '';
        });

        // Tự động điền các placeholder có tiền tố "Login_" từ user hiện tại
        const currentUser = useAuth().state.user;
        if (currentUser) {
          autofillLoginPlaceholders(this.formValuesCommon, currentUser);
          this.files.forEach(f => autofillLoginPlaceholders(f.formValues, currentUser));
        }
      } catch (error) {
        alert("Lỗi khi tải hoặc phân tích file: " + error.message);
      } finally {
        if (loading) loading.style.display = "none";
      }
    },

    async getPlaceholdersFromDoc(link) {
      const fileId = this.extractDocId(link);
      const buffer = await this.fetchDocxBuffer(fileId);

      const zip = new PizZip(buffer);
      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
        delimiters: {
          start: "[[",
          end: "]]",
        },
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

      arrays.forEach(arr => {
        [...new Set(arr)].forEach(item => {
          countMap.set(item, (countMap.get(item) || 0) + 1);
        });
      });

      const commonAtLeast2 = [...countMap]
        .filter(([_, count]) => count >= 2)
        .map(([item]) => item);

      const uniqueByArray = arrays.map(arr => {
        return [...new Set(arr)].filter(item => countMap.get(item) === 1);
      });

      return {
        commonAtLeast2,
        uniqueByArray
      };
    },

    resetAll() {
      this.files.forEach(f => {
        Object.keys(f.formValues).forEach(k => (f.formValues[k] = ''));
      });
      Object.keys(this.formValuesCommon).forEach(k => (this.formValuesCommon[k] = ''));
      this.shareholders.forEach(sh => {
        Object.keys(sh).forEach(k => (sh[k] = ''));
      });
      this.extraShareholders = [];
      const currentUser = useAuth().state.user;
      if (currentUser) {
        autofillLoginPlaceholders(this.formValuesCommon, currentUser);
        this.files.forEach(f => autofillLoginPlaceholders(f.formValues, currentUser));
      }
    },

    // APPLY CHANGES
    async applyChanges() {
      const loading = document.getElementById("loading-overlay");
      if (loading) loading.style.display = "flex";
      this.updating = true;
      try {
        await deductExportFee('Giải thể cổ phần');
        const buffers = await Promise.all(
          this.files.map(f => this.fetchDocBuffer(this.extractDocId(f.link)))
        );

        const docs = buffers.map(buffer => this.createDoc(buffer));

        // Mapping thông tin cổ đông vào các placeholder cố định của template
        // slot 0 -> *CĐ1 | slot 1 -> *CĐ2 | slot 2 -> *Chủ tịch HĐQT / *HĐQT
        const shareholderData = {};
        const fields = [
          ['Họ tên', 'name'],
          ['Ngày sinh', 'birthday'],
          ['Số định danh cá nhân', 'idNumber'],
          ['Địa chỉ', 'address'],
          ['Số cổ phần', 'soCoPhan'],
          ['Số phiếu', 'soPhieu'],
          ['Số mua cổ phần', 'soMuaCoPhan'],
          ['Tỷ lệ % vốn góp', 'tyLe'],
        ];
        this.shareholders.forEach((sh, idx) => {
          fields.forEach(([label, key]) => {
            if (idx < 2) {
              shareholderData[`${label} CĐ${idx + 1}`] = sh[key] || '';
            } else {
              const qtKey = label === 'Ngày sinh' || label === 'Số định danh cá nhân' || label === 'Số mua cổ phần'
                ? `${label} HĐQT`
                : `${label} Chủ tịch HĐQT`;
              shareholderData[qtKey] = sh[key] || '';
            }
          });
        });

        // Dữ liệu loop [[#listUser]] cho bảng cổ đông trong file 1 & file 4:
        // các cổ đông bổ sung (stt tiếp nối sau 3 slot cố định CĐ1, CĐ2, Chủ tịch HĐQT)
        const listUser = this.extraShareholders.map((sh, eIdx) => ({
          index: 4 + eIdx,
          'Họ tên': sh.name || '',
          'Ngày sinh': sh.birthday || '',
          'Số định danh cá nhân': sh.idNumber || '',
          'Địa chỉ': sh.address || '',
          'Số cổ phần': sh.soCoPhan || '',
          'Số phiếu': sh.soPhieu || '',
          'Số mua cổ phần': sh.soMuaCoPhan || '',
          'Tỷ lệ % vốn góp': sh.tyLe || '',
        }));

        const renderDataList = this.files.map(file => ({
          ...this.formValuesCommon,
          ...file.formValues,
          ...shareholderData,
          listUser,
        }));

        const outBlobs = docs.map((doc, i) => this.renderToBlob(doc, renderDataList[i]));

        this.files.forEach((file, i) => {
          const url = URL.createObjectURL(outBlobs[i]);
          const link = document.createElement('a');
          link.href = url;
          link.download = file.name + ".docx";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        });
      } catch (error) {
        alert("không thể tạo file: " + error.message);
        console.log(JSON.stringify(error, null, 2));
        console.log(error.properties && error.properties.errors);
      } finally {
        this.updating = false;
        if (loading) loading.style.display = "none";
      }
    },

    async fetchDocxBuffer(fileId) {
      let buffer;
      const res = await gapi.client.drive.files.get(
        { fileId, alt: "media" },
        { responseType: "arraybuffer" }
      );
      buffer = res.body;

      if (!this.isValidDocx(buffer)) {
        const exportRes = await fetch(
          `https://docs.google.com/document/d/${fileId}/export?format=docx`
        );
        if (!exportRes.ok) {
          throw new Error(`Không tải được bản docx của file ${fileId} (HTTP ${exportRes.status})`);
        }
        buffer = await exportRes.arrayBuffer();
      }

      if (!this.isValidDocx(buffer)) {
        throw new Error(`File ${fileId} không phải file docx hợp lệ`);
      }
      return buffer;
    },

    isValidDocx(buffer) {
      try {
        const zip = new PizZip(buffer);
        return !!(zip.files && zip.files['word/document.xml']);
      } catch (e) {
        return false;
      }
    },

    async fetchDocBuffer(fileId) {
      return this.fetchDocxBuffer(fileId);
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
      const nonLogin = arr.filter(k => !String(k).startsWith('Login_'));
      const loginFields = arr.filter(k => String(k).startsWith('Login_'));

      nonLogin.sort((a, b) => {
        const prefixA = a.substring(0, 4);
        const prefixB = b.substring(0, 4);
        if (prefixA === prefixB) return a.localeCompare(b);
        return prefixA.localeCompare(prefixB);
      });

      return [...nonLogin, ...loginFields];
    }
  }
}
</script>
