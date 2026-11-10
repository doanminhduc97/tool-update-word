<template>
  <div class="editor">
    <div class="card common-card" style="margin-bottom: 24px; text-align: center;">
      <h2 style="font-size: 1.25rem; font-weight: 700; color: #0284c7;">Hồ sơ giảm vốn công ty 2 thành viên</h2>
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

      <!-- Dynamic Form Danh sách thành viên: ngay sau Thông Tin File (1. GĐN) -->
      <section v-if="i === 0" class="card members-card">
        <div class="card-head">
          <h3 class="title-form">Danh Sách Thành Viên (GĐN + Quyết định HĐTV + Danh sách thành viên)</h3>
          <button type="button" @click="addUser" class="btn-add">Thêm thành viên</button>
        </div>
        <p :class="userInfoForm.length < 2 ? 'required-hint missing' : 'required-hint ok'">
          {{ userInfoForm.length < 2
            ? `⚠️ Bắt buộc ít nhất 2 thành viên (hiện có ${userInfoForm.length})`
            : `✓ Đã đủ tối thiểu ${userInfoForm.length} thành viên` }}
        </p>
        <template v-if="userInfoForm.length > 0">
          <div v-for="(item, index) in userInfoForm" :key="index" class="member-card">
            <div class="member-head">
              <h4 class="member-title">Thành viên {{ index + 1 }}</h4>
              <button type="button" @click="removeUser(index)" class="btn-remove">Xóa</button>
            </div>
            <div class="member-grid">
              <div class="form-group">
                <label>Họ tên</label>
                <input type="text" v-model="item.name" placeholder="Nguyễn Văn A">
              </div>
              <div class="form-group">
                <label>Giới tính</label>
                <GenderRadio :name="'tv15-gender-' + index" v-model="item.gender" />
              </div>
              <div class="form-group">
                <label>Ngày sinh</label>
                <input type="text" v-model="item.birthday" placeholder="DD/MM/YYYY">
              </div>
              <div class="form-group">
                <label>Số định danh cá nhân</label>
                <input type="text" v-model="item.idNumber" placeholder="Số CCCD">
              </div>
              <div class="form-group">
                <label>Số nhà</label>
                <input type="text" v-model="item.homeNumber" placeholder="Số nhà, đường">
              </div>
              <div class="form-group">
                <label>Phường</label>
                <input type="text" v-model="item.ward" placeholder="Phường / Xã">
              </div>
              <div class="form-group">
                <label>Tỉnh</label>
                <input type="text" v-model="item.city" placeholder="Tỉnh / Thành phố">
              </div>
              <div class="form-group">
                <label>Chức danh</label>
                <input type="text" v-model="item.position" placeholder="Thành viên công ty / Chủ tịch HĐTV">
              </div>
              <div class="form-group">
                <label>Vốn góp bằng số</label>
                <input type="text" v-model="item.vbs" placeholder="Ví dụ: 500.000.000">
              </div>
              <div class="form-group">
                <label>Vốn góp bằng chữ</label>
                <input type="text" v-model="item.vbc" placeholder="Năm tỷ Việt Nam đồng...">
              </div>
              <div class="form-group">
                <label>Tỷ lệ % vốn góp</label>
                <input type="text" v-model="item.tl" placeholder="Ví dụ: 50 hoặc 50%">
              </div>
            </div>
          </div>
        </template>
        <p v-else class="empty-hint">Chưa có thành viên nào. Nhấn "Thêm thành viên" để bắt đầu.</p>
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
  name: 'Home15',
  // Giảm Vốn Cty 2 Thành Viên
  data() {
    const files = [
      {
        name: '1. GĐN đăng ký thay đổi nội dung ĐKDN',
        link: 'https://docs.google.com/document/d/1r7_MojOYh0FKZAlMqZ8sa0kERM4kfyki/edit?usp=drivesdk&rtpof=true&sd=true',
      },
      {
        name: '2. Quyết định của HĐTV',
        link: 'https://docs.google.com/document/d/1WHMSM25hADG10WblamZ_yRhIJAZpyL6d/edit?usp=drivesdk&rtpof=true&sd=true',
      },
      {
        name: '3. Danh sách thành viên',
        link: 'https://docs.google.com/document/d/13GkLIJ5m3eqYoA4GaB1TBkQArFtubRu0/edit?usp=drivesdk&rtpof=true&sd=true',
      },
      {
        name: '4. Cam kết bảo đảm khi giảm vốn điều lệ',
        link: 'https://docs.google.com/document/d/1i4A8L0YM60EGQ6s4QNfGGT0-ZXLKp_rr/edit?usp=drivesdk&rtpof=true&sd=true',
      },
      {
        name: '5. Giấy ủy quyền',
        link: 'https://docs.google.com/document/d/1e2pTVk_bnLijZC5PcJajU7Gkxm4ORmYy/edit?usp=drivesdk&rtpof=true&sd=true',
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
      userInfoForm: [],
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
      if (!ph) return ''
      let s = String(ph)
      if (s.startsWith('Login_')) {
        return s.slice(6)
      }
      return s
    },

    addUser() {
      this.userInfoForm.push({
        name: '', gender: 'Nam', birthday: '', idNumber: '',
        homeNumber: '', ward: '', city: '',
        position: '', vbs: '', vbc: '', tl: ''
      });
    },

    removeUser(index) {
      this.userInfoForm.splice(index, 1);
    },

    async getFile() {
      const loading = document.getElementById("loading-overlay");
      if (loading) loading.style.display = "flex";
      try {
        const arrays = await Promise.all(
          this.files.map(f => this.getPlaceholdersFromDoc(f.link))
        );
        const { commonAtLeast2, uniqueByArray } = this.analyzeArrays(arrays);

        // Lọc cú pháp loop & biến thành viên tv1_* khỏi form tự do
        const isMemberOrLoopVariable = (item) => {
          if (!item) return false;
          const t = String(item).trim();
          if (t === '#listUser' || t === '/listUser' || t === 'listUser') return true;
          if (t.startsWith('tv1_')) return true;
          // TV1/TV2 tự lấy từ Danh Sách Thành Viên (TV1 = add đầu tiên, TV2 = tiếp theo)
          if (t === 'Họ tên TV1' || t === 'Số vốn góp TV1' || t === 'Tỷ lệ % vốn góp TV1' ||
              t === 'Họ tên TV2' || t === 'Số vốn góp TV2' || t === 'Tỷ lệ % vốn góp TV2') return true;
          // Đại diện tự lấy từ Thành viên 1
          if (t === 'Họ tên đại diện') return true;
          return false;
        };

        this.files.forEach((f, i) => {
          f.allPlaceholders = arrays[i];
          const filteredUnique = uniqueByArray[i].filter(key => !isMemberOrLoopVariable(key));
          f.placeholders = this.sortCustom(filteredUnique);
          f.formValues = {};
          filteredUnique.forEach(key => {
            f.formValues[key] = '';
          });
        });

        this.placeholdersCommon = this.sortCustom(commonAtLeast2.filter(key => !isMemberOrLoopVariable(key)));
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
      this.userInfoForm = [];
      const currentUser = useAuth().state.user;
      if (currentUser) {
        autofillLoginPlaceholders(this.formValuesCommon, currentUser);
        this.files.forEach(f => autofillLoginPlaceholders(f.formValues, currentUser));
      }
    },

    // APPLY CHANGES
    async applyChanges() {
      if (this.userInfoForm.length < 2) {
        alert("Vui lòng thêm ít nhất 2 thành viên");
        return;
      }

      const loading = document.getElementById("loading-overlay");
      if (loading) loading.style.display = "flex";
      this.updating = true;
      try {
        await deductExportFee('Giảm Vốn Cty 2 Thành Viên');
        const buffers = await Promise.all(
          this.files.map(f => this.fetchDocBuffer(this.extractDocId(f.link)))
        );

        const docs = buffers.map(buffer => this.createDoc(buffer));

        // listUser: mỗi thành viên 1 phần tử theo chuẩn tv1_*
        const listUser = this.userInfoForm.map(item => ({
          'tv1_Giới tính': item.gender || '',
          'tv1_Họ tên': item.name || '',
          'tv1_Số định danh cá nhân': item.idNumber || '',
          'tv1_chức danh': item.position || '',
          'tv1_ngày sinh': item.birthday || '',
          'tv1_phường': item.ward || '',
          'tv1_số nhà': item.homeNumber || '',
          'tv1_tỉ lệ %': item.tl || '',
          'tv1_tỉnh': item.city || '',
          'tv1_vốn bằng chữ': item.vbc || '',
          'tv1_vốn bằng số': item.vbs || '',
        }));

        // Slot cố định TV1/TV2 lấy từ Danh Sách Thành Viên (TV1 = add đầu tiên, TV2 = tiếp theo)
        const tv1 = this.userInfoForm[0] || {};
        const tv2 = this.userInfoForm[1] || {};
        const tvFixed = {
          'Họ tên TV1': tv1.name || '',
          'Số vốn góp TV1': tv1.vbs || '',
          'Tỷ lệ % vốn góp TV1': tv1.tl || '',
          'Họ tên TV2': tv2.name || '',
          'Số vốn góp TV2': tv2.vbs || '',
          'Tỷ lệ % vốn góp TV2': tv2.tl || '',
          'Họ tên đại diện': tv1.name || '',
        };

        const renderDataList = this.files.map(file => ({
          ...this.formValuesCommon,
          ...file.formValues,
          ...tvFixed,
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
.members-card {
  margin-top: 1rem;
}
.card-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}
.required-hint {
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 1rem;
}
.required-hint.missing {
  color: #dc2626;
}
.required-hint.ok {
  color: #16a34a;
}
.member-card {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  background: #f8fafc;
}
.member-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}
.member-title {
  font-size: 14px;
  font-weight: 700;
  color: #0369a1;
}
.member-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 0.75rem;
}
.btn-add {
  background: #0284c7;
  color: #fff;
  border: none;
  padding: 6px 14px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}
.btn-add:hover {
  background: #0369a1;
}
.btn-remove {
  background: #fee2e2;
  color: #b91c1c;
  border: 1px solid #fca5a5;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
}
.btn-remove:hover {
  background: #fecaca;
}
.empty-hint {
  font-size: 13px;
  color: #64748b;
  font-style: italic;
}
</style>
