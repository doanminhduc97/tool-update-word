<template>
  <div class="editor">
    <div class="card common-card" style="margin-bottom: 24px; text-align: center;">
      <h2 style="font-size: 1.25rem; font-weight: 700; color: #0284c7;">Cập nhật chủ sở hữu hưởng lợi</h2>
    </div>

    <!-- KHỐI 1: THÔNG TIN CÔNG TY (Gom tất cả các biến liên quan đến công ty) -->
    <section v-show="companyPlaceholders.length" class="card common-card">
      <h3 class="title-form">Thông Tin Công Ty</h3>
      <form>
        <div v-for="ph in companyPlaceholders" :key="'comp-' + ph" class="form-group">
          <label :for="'comp-' + ph">{{ formatLabel(ph) }}</label>
          <PhongDkkdInput v-if="ph === 'Phòng ĐKKD Tỉnh/TP'" :input-id="'comp-' + ph" v-model="companyValues[ph]" />
          <GenderRadio v-else-if="isGenderField(ph)" :name="'comp-' + ph" v-model="companyValues[ph]" />
          <input v-else type="text" :id="'comp-' + ph" v-model="companyValues[ph]" required>
        </div>
      </form>
    </section>

    <!-- KHỐI 2: THÔNG TIN NGƯỜI ĐẠI DIỆN PHÁP LUẬT -->
    <section v-show="repPlaceholders.length" class="card common-card">
      <h3 class="title-form">Thông Tin Người Đại Diện Pháp Luật</h3>
      <form>
        <div v-for="ph in repPlaceholders" :key="'rep-' + ph" class="form-group">
          <label :for="'rep-' + ph">{{ formatLabel(ph) }}</label>
          <GenderRadio v-if="isGenderField(ph)" :name="'rep-' + ph" v-model="repValues[ph]" />
          <input v-else type="text" :id="'rep-' + ph" v-model="repValues[ph]" required>
        </div>
      </form>
    </section>

    <!-- KHỐI 3: DANH SÁCH CHỦ SỞ HỮU HƯỞNG LỢI (TỪ 25%) -->
    <section class="card members-card">
      <div class="card-head">
        <h3 class="title-form">Danh Sách Chủ Sở Hữu Hưởng Lợi (từ 25%)</h3>
        <button type="button" @click="addUser" class="btn-add">Thêm thành viên</button>
      </div>
      <template v-if="userInfoForm.length > 0">
        <div v-for="(item, index) in userInfoForm" :key="index" class="member-card">
          <div class="member-head">
            <h4 class="member-title">
              Thành viên {{ index + 1 }}
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
              <GenderRadio :name="'csh-gender-' + index" v-model="item.gender" />
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

    <!-- KHỐI 4: THÔNG TIN NGƯỜI ĐƯỢC ỦY QUYỀN (Autofill từ phiên đăng nhập) -->
    <section v-show="authorizedPersonPlaceholders.length" class="card common-card">
      <h3 class="title-form">Thông Tin Người Được Ủy Quyền</h3>
      <form>
        <div v-for="ph in authorizedPersonPlaceholders" :key="'auth-' + ph" class="form-group">
          <label :for="'auth-' + ph">{{ formatLabel(ph) }}</label>
          <GenderRadio v-if="isGenderField(ph)" :name="'auth-' + ph" v-model="authorizedPersonValues[ph]" />
          <input v-else type="text" :id="'auth-' + ph" v-model="authorizedPersonValues[ph]" required>
        </div>
      </form>
    </section>

    <!-- Các trường riêng khác (nếu có trường nào không thuộc 4 khối trên) -->
    <section v-for="(file, i) in otherFilesWithPlaceholders" :key="file.name" class="card file-card">
      <h3 class="title-form">Thông Tin File ({{ file.name }}.docx)</h3>
      <form>
        <div v-for="ph in file.otherPlaceholders" :key="'other-' + i + '-' + ph" class="form-group">
          <label :for="'other-' + i + '-' + ph">{{ formatLabel(ph) }}</label>
          <GenderRadio v-if="isGenderField(ph)" :name="'other-' + i + '-' + ph" v-model="file.formValues[ph]" />
          <input v-else type="text" :id="'other-' + i + '-' + ph" v-model="file.formValues[ph]" required>
        </div>
      </form>
    </section>

    <!-- Nhóm nút bấm -->
    <section class="btn-group">
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
import { filterCshHuongLoiList } from '@/lib/cshHelper';

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
      // 1. Khối thông tin công ty
      companyPlaceholders: [],
      companyValues: {},

      // 2. Khối thông tin người đại diện pháp luật
      repPlaceholders: [],
      repValues: {},

      // 3. Khối thông tin người được ủy quyền (Login_*)
      authorizedPersonPlaceholders: [],
      authorizedPersonValues: {},

      userInfoForm: [],
      updating: false,
    };
  },

  computed: {
    otherFilesWithPlaceholders() {
      return this.files
        .map(f => {
          const others = (f.placeholders || []).filter(ph => {
            return !this.isCompanyField(ph) && !this.isRepField(ph) && !this.isLoginField(ph);
          });
          return {
            ...f,
            otherPlaceholders: others,
          };
        })
        .filter(f => f.otherPlaceholders.length > 0);
    },
  },

  async mounted() {
    await this.initGapi();
    await this.initAuth();
    await this.getFile();
  },

  methods: {
    formatLabel(ph) {
      if (!ph) return '';
      const s = String(ph);
      return s.startsWith('Login_') ? s.slice(6) : s;
    },

    // Tự nhận diện biến thuộc Thông tin Công ty
    isCompanyField(ph) {
      if (!ph) return false;
      const s = String(ph).trim().toLowerCase();
      // Loại trừ các trường thuộc người đại diện hay người ủy quyền
      if (s.includes('đại diện') || s.includes('đại điện') || s.startsWith('login_')) {
        return false;
      }
      return (
        s.includes('công ty') ||
        s.includes('cty') ||
        s.includes('mã số thuế') ||
        s.includes('mst') ||
        s.includes('doanh nghiệp') ||
        s.includes('phòng đkkd') ||
        s.includes('cơ quan đăng ký')
      );
    },

    // Nhận diện biến thuộc Thông tin Người đại diện PL
    isRepField(ph) {
      if (!ph) return false;
      const s = String(ph).trim();
      return (s.includes('đại diện') || s.includes('đại điện')) && !s.startsWith('Login_');
    },

    // Nhận diện biến thuộc Người được ủy quyền
    isLoginField(ph) {
      if (!ph) return false;
      return String(ph).startsWith('Login_');
    },

    addUser() {
      this.userInfoForm.push({
        name: '',
        gender: 'Nam',
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

        // Helper lọc các biến thành viên và cú pháp vòng lặp khỏi form
        const isMemberOrLoopVariable = (item) => {
          if (!item) return false;
          const trimmed = item.trim();
          if (trimmed === '#listUser' || trimmed === '/listUser' || trimmed === 'listUser') return true;
          if (/^tv\d+/.test(trimmed) || /tv\d+$/.test(trimmed)) return true;
          if (/^cđ\d+/.test(trimmed) || /cđ\d+$/.test(trimmed)) return true;
          if (trimmed.includes('cđ1') || trimmed.includes('tv1')) return true;
          if (trimmed.includes('tỷ lệ % cđ') || trimmed.includes('tỉ lệ % cđ') || trimmed.includes('tỷ lệ % tv') || trimmed.includes('tỉ lệ % tv')) return true;
          return false;
        };

        // Thu thập toàn bộ placeholder trên cả 4 file
        const allSet = new Set();
        this.files.forEach((f, i) => {
          f.allPlaceholders = arrays[i];
          const filtered = arrays[i].filter(k => !isMemberOrLoopVariable(k));
          f.placeholders = filtered;
          f.formValues = {};
          filtered.forEach(k => {
            f.formValues[k] = isGenderField(k) ? 'Nam' : '';
            allSet.add(k);
          });
        });

        const allPlaceholders = [...allSet];

        // 1. Khối Công ty: Lọc các trường công ty và sắp xếp logic
        const compList = allPlaceholders.filter(p => this.isCompanyField(p));
        // Thứ tự mong muốn: Tên cty, Mã số thuế, Thành phố cty, SĐT, Email, Phòng ĐKKD
        const compOrder = ['tên công ty', 'mã số thuế', 'thành phố công ty', 'số điện thoại cty', 'email công ty', 'phòng đkkd tỉnh/tp'];
        compList.sort((a, b) => {
          const idxA = compOrder.indexOf(a.toLowerCase());
          const idxB = compOrder.indexOf(b.toLowerCase());
          if (idxA !== -1 && idxB !== -1) return idxA - idxB;
          if (idxA !== -1) return -1;
          if (idxB !== -1) return 1;
          return a.localeCompare(b);
        });
        this.companyPlaceholders = compList;
        this.companyValues = {};
        this.companyPlaceholders.forEach(k => {
          this.companyValues[k] = '';
        });

        // 2. Khối Người đại diện PL:
        const repList = allPlaceholders.filter(p => this.isRepField(p));
        // Thứ tự mong muốn: Họ tên, Giới tính, Sinh ngày, Số định danh, Địa chỉ
        const repOrder = ['họ tên đại diện', 'giới tính đại diện', 'sinh ngày đại diện', 'số định danh cá nhân đại diện', 'địa chỉ của đại điện'];
        repList.sort((a, b) => {
          const idxA = repOrder.indexOf(a.toLowerCase());
          const idxB = repOrder.indexOf(b.toLowerCase());
          if (idxA !== -1 && idxB !== -1) return idxA - idxB;
          if (idxA !== -1) return -1;
          if (idxB !== -1) return 1;
          return a.localeCompare(b);
        });
        this.repPlaceholders = repList;
        this.repValues = {};
        this.repPlaceholders.forEach(k => {
          this.repValues[k] = isGenderField(k) ? 'Nam' : '';
        });

        // 3. Khối Người được ủy quyền (Login_*)
        const authList = allPlaceholders.filter(p => this.isLoginField(p));
        this.authorizedPersonPlaceholders = authList;
        this.authorizedPersonValues = {};
        this.authorizedPersonPlaceholders.forEach(k => {
          this.authorizedPersonValues[k] = isGenderField(k) ? 'Nam' : '';
        });

        // Tự động điền các placeholder có tiền tố "Login_" từ user hiện tại
        const currentUser = useAuth().state.user;
        if (currentUser) {
          autofillLoginPlaceholders(this.authorizedPersonValues, currentUser);
          this.files.forEach(f => autofillLoginPlaceholders(f.formValues, currentUser));
        }

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

    resetAll() {
      Object.keys(this.companyValues).forEach(k => (this.companyValues[k] = ''));
      Object.keys(this.repValues).forEach(k => (this.repValues[k] = isGenderField(k) ? 'Nam' : ''));
      Object.keys(this.authorizedPersonValues).forEach(k => (this.authorizedPersonValues[k] = isGenderField(k) ? 'Nam' : ''));
      this.files.forEach(f => {
        Object.keys(f.formValues).forEach(k => (f.formValues[k] = isGenderField(k) ? 'Nam' : ''));
      });
      this.userInfoForm = [];
      this.addUser();

      const currentUser = useAuth().state.user;
      if (currentUser) {
        autofillLoginPlaceholders(this.authorizedPersonValues, currentUser);
        this.files.forEach(f => autofillLoginPlaceholders(f.formValues, currentUser));
      }
    },

    // APPLY CHANGES
    async applyChanges() {
      if (this.userInfoForm.length === 0) {
        alert("Vui lòng thêm ít nhất 1 thành viên");
        return;
      }

      const loading = document.getElementById("loading-overlay");
      if (loading) loading.style.display = "flex";
      this.updating = true;

      try {
        await deductExportFee('Cập nhật CSH hưởng lợi');
        const buffers = await Promise.all(
          this.files.map(f => this.fetchDocBuffer(this.extractDocId(f.link)))
        );

        const docs = buffers.map(buffer => this.createDoc(buffer));

        // Chuẩn bị danh sách listUser cho template có loop [[#listUser]]
        const parseRate = (val) => {
          if (!val) return 0;
          const cleaned = String(val).replace(/,/g, '.').replace(/[^0-9.]/g, '');
          return parseFloat(cleaned) || 0;
        };

        const listUser = this.userInfoForm
          .filter(item => {
            const r1 = parseRate(item.tl);
            const r2 = parseRate(item.tlcd);
            return Math.max(r1, r2) >= 25;
          })
          .map((item, idx) => ({
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
            'Địa chỉ': item.address || '',
            'địa chỉ': item.address || '',
            'Tỷ lệ': item.tl || '',
            'tỷ lệ': item.tl || '',
            'Tỉ lệ': item.tl || '',
            'tỉ lệ': item.tl || '',
            'tỷ lệ %': item.tl || '',
            'tỉ lệ %': item.tl || '',
          }));

        // Flatten các biến thành viên theo dạng biến phẳng (tv1_*, tv2_*, Họ tên tv1...)
        const tvVariables = {};
        this.userInfoForm.forEach((item, index) => {
          const num = index + 1;
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

        // Lọc listUser cho file CSH hưởng lợi: chỉ giữ thành viên có tỷ lệ >= 25% (vốn hoặc cổ phần)
        const listUserCsh = filterCshHuongLoiList(listUser, 'auto');

        const renderDataList = this.files.map((file) => {
          const isCshDoc = file.name && file.name.includes('DANH SÁCH CHỦ SỞ HỮU HƯỞNG LỢI');
          return {
            ...this.companyValues,
            ...this.repValues,
            ...this.authorizedPersonValues,
            ...file.formValues,
            ...tvVariables,
            listUser: isCshDoc ? listUserCsh : listUser,
          };
        });

        const outBlobs = docs.map((doc, i) => {
          const isFileCSH = this.files[i]?.name?.includes('DANH SÁCH CHỦ SỞ HỮU HƯỞNG LỢI');
          return this.renderToBlob(doc, renderDataList[i], { rotateDobVertical: isFileCSH });
        });

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

    renderToBlob(doc, data, options = {}) {
      doc.render(data);
      const zip = doc.getZip();

      enforceTimesNewRoman(zip);

      // Căn giữa ô chứa text xoay dọc
      if (options.rotateDobVertical) {
        try {
          const docXml = zip.file('word/document.xml');
          if (docXml) {
            let xml = docXml.asText();
            xml = xml.replace(/(<w:tc\b[\s\S]*?<\/w:tc>)/g, (tc) => {
              if (tc.includes('<w:textDirection') || tc.includes('w:val="btLr"')) {
                let modified = tc;
                if (/<w:vAlign\b[^>]*\/>/.test(modified)) {
                  modified = modified.replace(/<w:vAlign\b[^>]*\/>/g, '<w:vAlign w:val="center"/>');
                } else if (modified.includes('</w:tcPr>')) {
                  modified = modified.replace('</w:tcPr>', '<w:vAlign w:val="center"/></w:tcPr>');
                }

                if (/<w:jc\b[^>]*\/>/.test(modified)) {
                  modified = modified.replace(/<w:jc\b[^>]*\/>/g, '<w:jc w:val="center"/>');
                } else if (modified.includes('</w:pPr>')) {
                  modified = modified.replace('</w:pPr>', '<w:jc w:val="center"/></w:pPr>');
                }

                return modified;
              }
              return tc;
            });
            zip.file('word/document.xml', xml);
          }
        } catch (e) {
          console.warn('Lỗi khi xoay dọc textDirection ngày sinh:', e);
        }
      }

      return zip.generate({
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
  }
};
</script>
