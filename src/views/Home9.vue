<template>
  <div class="editor">
    <div class="card common-card" style="margin-bottom: 24px; text-align: center;">
      <h2 style="font-size: 1.25rem; font-weight: 700; color: #0284c7;">Hồ sơ giải thể công ty 2 thành viên</h2>
    </div>

    <!-- Thông tin chung -->
    <section v-if="placeholdersCommon.length" class="card common-card">
      <h3 class="title-form">Thông tin chung các file</h3>
      <form>
        <div v-for="ph in placeholdersCommon" :key="'c-' + ph" class="form-group">
          <label :for="'c-' + ph">{{ formatLabel(ph) }}</label>
          <PhongDkkdInput v-if="ph === 'Phòng ĐKKD Tỉnh/TP'" :input-id="'c-' + ph" v-model="formValuesCommon[ph]" />
          <GenderRadio v-else-if="isGenderField(ph)" :name="'c-' + ph" v-model="formValuesCommon[ph]" />
          <input v-else type="text" :id="'c-' + ph" v-model="formValuesCommon[ph]" required>
        </div>
      </form>
    </section>

    <!-- Block Thông tin 2 thành viên công ty (TV1 & Chủ tịch HĐTV) + Thành viên bổ sung nếu có -->
    <section class="card members-card">
      <div class="card-head">
        <h3 class="title-form">Thông Tin Thành Viên (Biên bản họp HĐTV)</h3>
      </div>

      <!-- TV1 (Đồng thời là Thư ký cuộc họp) -->
      <div class="member-card">
        <div class="member-head">
          <h4 class="member-title">Thành viên 1 (TV1 - Thư ký cuộc họp)</h4>
          <button type="button" class="btn-action btn-deposit" style="padding: 4px 10px; font-size: 12px;" @click="setAsRepresentative(tv1.name)">
            Gán làm Người đại diện PL
          </button>
        </div>
        <div class="member-grid">
          <div class="form-group">
            <label>Họ tên TV1</label>
            <input type="text" v-model="tv1.name" placeholder="Nguyễn Văn A">
          </div>
          <div class="form-group">
            <label>Số vốn góp TV1</label>
            <input type="text" v-model="tv1.soVonGop" placeholder="Ví dụ: 500.000.000" @input="onTv1VonChange">
          </div>
          <div class="form-group">
            <label>Tỷ lệ % vốn góp TV1</label>
            <input type="text" v-model="tv1.tyLe" placeholder="Ví dụ: 50% hoặc 50">
          </div>
          <div class="form-group">
            <label>Số CN góp vốn TV1</label>
            <input type="text" v-model="tv1.soCnGopVon" placeholder="Số giấy chứng nhận">
          </div>
          <div class="form-group">
            <label>Ngày góp vốn TV1</label>
            <input type="text" v-model="tv1.ngayGopVon" placeholder="DD/MM/YYYY">
          </div>
          <div class="form-group">
            <label>Số phiếu biểu quyết TV1</label>
            <input type="text" v-model="tv1.soPhieu" placeholder="Tự tính: 1.000.000đ = 1 phiếu">
          </div>
        </div>
      </div>

      <!-- TV2 / Chủ tịch HĐTV (Đồng thời là Chủ tọa cuộc họp) -->
      <div class="member-card">
        <div class="member-head">
          <h4 class="member-title">Chủ tịch HĐTV (TV2 - Chủ tọa cuộc họp)</h4>
          <button type="button" class="btn-action btn-deposit" style="padding: 4px 10px; font-size: 12px;" @click="setAsRepresentative(formValuesCommon['Họ tên Chủ tịch HĐTV'])">
            Gán làm Người đại diện PL
          </button>
        </div>
        <div class="member-grid">
          <div class="form-group">
            <label>Họ tên Chủ tịch HĐTV</label>
            <input type="text" v-model="formValuesCommon['Họ tên Chủ tịch HĐTV']" placeholder="Trần Văn B">
          </div>
          <div class="form-group">
            <label>Số vốn góp Chủ tịch HĐTV</label>
            <input type="text" v-model="chuTich.soVonGop" placeholder="Ví dụ: 500.000.000" @input="onChuTichVonChange">
          </div>
          <div class="form-group">
            <label>Tỷ lệ % vốn góp Chủ tịch HĐTV</label>
            <input type="text" v-model="chuTich.tyLe" placeholder="Ví dụ: 50% hoặc 50">
          </div>
          <div class="form-group">
            <label>Số CN góp vốn Chủ tịch HĐTV</label>
            <input type="text" v-model="chuTich.soCnGopVon" placeholder="Số giấy chứng nhận">
          </div>
          <div class="form-group">
            <label>Ngày góp vốn Chủ tịch HĐTV</label>
            <input type="text" v-model="chuTich.ngayGopVon" placeholder="DD/MM/YYYY">
          </div>
          <div class="form-group">
            <label>Số phiếu biểu quyết Chủ tịch HĐTV</label>
            <input type="text" v-model="chuTich.soPhieu" placeholder="Tự tính: 1.000.000đ = 1 phiếu">
          </div>
        </div>
      </div>

      <!-- Vốn điều lệ & Tổng số phiếu (thuộc file Biên bản họp HĐTV) -->
      <div class="member-card" style="background: #f8fafc; border: 1px dashed #cbd5e1;">
        <div class="member-head">
          <h4 class="member-title" style="color: #0369a1;">Tổng hợp vốn & Biểu quyết (Biên bản họp)</h4>
        </div>
        <div class="member-grid">
          <div class="form-group">
            <label>Vốn điều lệ</label>
            <input type="text" v-model="vonDieuLe" placeholder="Ví dụ: 1.000.000.000" @input="onVonDieuLeChange">
          </div>
          <div class="form-group">
            <label>Tổng Số phiếu biểu quyết công ty</label>
            <input type="text" v-model="tongSoPhieu" placeholder="Tự tính: Vốn điều lệ / 1.000.000">
          </div>
        </div>
      </div>

      <!-- Thành viên bổ sung (nếu có > 2 thành viên đi vào loop [[#listUser]]) -->
      <template v-if="extraMembers.length > 0">
        <div v-for="(item, eIdx) in extraMembers" :key="'e' + eIdx" class="member-card">
          <div class="member-head">
            <h4 class="member-title">Thành viên bổ sung {{ eIdx + 1 }}</h4>
            <button type="button" @click="removeExtraMember(eIdx)" class="btn-remove">Xóa</button>
          </div>
          <div class="member-grid">
            <div class="form-group">
              <label>Họ và tên</label>
              <input type="text" v-model="item.name" placeholder="Lê Văn C">
            </div>
            <div class="form-group">
              <label>Số vốn góp</label>
              <input type="text" v-model="item.soVonGop" placeholder="Ví dụ: 200.000.000" @input="onExtraVonChange(item)">
            </div>
            <div class="form-group">
              <label>Tỷ lệ góp vốn</label>
              <input type="text" v-model="item.tyLeGopVon" placeholder="Ví dụ: 20% hoặc 20">
            </div>
            <div class="form-group">
              <label>Số CN góp vốn</label>
              <input type="text" v-model="item.soCnGopVon" placeholder="Số giấy chứng nhận">
            </div>
            <div class="form-group">
              <label>Ngày góp vốn</label>
              <input type="text" v-model="item.ngayGopVon" placeholder="DD/MM/YYYY">
            </div>
            <div class="form-group">
              <label>Số phiếu biểu quyết</label>
              <input type="text" v-model="item.soPhieu" placeholder="Tự tính: 1.000.000đ = 1 phiếu">
            </div>
          </div>
        </div>
      </template>
      <p v-else class="empty-hint">Mặc định đã có TV1 & Chủ tịch HĐTV. Nhấn "Thêm thành viên" nếu công ty có từ 3 thành viên trở lên.</p>

      <div class="card-head" style="margin-top: 12px; margin-bottom: 0;">
        <h3 class="title-form"></h3>
        <button type="button" @click="addExtraMember" class="btn-add">Thêm thành viên</button>
      </div>
    </section>

    <!-- Các file riêng lẻ có placeholder unique -->
    <template v-for="(file, i) in filesWithPlaceholders" :key="file.name">
      <section class="card file-card">
        <h3 class="title-form">Thông Tin File ({{ file.name }}.docx)</h3>
        <form>
          <div v-for="ph in file.placeholders" :key="'f' + i + '-' + ph" class="form-group">
            <label :for="'f' + i + '-' + ph">{{ formatLabel(ph) }}</label>
            <PhongDkkdInput v-if="ph === 'Phòng ĐKKD Tỉnh/TP'" :input-id="'f' + i + '-' + ph" v-model="file.formValues[ph]" />
            <GenderRadio v-else-if="isGenderField(ph)" :name="'f' + i + '-' + ph" v-model="file.formValues[ph]" />
            <input v-else type="text" :id="'f' + i + '-' + ph" v-model="file.formValues[ph]" required>
          </div>
        </form>
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
  name: 'Home9',
  // Giải thể 2 thành viên
  data() {
    const files = [
      {
        name: '1. Biên bản họp HĐTV',
        link: 'https://docs.google.com/document/d/1vginG2vxa3h3jUvRiOFWIU5mGBHCiVUq/edit?usp=drivesdk&rtpof=true&sd=true',
      },
      {
        name: '2. Quyết định của HĐTV',
        link: 'https://docs.google.com/document/d/1Nh5s12Vo-OU0IJJ5Qftt4ciyplmGqdFQ/edit?usp=drivesdk&rtpof=true&sd=true',
      },
      {
        name: '3. TB giải thể',
        link: 'https://docs.google.com/document/d/16Vok8udKKKrNDOjuQJ38fK33QTfUOpOT/edit?usp=drivesdk&rtpof=true&sd=true',
      },
      {
        name: '4. Biên bản thanh lý tài sản',
        link: 'https://docs.google.com/document/d/14XKRosrTJsz_VfAlKFQH5NKM18As68V8/edit?usp=drivesdk&rtpof=true&sd=true',
      },
      {
        name: '5. Danh sách nợ',
        link: 'https://docs.google.com/document/d/17an-ih6uhtvjB5Rh5St9WFQ9oFg7Ja07/edit?usp=drivesdk&rtpof=true&sd=true',
      },
      {
        name: '6. GUQ',
        link: 'https://docs.google.com/document/d/1Mc3hAU8O6LxADB1MRfrKhfDGy3Hf1wpK/edit?usp=drivesdk&rtpof=true&sd=true',
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
      // 2 thành viên cố định theo template Biên bản họp HĐTV
      tv1: {
        name: '',
        soVonGop: '',
        tyLe: '',
        soCnGopVon: '',
        ngayGopVon: '',
        soPhieu: '',
      },
      chuTich: {
        soVonGop: '',
        tyLe: '',
        soCnGopVon: '',
        ngayGopVon: '',
        soPhieu: '',
      },
      // Tổng vốn & phiếu biểu quyết
      vonDieuLe: '',
      tongSoPhieu: '',
      // Thành viên bổ sung đi vào loop [[#listUser]]
      extraMembers: [],
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

    // Tính phiếu biểu quyết tự động: 1.000.000đ = 1 phiếu
    calcVotes(moneyStr) {
      if (!moneyStr) return '';
      const num = parseInt(String(moneyStr).replace(/[^\d]/g, ''), 10);
      if (isNaN(num) || num <= 0) return '';
      const votes = Math.floor(num / 1000000);
      return votes > 0 ? votes.toLocaleString('vi-VN') : '0';
    },

    onTv1VonChange() {
      if (!this.tv1.soPhieu || this.tv1.soPhieu === '0') {
        const v = this.calcVotes(this.tv1.soVonGop);
        if (v) this.tv1.soPhieu = v;
      }
    },

    onChuTichVonChange() {
      if (!this.chuTich.soPhieu || this.chuTich.soPhieu === '0') {
        const v = this.calcVotes(this.chuTich.soVonGop);
        if (v) this.chuTich.soPhieu = v;
      }
    },

    onVonDieuLeChange() {
      if (!this.tongSoPhieu || this.tongSoPhieu === '0') {
        const v = this.calcVotes(this.vonDieuLe);
        if (v) this.tongSoPhieu = v;
      }
    },

    onExtraVonChange(item) {
      if (!item.soPhieu || item.soPhieu === '0') {
        const v = this.calcVotes(item.soVonGop);
        if (v) item.soPhieu = v;
      }
    },

    setAsRepresentative(name) {
      if (!name) {
        alert("Vui lòng nhập họ tên trước khi gán!");
        return;
      }
      this.formValuesCommon['Họ tên đại diện'] = name;
    },

    addExtraMember() {
      this.extraMembers.push({
        name: '',
        soVonGop: '',
        tyLeGopVon: '',
        soCnGopVon: '',
        ngayGopVon: '',
        soPhieu: ''
      });
    },

    removeExtraMember(index) {
      this.extraMembers.splice(index, 1);
    },

    async getFile() {
      const loading = document.getElementById("loading-overlay");
      if (loading) loading.style.display = "flex";
      try {
        const arrays = await Promise.all(
          this.files.map(f => this.getPlaceholdersFromDoc(f.link))
        );
        const { commonAtLeast2, uniqueByArray } = this.analyzeArrays(arrays);

        // Lọc các biến thuộc block thành viên / loop / vốn điều lệ / số phiếu
        // khỏi form tự do để hiển thị ở card chuyên biệt
        const isMemberOrVoteVariable = (item) => {
          if (!item) return false;
          const trimmed = String(item).trim();
          return (
            trimmed === '#listUser' ||
            trimmed === '/listUser' ||
            trimmed === 'listUser' ||
            trimmed === 'Họ tên TV1' ||
            trimmed === 'Số vốn góp TV1' ||
            trimmed === 'Tỷ lệ % vốn góp TV1' ||
            trimmed === 'Số CN góp vốn TV1' ||
            trimmed === 'Ngày góp vốn TV1' ||
            trimmed === 'Số phiếu biểu quyết TV1' ||
            trimmed === 'Số vốn góp Chủ tịch HĐTV' ||
            trimmed === 'Tỷ lệ % vốn góp Chủ tịch HĐTV' ||
            trimmed === 'Số CN góp vốn Chủ tịch HĐTV' ||
            trimmed === 'Ngày góp vốn Chủ tịch HĐTV' ||
            trimmed === 'Số phiếu biểu quyết Chủ tịch HĐTV' ||
            trimmed === 'Vốn điều lệ' ||
            trimmed === 'Tổng Số phiếu biểu quyết công ty' ||
            trimmed === 'Họ và tên' ||
            trimmed === 'Chức danh' ||
            trimmed === 'Số vốn góp' ||
            trimmed === 'Tỷ lệ góp vốn' ||
            trimmed === 'Số CN góp vốn' ||
            trimmed === 'Ngày góp vốn' ||
            trimmed === 'Số phiếu biểu quyết'
          );
        };

        this.files.forEach((f, i) => {
          f.allPlaceholders = arrays[i];
          const filteredUnique = uniqueByArray[i].filter(key => !isMemberOrVoteVariable(key));
          f.placeholders = this.sortCustom(filteredUnique);
          f.formValues = {};
          filteredUnique.forEach(key => {
            f.formValues[key] = isGenderField(key) ? 'Nam' : '';
          });
        });

        this.placeholdersCommon = this.sortCustom(commonAtLeast2.filter(key => !isMemberOrVoteVariable(key)));
        this.formValuesCommon = {};
        this.placeholdersCommon.forEach(key => {
          this.formValuesCommon[key] = isGenderField(key) ? 'Nam' : '';
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
        Object.keys(f.formValues).forEach(k => (f.formValues[k] = isGenderField(k) ? 'Nam' : ''));
      });
      Object.keys(this.formValuesCommon).forEach(k => (this.formValuesCommon[k] = isGenderField(k) ? 'Nam' : ''));
      this.tv1 = {
        name: '',
        soVonGop: '',
        tyLe: '',
        soCnGopVon: '',
        ngayGopVon: '',
        soPhieu: '',
      };
      this.chuTich = {
        soVonGop: '',
        tyLe: '',
        soCnGopVon: '',
        ngayGopVon: '',
        soPhieu: '',
      };
      this.vonDieuLe = '';
      this.tongSoPhieu = '';
      this.extraMembers = [];
      const currentUser = useAuth().state.user;
      if (currentUser) {
        autofillLoginPlaceholders(this.formValuesCommon, currentUser);
        this.files.forEach(f => autofillLoginPlaceholders(f.formValues, currentUser));
      }
    },

    // APPLY CHANGES
    async applyChanges() {
      if (!this.tv1.name || !this.formValuesCommon['Họ tên Chủ tịch HĐTV']) {
        alert("Vui lòng nhập đầy đủ thông tin Thành viên 1 và Chủ tịch HĐTV");
        return;
      }

      const loading = document.getElementById("loading-overlay");
      if (loading) loading.style.display = "flex";
      this.updating = true;
      try {
        await deductExportFee('Giải thể 2 thành viên');
        const buffers = await Promise.all(
          this.files.map(f => this.fetchDocBuffer(this.extractDocId(f.link)))
        );

        const docs = buffers.map(buffer => this.createDoc(buffer));

        // Dữ liệu mapping 2 thành viên cố định
        const memberFixedData = {
          'Họ tên TV1': this.tv1.name || '',
          'Số vốn góp TV1': this.tv1.soVonGop || '',
          'Tỷ lệ % vốn góp TV1': this.tv1.tyLe || '',
          'Số CN góp vốn TV1': this.tv1.soCnGopVon || '',
          'Ngày góp vốn TV1': this.tv1.ngayGopVon || '',
          'Số phiếu biểu quyết TV1': this.tv1.soPhieu || '',

          'Họ tên Chủ tịch HĐTV': this.formValuesCommon['Họ tên Chủ tịch HĐTV'] || '',
          'Số vốn góp Chủ tịch HĐTV': this.chuTich.soVonGop || '',
          'Tỷ lệ % vốn góp Chủ tịch HĐTV': this.chuTich.tyLe || '',
          'Số CN góp vốn Chủ tịch HĐTV': this.chuTich.soCnGopVon || '',
          'Ngày góp vốn Chủ tịch HĐTV': this.chuTich.ngayGopVon || '',
          'Số phiếu biểu quyết Chủ tịch HĐTV': this.chuTich.soPhieu || '',

          'Vốn điều lệ': this.vonDieuLe || '',
          'Tổng Số phiếu biểu quyết công ty': this.tongSoPhieu || '',
        };

        // Chuẩn bị danh sách extraMembers cho loop [[#listUser]] (Biên bản họp HĐTV)
        const listUser = this.extraMembers.map(item => ({
          name: item.name || '',
          'Họ và tên': item.name || '',
          'Chức danh': 'Thành viên',
          'Số vốn góp': item.soVonGop || '',
          'Tỷ lệ góp vốn': item.tyLeGopVon || '',
          'Số CN góp vốn': item.soCnGopVon || '',
          'Ngày góp vốn': item.ngayGopVon || '',
          'Số phiếu biểu quyết': item.soPhieu || '',
        }));

        const renderDataList = this.files.map(file => ({
          ...this.formValuesCommon,
          ...file.formValues,
          ...memberFixedData,
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
