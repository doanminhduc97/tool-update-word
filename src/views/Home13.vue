<template>
  <div class="editor">
    <div class="card common-card" style="margin-bottom: 24px; text-align: center;">
      <h2 style="font-size: 1.25rem; font-weight: 700; color: #0284c7;">Hồ sơ tăng vốn công ty cổ phần</h2>
    </div>
    <section v-if="placeholdersCommon.length" class="card common-card">
      <h3 class="title-form">Thông tin chung các file</h3>
      <form>
        <div v-for="ph in placeholdersCommon" :key="'c-' + ph" class="form-group">
          <label :for="'c-' + ph">{{ formatLabel(ph) }}</label>
          <PhongDkkdInput v-if="ph === 'Phòng ĐKKD Tỉnh/TP' || ph === 'Cơ quan đăng ký kinh doanh cấp tỉnh'" :input-id="'c-' + ph" v-model="formValuesCommon[ph]" />
          <GenderRadio v-else-if="isGenderField(ph)" :name="'c-' + ph" v-model="formValuesCommon[ph]" />
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
            <PhongDkkdInput v-if="ph === 'Phòng ĐKKD Tỉnh/TP' || ph === 'Cơ quan đăng ký kinh doanh cấp tỉnh'" :input-id="'f' + i + '-' + ph" v-model="file.formValues[ph]" />
            <GenderRadio v-else-if="isGenderField(ph)" :name="'f' + i + '-' + ph" v-model="file.formValues[ph]" />
            <input v-else type="text" :id="'f' + i + '-' + ph" v-model="file.formValues[ph]" required>
          </div>
        </form>
      </section>

      <!-- Block thông tin cổ đông: ngay sau Thông Tin File (2. Quyết định ĐHĐCĐ) -->
      <section v-if="i === 1" class="card members-card">
        <div class="card-head">
          <h3 class="title-form">Thông Tin Cổ Đông (Quyết định ĐHĐCĐ + DANH SÁCH CSH HƯỞNG LỢI)</h3>
        </div>

        <!-- 3 slot cố định khớp template CĐ1/CĐ2/CĐ3 -->
        <div v-for="(sh, index) in shareholders" :key="index" class="member-card">
          <div class="member-head">
            <h4 class="member-title">Cổ đông {{ index + 1 }}</h4>
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
              <label>Giới tính</label>
              <GenderRadio :name="'sh13-gender-' + index" v-model="sh.gender" />
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
              <label>Số cổ phần hiện tại</label>
              <input type="text" v-model="sh.soCoPhanHienTai" placeholder="Ví dụ: 10000">
            </div>
            <div class="form-group">
              <label>Vốn hiện tại</label>
              <input type="text" v-model="sh.vonHienTai" placeholder="Ví dụ: 1.000.000.000">
            </div>
            <div class="form-group">
              <label>Tỷ lệ % vốn góp hiện tại</label>
              <input type="text" v-model="sh.tyLeHienTai" placeholder="Ví dụ: 50 hoặc 50%">
            </div>
            <div class="form-group">
              <label>Số cổ phần mới</label>
              <input type="text" v-model="sh.soCoPhanMoi" placeholder="Ví dụ: 15000">
            </div>
            <div class="form-group">
              <label>Vốn mới</label>
              <input type="text" v-model="sh.vonMoi" placeholder="Ví dụ: 1.500.000.000">
            </div>
            <div class="form-group">
              <label>Tỷ lệ % vốn góp mới</label>
              <input type="text" v-model="sh.tyLeMoi" placeholder="Ví dụ: 50 hoặc 50%">
            </div>
          </div>
        </div>

        <!-- Cổ đông bổ sung (render qua loop [[#listUser]] trong DANH SÁCH CSH HƯỞNG LỢI) -->
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
                <label>Giới tính</label>
                <GenderRadio :name="'extra-sh13-gender-' + eIdx" v-model="sh.gender" />
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
                <label>Tỷ lệ % sở hữu vốn điều lệ</label>
                <input type="text" v-model="sh.tyLe" placeholder="Ví dụ: 10 hoặc 10%">
              </div>
            </div>
          </div>
        </template>
        <p v-else class="empty-hint">Chưa có cổ đông bổ sung nào. Nhấn "Thêm cổ đông" để bắt đầu.</p>
        <p :class="hasNoMatchCsh ? 'required-hint missing' : 'required-hint ok'">
          {{ hasNoMatchCsh
            ? '⚠️ DANH SÁCH CSH HƯỞNG LỢI yêu cầu tỷ lệ % tổng 100% — kiểm tra lại các cổ đông.'
            : '✓ Tỷ lệ cổ đông hợp lệ (trống hoặc tổng 100%).' }}
        </p>

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
import { enforceTimesNewRoman } from '@/lib/fontHelper';
import { isGenderField } from '@/lib/genderHelper';

export default {
  name: 'Home13',
  // Tăng Vốn Cty Cổ Phần
  data() {
    const files = [
      {
        name: '1. GĐN đăng ký thay đổi nội dung ĐKDN',
        link: 'https://docs.google.com/document/d/1zJEbIf2GWJSyvwvEEj5X8NdwguXfsGK3/edit?usp=drivesdk&rtpof=true&sd=true',
      },
      {
        name: '2. Quyết định ĐHĐCĐ',
        link: 'https://docs.google.com/document/d/1eNR0p5VeuJzZ5pMlrNmouY6ezXPPAJ7o/edit?usp=drivesdk&rtpof=true&sd=true',
      },
      {
        name: '4. DANH SÁCH CHỦ SỞ HỮU HƯỞNG LỢI CỦA DOANH NGHIỆP',
        link: 'https://docs.google.com/document/d/18321kdjLmiRfg-Bu6lCDyUk_zvGRg_ij/edit?usp=drivesdk&rtpof=true&sd=true',
      },
      {
        name: '5. Giấy ủy quyền',
        link: 'https://docs.google.com/document/d/1C7MS8UhBYKSfNPN7kZ9WJKp9TCJYgIBj/edit?usp=drivesdk&rtpof=true&sd=true',
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
      // 3 slot cố định khớp template: CĐ1, CĐ2, CĐ3
      shareholders: [
        { name: '', birthday: '', gender: 'Nam', idNumber: '', address: '', soCoPhanHienTai: '', vonHienTai: '', tyLeHienTai: '', soCoPhanMoi: '', vonMoi: '', tyLeMoi: '' },
        { name: '', birthday: '', gender: 'Nam', idNumber: '', address: '', soCoPhanHienTai: '', vonHienTai: '', tyLeHienTai: '', soCoPhanMoi: '', vonMoi: '', tyLeMoi: '' },
        { name: '', birthday: '', gender: 'Nam', idNumber: '', address: '', soCoPhanHienTai: '', vonHienTai: '', tyLeHienTai: '', soCoPhanMoi: '', vonMoi: '', tyLeMoi: '' },
      ],
      // Cổ đông bổ sung đi vào loop [[#listUser]] của file DANH SÁCH CSH HƯỞNG LỢI
      extraShareholders: [],
    };
  },

  computed: {
    filesWithPlaceholders() {
      return this.files.filter(f => f.placeholders.length > 0);
    },
    hasNoMatchCsh() {
      if (this.extraShareholders.length === 0) return false;
      const parsed = this.extraShareholders.map(s => parseFloat(String(s.tyLe).replace('%', '').replace(',', '.')));
      if (parsed.some(p => isNaN(p))) return false;
      return Math.round(parsed.reduce((a, b) => a + b, 0)) !== 100;
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
        name: '', birthday: '', gender: 'Nam', idNumber: '', address: '', tyLe: ''
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

        // Lọc biến cổ đông CĐ1/CĐ2/CĐ3 + cú pháp loop listUser + các biến loop của file 4
        const isShareholderVar = (item) => {
          if (!item) return false;
          const t = String(item).trim();
          if (t === '#listUser' || t === '/listUser' || t === 'listUser') return true;
          // Các biến trong hàng loop của file 4 (DANH SÁCH CSH HƯỞNG LỢI)
          if (t === 'Họ tên' || t === 'ngày sinh123' || t === 'giới tính123' ||
              t === 'số định danh123' || t === 'địa chỉ123' || t === 'Tỷ lệ % vốn góp mới') return true;
          // Alias loop cũ nếu có
          if (t === 'Họ tên tv1' || t === 'ngày sinh tv1' || t === 'giới tính tv1' ||
              t === 'số định danh tv1' || t === 'địa chỉ tv1' || t === 'tỷ lệ % tv1' ||
              t === 'tỷ lệ % cđ1') return true;
          return t.endsWith('CĐ1') || t.endsWith('CĐ2') || t.endsWith('CĐ3');
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

        // 'Họ tên đại diện' xuất hiện ở nhiều file -> giữ nguyên là biến chung ở card Thông tin chung
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
        await deductExportFee('Tăng Vốn Cty Cổ Phần');
        const buffers = await Promise.all(
          this.files.map(f => this.fetchDocBuffer(this.extractDocId(f.link)))
        );

        const docs = buffers.map(buffer => this.createDoc(buffer));

        // Mapping 3 slot cố định CĐ1/CĐ2/CĐ3 theo đúng key của template file 2 & file 4
        // (chú ý: key template có khoảng trắng bất thường — copy nguyên bản từ file Word)
        const shareholderData = {};
        const tyLeHienTaiKeys = [
          'Tỷ lệ % vốn góp hiện tại  CĐ1', // 2 spaces (template gốc)
          'Tỷ lệ % vốn góp hiện tại CĐ2',
          'Tỷ lệ % vốn góp hiện tại CĐ3',
        ];
        this.shareholders.forEach((sh, idx) => {
          const n = idx + 1;
          // Thông tin cho file 2 (Quyết định ĐHĐCĐ)
          shareholderData['Họ tên CĐ' + n] = sh.name || '';
          shareholderData['Số cổ phần hiện tại CĐ' + n] = sh.soCoPhanHienTai || '';
          shareholderData['Vốn hiện tại CĐ' + n] = sh.vonHienTai || '';
          shareholderData[tyLeHienTaiKeys[idx]] = sh.tyLeHienTai || '';
          shareholderData['Số cổ phần mới CĐ' + n] = sh.soCoPhanMoi || '';
          if (idx < 2) {
            shareholderData['Vốn mới CĐ' + n] = sh.vonMoi || '';
            shareholderData['Tỷ lệ % vốn góp mới CĐ' + n] = sh.tyLeMoi || '';
          } else {
            shareholderData['Vốn 100% CĐ3'] = sh.vonMoi || '';
            shareholderData['Tỷ lệ % vốn góp 100%  CĐ3'] = sh.tyLeMoi || ''; // 2 spaces (template gốc)
          }

          // Thông tin cho file 4 (DANH SÁCH CHỦ SỞ HỮU HƯỞNG LỢI)
          shareholderData['ngày sinh CĐ' + n] = sh.birthday || '';
          shareholderData['giới tín CĐ' + n] = sh.gender || ''; // chú ý template viết "giới tín"
          shareholderData['số định danh CĐ' + n] = sh.idNumber || '';
          shareholderData['địa chỉ CĐ' + n] = sh.address || '';
          shareholderData['Tỷ lệ % vốn góp mớiCĐ' + n] = sh.tyLeMoi || ''; // không có space trước CĐ
        });

        // listUser: cổ đông bổ sung cho loop file DANH SÁCH CSH HƯỞNG LỢI (row 8 của file 4)
        const listUser = this.extraShareholders.map(sh => ({
          'Họ tên': sh.name || '',
          'ngày sinh123': sh.birthday || '',
          'giới tính123': sh.gender || '',
          'số định danh123': sh.idNumber || '',
          'địa chỉ123': sh.address || '',
          'Tỷ lệ % vốn góp mới': sh.tyLe || '',
        }));

        const renderDataList = this.files.map(file => ({
          ...this.formValuesCommon,
          ...shareholderData,
          ...file.formValues, // formValues của từng file sẽ override, giữ nguyên 'Họ tên đại diện' nhập riêng ở file 5
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
      enforceTimesNewRoman(doc.getZip());
      return doc.getZip().generate({
        type: "blob",
        mimeType:
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });
    },

    isGenderField(ph) {
      return isGenderField(ph);
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

<style scoped>
.required-hint {
  margin: 0 0 12px;
  font-size: 13px;
  font-weight: 600;
  padding: 8px 12px;
  border-radius: 8px;
}
.required-hint.missing {
  background: #fff7ed;
  border: 1px solid #fdba74;
  color: #c2410c;
}
.required-hint.ok {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  color: #15803d;
}
</style>
