<template>
  <div class="editor">
    <!-- Form thông tin chung -->
    <section v-show="placeholdersCommon.length" class="card common-card">
      <h3 class="title-form">Thông Tin Chung Của Các File</h3>
      <form>
        <div v-for="ph in placeholdersCommon" :key="'c-' + ph" class="form-group">
          <label :for="'c-' + ph">{{ ph }}</label>
          <input type="text" :id="'c-' + ph" v-model="formValuesCommon[ph]" required>
        </div>
      </form>
    </section>

    <!-- Dynamic Form Danh sách Chủ sở hữu hưởng lợi -->
    <section v-show="placeholdersCommon.length" class="card members-card">
      <div class="card-head">
        <h3 class="title-form">Danh Sách Chủ Sở Hữu Hưởng Lợi</h3>
        <button type="button" @click="addUser" class="btn-add">Thêm thành viên</button>
      </div>
      <template v-if="userInfoForm.length > 0">
        <div v-for="(item, index) in userInfoForm" :key="index" class="member-card">
          <div class="member-head">
            <h4 class="member-title">
              Thành viên {{ index + 1 }} {{ index === 0 ? '(Mặc định là người đại diện)' : '' }}
            </h4>
            <button type="button" @click="removeUser(index)" class="btn-remove">Xóa</button>
          </div>
          <div class="member-grid">
            <div class="form-group">
              <label>Họ và tên</label>
              <input type="text" v-model="item.name" placeholder="Nguyễn Văn A">
            </div>
            <div class="form-group">
              <label>Giới tính</label>
              <input type="text" v-model="item.gender" placeholder="Nam / Nữ">
            </div>
            <div class="form-group">
              <label>Ngày sinh</label>
              <input type="text" v-model="item.birthday" placeholder="DD/MM/YYYY">
            </div>
            <div class="form-group">
              <label>Số định danh cá nhân</label>
              <input type="text" v-model="item.idNumber" placeholder="Số CCCD / Định danh">
            </div>
            <div class="form-group">
              <label>Địa chỉ liên lạc</label>
              <input type="text" v-model="item.address" placeholder="Số nhà, đường, phường, tỉnh...">
            </div>
            <div class="form-group">
              <label>Tỷ lệ % sở hữu vốn điều lệ</label>
              <input type="text" v-model="item.tl" placeholder="Ví dụ: 50% hoặc 50">
            </div>
            <div class="form-group">
              <label>Tỷ lệ % sở hữu cổ phần có quyền biểu quyết</label>
              <input type="text" v-model="item.tlcd" placeholder="Ví dụ: 50% hoặc 50">
            </div>
          </div>
        </div>
      </template>
      <p v-else class="empty-hint">Chưa có thành viên nào. Nhấn "Thêm thành viên" để bắt đầu.</p>
    </section>

    <!-- Các form riêng của từng file nếu có placeholder riêng -->
    <section v-for="(file, i) in filesWithPlaceholders" :key="file.name" class="card file-card">
      <h3 class="title-form">Thông Tin File ({{ file.name }}.docx)</h3>
      <form>
        <div v-for="ph in file.placeholders" :key="'f' + i + '-' + ph" class="form-group">
          <label :for="'f' + i + '-' + ph">{{ ph }}</label>
          <input type="text" :id="'f' + i + '-' + ph" v-model="file.formValues[ph]" required>
        </div>
      </form>
    </section>

    <!-- Nhóm nút bấm -->
    <section v-show="placeholdersCommon.length || filesWithPlaceholders.length" class="btn-group">
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

export default {
  name: 'Home5',
  data() {
    const files = [
      {
        name: '1. Giấy đề nghị đăng ký thay đổi nội dung ĐKDN',
        link: 'https://docs.google.com/document/d/1sl496Gn-xilD-Wf_LuxfS7B1YJz3KyXE/edit?usp=sharing&ouid=107831693588829116850&rtpof=true&sd=true',
      },
      {
        name: '2. DANH SÁCH CHỦ SỞ HỮU HƯỞNG LỢI CỦA DOANH NGHIỆP',
        link: 'https://docs.google.com/document/d/1SrGaGTJyhrbU8omM369a8iTpV_p6Fctu/edit?usp=sharing&ouid=107831693588829116850&rtpof=true&sd=true',
      },
      {
        name: '3. Giấy ủy quyền',
        link: 'https://docs.google.com/document/d/1edAmzt4z1QGp5q_5iYc1WYJLHM71RX2F/edit?usp=sharing&ouid=107831693588829116850&rtpof=true&sd=true',
      },
      {
        name: '4. Hướng dẫn ký hồ sơ',
        link: 'https://docs.google.com/document/d/1WVeca_CXBTGV__iWIDbPlwyUdhqh46WL/edit?usp=sharing&ouid=107831693588829116850&rtpof=true&sd=true',
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
      userInfoForm: [],
      updating: false,
    };
  },

  computed: {
    filesWithPlaceholders() {
      return this.files.filter(f => f.placeholders && f.placeholders.length > 0);
    },
  },

  async mounted() {
    await this.initGapi();
    await this.initAuth();
    await this.getFile();
  },

  methods: {
    addUser() {
      this.userInfoForm.push({
        name: '',
        gender: '',
        birthday: '',
        idNumber: '',
        address: '',
        tl: '',
        tlcd: ''
      });
    },

    removeUser(index) {
      this.userInfoForm.splice(index, 1);
    },

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

    async getFile() {
      const loading = document.getElementById("loading-overlay");
      if (loading) loading.style.display = "flex";
      try {
        const arrays = await Promise.all(
          this.files.map(f => this.getPlaceholdersFromDoc(f.link))
        );
        const { commonAtLeast2, uniqueByArray } = this.analyzeArrays(arrays);

        // Helper lọc các biến thành viên, người đại diện và cú pháp vòng lặp khỏi form tự do
        const isMemberOrLoopVariable = (item) => {
          if (!item) return false;
          const trimmed = item.trim();
          if (trimmed === '#listUser' || trimmed === '/listUser' || trimmed === 'listUser') return true;
          if (/^tv\d+/.test(trimmed) || /tv\d+$/.test(trimmed)) return true;
          if (/^cđ\d+/.test(trimmed) || /cđ\d+$/.test(trimmed)) return true;
          if (trimmed.includes('cđ1') || trimmed.includes('tv1')) return true;
          if (trimmed.includes('tỷ lệ % cđ') || trimmed.includes('tỉ lệ % cđ') || trimmed.includes('tỷ lệ % tv') || trimmed.includes('tỉ lệ % tv')) return true;
          // Họ tên đại diện tự động lấy từ thành viên đầu tiên
          if (trimmed === 'Họ tên đại diện') return true;
          return false;
        };

        this.files.forEach((f, i) => {
          f.allPlaceholders = arrays[i];
          // Lọc bỏ biến tv1_*, tv2_* và loop #listUser, /listUser
          const filteredUnique = uniqueByArray[i].filter(key => !isMemberOrLoopVariable(key));
          f.placeholders = this.sortCustom(filteredUnique);
          f.formValues = {};
          filteredUnique.forEach(key => {
            f.formValues[key] = '';
          });
        });

        // Lọc thông tin chung
        const filteredCommon = commonAtLeast2.filter(key => !isMemberOrLoopVariable(key));
        this.placeholdersCommon = this.sortCustom(filteredCommon);
        this.formValuesCommon = {};
        this.placeholdersCommon.forEach(key => {
          this.formValuesCommon[key] = '';
        });

        // Tự động khởi tạo ít nhất 1 thành viên nếu chưa có
        if (this.userInfoForm.length === 0) {
          this.addUser();
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
      this.addUser();
    },

    // APPLY CHANGES
    async applyChanges() {
      if (this.userInfoForm.length === 0) {
        alert("Vui lòng thêm ít nhất 1 thành viên");
        return;
      }

      const repUser = this.userInfoForm[0] || {};
      // Họ tên đại diện tự động lấy từ họ tên thành viên đầu tiên
      this.formValuesCommon['Họ tên đại diện'] = repUser.name || '';

      const loading = document.getElementById("loading-overlay");
      if (loading) loading.style.display = "flex";
      this.updating = true;

      try {
        const buffers = await Promise.all(
          this.files.map(f => this.fetchDocBuffer(this.extractDocId(f.link)))
        );

        const docs = buffers.map(buffer => this.createDoc(buffer));

        // Chuẩn bị danh sách listUser cho template có loop [[#listUser]]
        const listUser = this.userInfoForm.map((item, idx) => ({
          stt: idx + 1,
          id: idx + 1,
          name: item.name || '',
          gender: item.gender || '',
          birthday: item.birthday || '',
          idNumber: item.idNumber || '',
          address: item.address || '',
          tl: item.tl || '',
          tlcd: item.tlcd || '',
          // Key đúng theo template File 2 (DANH SÁCH CHỦ SỞ HỮU HƯỞNG LỢI)
          'Họ tên tv1': item.name || '',
          'ngày sinh tv1': item.birthday || '',
          'giới tính tv1': item.gender || '',
          'số định danh tv1': item.idNumber || '',
          'địa chỉ tv1': item.address || '',
          'tỷ lệ % tv1': item.tl || '',
          'tỷ lệ % cđ1': item.tlcd || '',
          'tỉ lệ % tv1': item.tl || '',
          'tỉ lệ % cđ1': item.tlcd || '',
          'tỷ lệ % cđ': item.tlcd || '',
          'tỉ lệ % cđ': item.tlcd || '',
          'tỷ lệ % cổ phần': item.tlcd || '',
          'tỉ lệ % cổ phần': item.tlcd || '',
          'Tỷ lệ % sở hữu cổ phần có quyền biểu quyết': item.tlcd || '',
          'Tỷ lệ % sở hữu vốn điều lệ': item.tl || '',
          // Alias tiếng Việt thuận tiện
          'Họ và tên': item.name || '',
          'Họ tên': item.name || '',
          'Giới tính': item.gender || '',
          'giới tính': item.gender || '',
          'Ngày sinh': item.birthday || '',
          'ngày sinh': item.birthday || '',
          'Số định danh cá nhân': item.idNumber || '',
          'số định danh': item.idNumber || '',
          'Địa chỉ liên lạc': item.address || '',
          'địa chỉ': item.address || '',
          'tỷ lệ %': item.tl || '',
          'tv1_Họ tên': item.name || '',
          'tv1_Giới tính': item.gender || '',
          'tv1_ngày sinh': item.birthday || '',
          'tv1_Số định danh cá nhân': item.idNumber || '',
          'tv1_địa chỉ': item.address || '',
          'tv1_tỉ lệ %': item.tl || '',
          'tv1_tỷ lệ %': item.tl || '',
          'tv1_tỷ lệ % cđ': item.tlcd || '',
          'tv1_tỉ lệ % cđ': item.tlcd || ''
        }));

        // Chuẩn bị dữ liệu từng thành viên cho trường hợp template dùng tv1_*, tv2_* hoặc tv1, tv2
        const tvVariables = {};
        this.userInfoForm.forEach((item, idx) => {
          const num = idx + 1;
          // Format postfix: Họ tên tv1, ngày sinh tv1...
          tvVariables[`Họ tên tv${num}`] = item.name || '';
          tvVariables[`giới tính tv${num}`] = item.gender || '';
          tvVariables[`ngày sinh tv${num}`] = item.birthday || '';
          tvVariables[`số định danh tv${num}`] = item.idNumber || '';
          tvVariables[`địa chỉ tv${num}`] = item.address || '';
          tvVariables[`tỷ lệ % tv${num}`] = item.tl || '';
          tvVariables[`tỷ lệ % cđ${num}`] = item.tlcd || '';
          tvVariables[`tỉ lệ % tv${num}`] = item.tl || '';
          tvVariables[`tỉ lệ % cđ${num}`] = item.tlcd || '';
          tvVariables[`tỷ lệ % cđ`] = item.tlcd || '';
          tvVariables[`tỉ lệ % cđ`] = item.tlcd || '';
          tvVariables[`tỷ lệ % cổ phần`] = item.tlcd || '';
          tvVariables[`tỉ lệ % cổ phần`] = item.tlcd || '';

          // Format prefix: tv1_Họ tên, tv1_giới tính...
          tvVariables[`tv${num}_Họ tên`] = item.name || '';
          tvVariables[`tv${num}_Giới tính`] = item.gender || '';
          tvVariables[`tv${num}_giới tính`] = item.gender || '';
          tvVariables[`tv${num}_ngày sinh`] = item.birthday || '';
          tvVariables[`tv${num}_Số định danh cá nhân`] = item.idNumber || '';
          tvVariables[`tv${num}_số định danh`] = item.idNumber || '';
          tvVariables[`tv${num}_địa chỉ`] = item.address || '';
          tvVariables[`tv${num}_tỉ lệ %`] = item.tl || '';
          tvVariables[`tv${num}_tỷ lệ %`] = item.tl || '';
          tvVariables[`tv${num}_tỷ lệ % cđ`] = item.tlcd || '';
          tvVariables[`tv${num}_tỉ lệ % cđ`] = item.tlcd || '';
          tvVariables[`cđ${num}_tỷ lệ %`] = item.tlcd || '';
          tvVariables[`cđ${num}_tỉ lệ %`] = item.tlcd || '';
        });

        // Thông tin người đại diện ủy quyền (mặc định lấy thành viên đầu tiên)
        const repVariables = {
          'Họ tên tv1': repUser.name || '',
          'giới tính tv1': repUser.gender || '',
          'ngày sinh tv1': repUser.birthday || '',
          'số định danh tv1': repUser.idNumber || '',
          'địa chỉ tv1': repUser.address || '',
          'tv1_Họ tên': repUser.name || '',
          'tv1_Giới tính': repUser.gender || '',
          'tv1_giới tính': repUser.gender || '',
          'tv1_ngày sinh': repUser.birthday || '',
          'tv1_Số định danh cá nhân': repUser.idNumber || '',
          'tv1_số định danh': repUser.idNumber || '',
          'tv1_địa chỉ': repUser.address || '',
        };

        const renderDataList = this.files.map((file, i) => {
          return {
            ...this.formValuesCommon,
            ...file.formValues,
            ...tvVariables,
            ...repVariables,
            listUser,
          };
        });

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
        alert("Không thể tạo file: " + error.message);
        console.error("Lỗi applyChanges:", error);
        if (error.properties && error.properties.errors) {
          console.error(error.properties.errors);
        }
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
      return [...arr].sort((a, b) => {
        const prefixA = a.substring(0, 4);
        const prefixB = b.substring(0, 4);

        if (prefixA === prefixB) return a.localeCompare(b);
        return prefixA.localeCompare(prefixB);
      });
    }
  }
};
</script>
