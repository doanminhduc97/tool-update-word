<template>
  <div class="editor">
    <div class="card common-card" style="margin-bottom: 24px; text-align: center;">
      <h2 style="font-size: 1.25rem; font-weight: 700; color: #0284c7;">Hồ sơ tăng vốn công ty cổ phần</h2>
    </div>

    <!-- KHỐI 1: THÔNG TIN CÔNG TY (Gom tất cả các biến liên quan đến công ty & vốn) -->
    <section v-show="companyPlaceholders.length" class="card common-card">
      <h3 class="title-form">Thông Tin Công Ty</h3>
      <form>
        <div v-for="ph in companyPlaceholders" :key="'comp-' + ph" class="form-group">
          <label :for="'comp-' + ph">{{ formatLabel(ph) }}</label>
          <PhongDkkdInput v-if="ph === 'Phòng ĐKKD Tỉnh/TP' || ph === 'Cơ quan đăng ký kinh doanh cấp tỉnh'" :input-id="'comp-' + ph" v-model="companyValues[ph]" />
          <GenderRadio v-else-if="isGenderField(ph)" :name="'comp-' + ph" v-model="companyValues[ph]" />
          <input v-else type="text" :id="'comp-' + ph" v-model="companyValues[ph]" required>
        </div>
      </form>
    </section>

    <!-- KHỐI 2: THÔNG TIN NGƯỜI ĐẠI DIỆN PL & CHỦ TỊCH HĐQT -->
    <section v-show="repPlaceholders.length" class="card common-card">
      <h3 class="title-form">Thông Tin Người Đại Diện Pháp Luật &amp; Chủ Tịch HĐQT</h3>
      <form>
        <div v-for="ph in repPlaceholders" :key="'rep-' + ph" class="form-group">
          <label :for="'rep-' + ph">{{ formatLabel(ph) }}</label>
          <GenderRadio v-if="isGenderField(ph)" :name="'rep-' + ph" v-model="repValues[ph]" />
          <input v-else type="text" :id="'rep-' + ph" v-model="repValues[ph]" required>
        </div>
      </form>
    </section>

    <!-- KHỐI 3: THÔNG TIN CỔ ĐÔNG (Quyết định ĐHĐCĐ + DANH SÁCH CSH HƯỞNG LỢI, từ 25%) -->
    <section class="card members-card">
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
              <label>Tỷ lệ % sở hữu cổ phần có quyền biểu quyết</label>
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
          <PhongDkkdInput v-if="ph === 'Phòng ĐKKD Tỉnh/TP' || ph === 'Cơ quan đăng ký kinh doanh cấp tỉnh'" :input-id="'other-' + i + '-' + ph" v-model="file.formValues[ph]" />
          <GenderRadio v-else-if="isGenderField(ph)" :name="'other-' + i + '-' + ph" v-model="file.formValues[ph]" />
          <input v-else type="text" :id="'other-' + i + '-' + ph" v-model="file.formValues[ph]" required>
        </div>
      </form>
    </section>

    <!-- Nhóm nút bấm -->
    <section v-if="hasAnyForm" class="btn-group">
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
      // 1. Khối thông tin công ty
      companyPlaceholders: [],
      companyValues: {},

      // 2. Khối thông tin người đại diện PL + Chủ tịch HĐQT
      repPlaceholders: [],
      repValues: {},

      // 3. Khối thông tin người được ủy quyền (Login_*)
      authorizedPersonPlaceholders: [],
      authorizedPersonValues: {},

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
    hasAnyForm() {
      return this.companyPlaceholders.length > 0
        || this.repPlaceholders.length > 0
        || this.authorizedPersonPlaceholders.length > 0
        || this.otherFilesWithPlaceholders.length > 0;
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

    // Tự nhận diện biến thuộc Thông tin Công ty
    isCompanyField(ph) {
      if (!ph) return false;
      const s = String(ph).trim().toLowerCase();
      // Loại trừ các trường thuộc người đại diện hay người ủy quyền
      if (s.includes('đại diện') || s.includes('đại điện') || s.startsWith('login_')) {
        return false;
      }
      if (s.endsWith('cđ1') || s.endsWith('cđ2') || s.endsWith('cđ3')) {
        return false;
      }
      return (
        s.includes('công ty') ||
        s.includes('cty') ||
        s.includes('mã số thuế') ||
        s.includes('mst') ||
        s.includes('doanh nghiệp') ||
        s.includes('phòng đkkd') ||
        s.includes('cơ quan đăng ký') ||
        s.includes('vốn điều lệ') ||
        s.includes('hình thức tăng vốn') ||
        s.includes('số lượng cổ phần') ||
        s.includes('tổng số cổ phần') ||
        s.includes('số cổ phần mới')
      );
    },

    // Nhận diện biến thuộc Thông tin Người đại diện PL / Chủ tịch HĐQT
    isRepField(ph) {
      if (!ph) return false;
      const s = String(ph).trim().toLowerCase();
      if (s.startsWith('login_')) return false;
      if (s.endsWith('cđ1') || s.endsWith('cđ2') || s.endsWith('cđ3')) return false;
      return s.includes('đại diện') || s.includes('đại điện') || s.includes('chủ tịch');
    },

    // Nhận diện biến thuộc Người được ủy quyền
    isLoginField(ph) {
      if (!ph) return false;
      return String(ph).startsWith('Login_');
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
        const { uniqueByArray } = this.analyzeArrays(arrays);

        // Lọc biến cổ đông CĐ1/CĐ2/CĐ3 + cú pháp loop listUser + các biến loop của file 4
        const isShareholderVar = (item) => {
          if (!item) return false;
          const t = String(item).trim();
          if (t === '#listUser' || t === '/listUser' || t === 'listUser') return true;
          // Các biến trong hàng loop của file 4 (DANH SÁCH CSH HƯỞNG LỢI)
          if (t === 'Họ tên' || t === 'ngày sinh123' || t === 'giới tính123' ||
              t === 'số định danh123' || t === 'địa chỉ123' || t === 'Tỷ lệ % vốn góp mới') return true;
          // Các biến trong 2 hàng loop của file 2 (Quyết định ĐHĐCĐ: hiện tại + sau thay đổi)
          if (t === 'Số cổ phần hiện tại123' || t === 'Vốn hiện tại123' || t === 'Tỷ lệ % vốn góp hiện tại123' ||
              t === 'Số cổ phần mới123' || t === 'Vốn mới123' || t === 'Tỷ lệ % vốn góp mới123') return true;
          // Alias loop cũ nếu có
          if (t === 'Họ tên tv1' || t === 'ngày sinh tv1' || t === 'giới tính tv1' ||
              t === 'số định danh tv1' || t === 'địa chỉ tv1' || t === 'tỷ lệ % tv1' ||
              t === 'tỷ lệ % cđ1') return true;
          return t.endsWith('CĐ1') || t.endsWith('CĐ2') || t.endsWith('CĐ3');
        };

        this.files.forEach((f, i) => {
          f.allPlaceholders = arrays[i];
          const filteredUnique = uniqueByArray[i].filter(key => !isShareholderVar(key));
          f.placeholders = filteredUnique;
          f.formValues = {};
          filteredUnique.forEach(key => {
            f.formValues[key] = isGenderField(key) ? 'Nam' : '';
          });
        });

        // Thu thập toàn bộ placeholder (cả common >= 2 file lẫn unique từng file, đã lọc loop/cổ đông)
        const allSet = new Set();
        arrays.forEach(arr => arr.forEach(k => {
          if (!isShareholderVar(k)) allSet.add(k);
        }));
        const allPlaceholders = [...allSet];

        // 1. Khối Công ty
        const compList = allPlaceholders.filter(p => this.isCompanyField(p));
        const compOrder = [
          'tên công ty',
          'mã số doanh nghiệp',
          'tỉnh công ty',
          'cơ quan đăng ký kinh doanh cấp tỉnh',
          'vốn điều lệ hiện tại',
          'vốn điều lệ hiện tại bằng chữ',
          'hình thức tăng vốn',
          'số lượng cổ phần mới',
          'tổng số cổ phần hiện tại',
          'số cổ phần mới',
          'vốn điều lệ mới',
          'vốn điều lệ mới bằng chữ',
        ];
        compList.sort((a, b) => {
          const idxA = compOrder.indexOf(a.trim().toLowerCase());
          const idxB = compOrder.indexOf(b.trim().toLowerCase());
          if (idxA !== -1 && idxB !== -1) return idxA - idxB;
          if (idxA !== -1) return -1;
          if (idxB !== -1) return 1;
          return a.localeCompare(b);
        });
        this.companyPlaceholders = compList;
        this.companyValues = {};
        this.companyPlaceholders.forEach(k => {
          this.companyValues[k] = isGenderField(k) ? 'Nam' : '';
        });

        // 2. Khối Người đại diện PL + Chủ tịch HĐQT
        const repList = allPlaceholders.filter(p => this.isRepField(p));
        const repOrder = [
          'họ tên đại diện',
          'giới tính đại diện',
          'sinh ngày đại diện',
          'ngày sinh đại diện',
          'số định danh cá nhân đại diện',
          'địa chỉ của đại điện',
          'họ tên chủ tịch hdqt',
        ];
        repList.sort((a, b) => {
          const idxA = repOrder.indexOf(a.trim().toLowerCase());
          const idxB = repOrder.indexOf(b.trim().toLowerCase());
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

        // Prune: loại các key đã thuộc 3 khối ra khỏi formValues từng file (tránh trùng lặp / ghi đè)
        const blockKeys = new Set([...this.companyPlaceholders, ...this.repPlaceholders, ...this.authorizedPersonPlaceholders]);
        this.files.forEach(f => {
          const kept = f.placeholders.filter(k => !blockKeys.has(k));
          const newFv = {};
          kept.forEach(k => { newFv[k] = f.formValues[k] ?? ''; });
          f.placeholders = kept;
          f.formValues = newFv;
        });

        // Tự động điền các placeholder có tiền tố "Login_" từ user hiện tại
        const currentUser = useAuth().state.user;
        if (currentUser) {
          autofillLoginPlaceholders(this.authorizedPersonValues, currentUser);
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
      Object.keys(this.companyValues).forEach(k => (this.companyValues[k] = isGenderField(k) ? 'Nam' : ''));
      Object.keys(this.repValues).forEach(k => (this.repValues[k] = isGenderField(k) ? 'Nam' : ''));
      Object.keys(this.authorizedPersonValues).forEach(k => (this.authorizedPersonValues[k] = isGenderField(k) ? 'Nam' : ''));
      this.files.forEach(f => {
        Object.keys(f.formValues).forEach(k => (f.formValues[k] = isGenderField(k) ? 'Nam' : ''));
      });
      this.shareholders.forEach(sh => {
        Object.keys(sh).forEach(k => (sh[k] = k === 'gender' ? 'Nam' : ''));
      });
      this.extraShareholders = [];

      const currentUser = useAuth().state.user;
      if (currentUser) {
        autofillLoginPlaceholders(this.authorizedPersonValues, currentUser);
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

        // listUser: cổ đông bổ sung cho loop [[#listUser]] của file 2 (Quyết định ĐHĐCĐ)
        // và file 4 (DANH SÁCH CHỦ SỞ HỮU HƯỞNG LỢI). File 2 dùng toàn bộ cổ đông bổ sung,
        // còn file 4 (CSH) chỉ giữ cổ đông có tỷ lệ % sở hữu cổ phần >= 25% (cột 12 & 14).
        const listUserFull = this.extraShareholders.map(sh => ({
          'Họ tên': sh.name || '',
          // File 2: hàng loop hiện tại
          'Số cổ phần hiện tại123': sh.soCoPhanHienTai || '',
          'Vốn hiện tại123': sh.vonHienTai || '',
          'Tỷ lệ % vốn góp hiện tại123': sh.tyLeHienTai || '',
          // File 2: hàng loop sau thay đổi
          'Số cổ phần mới123': sh.soCoPhanMoi || '',
          'Vốn mới123': sh.vonMoi || '',
          'Tỷ lệ % vốn góp mới123': sh.tyLeMoi || '',
          // File 4: hàng loop CSH hưởng lợi
          'ngày sinh123': sh.birthday || '',
          'giới tính123': sh.gender || '',
          'số định danh123': sh.idNumber || '',
          'địa chỉ123': sh.address || '',
          'Tỷ lệ % vốn góp mới': sh.tyLe || '',
          tlcd: sh.tyLe || '',
        }));
        const listUserCsh = filterCshHuongLoiList(
          listUserFull.map(x => ({ 'Họ tên': x['Họ tên'], 'ngày sinh123': x['ngày sinh123'], 'giới tính123': x['giới tính123'], 'số định danh123': x['số định danh123'], 'địa chỉ123': x['địa chỉ123'], 'Tỷ lệ % vốn góp mới': x['Tỷ lệ % vốn góp mới'], tlcd: x.tlcd })),
          'cophan'
        );

        const renderDataList = this.files.map(file => ({
          ...this.companyValues,
          ...this.repValues,
          ...this.authorizedPersonValues,
          ...file.formValues, // formValues của từng file sẽ override, giữ nguyên giá trị riêng
          ...shareholderData,
          listUser: file.name.includes('DANH SÁCH CHỦ SỞ HỮU HƯỞNG LỢI') ? listUserCsh : listUserFull,
        }));

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

    renderToBlob(doc, data, options = {}) {
      doc.render(data);
      enforceTimesNewRoman(doc.getZip());
      const zip = doc.getZip();

      // Nếu yêu cầu xoay dọc ngày sinh từ dưới lên trên (Bottom-to-Top: btLr) và căn CENTER
      if (options.rotateDobVertical) {
        try {
          const docXmlFile = zip.file('word/document.xml');
          if (docXmlFile) {
            let xml = docXmlFile.asText();
            // Tìm các ô bảng chứa ngày sinh dd/mm/yyyy và chèn <w:textDirection w:val="btLr"/> + căn center tuyệt đối
            xml = xml.replace(/<w:tc[\s\S]*?<\/w:tc>/g, (tc) => {
              const textOnly = tc.replace(/<[^>]+>/g, '').trim();
              if (/\b\d{1,2}[/.-]\d{1,2}[/.-]\d{4}\b/.test(textOnly)) {
                let modified = tc;

                // 1. Căn giữa theo chiều dọc ô bảng (vertical alignment: center)
                if (modified.includes('<w:vAlign')) {
                  modified = modified.replace(/<w:vAlign[^>]*\/>/, '<w:vAlign w:val="center"/>');
                } else if (modified.includes('<w:tcPr>')) {
                  modified = modified.replace('<w:tcPr>', '<w:tcPr><w:vAlign w:val="center"/>');
                }

                // 2. Căn giữa đoạn văn (horizontal alignment: center)
                if (modified.includes('<w:jc')) {
                  modified = modified.replace(/<w:jc[^>]*\/>/, '<w:jc w:val="center"/>');
                } else if (modified.includes('<w:pPr>')) {
                  modified = modified.replace('<w:pPr>', '<w:pPr><w:jc w:val="center"/>');
                }

                // 3. Xóa thụt lề thừa (w:ind) có thể làm lệch vị trí center
                modified = modified.replace(/<w:ind[^>]*\/>/g, '<w:ind w:left="0" w:right="0" w:firstLine="0"/>');

                // 4. Xoay dọc từ dưới lên trên (btLr)
                if (modified.includes('<w:textDirection')) {
                  modified = modified.replace(/<w:textDirection[^>]*\/>/, '<w:textDirection w:val="btLr"/>');
                } else if (modified.includes('<w:tcPr>')) {
                  modified = modified.replace('<w:tcPr>', '<w:tcPr><w:textDirection w:val="btLr"/>');
                } else if (modified.includes('<w:tcPr/>')) {
                  modified = modified.replace('<w:tcPr/>', '<w:tcPr><w:textDirection w:val="btLr"/><w:vAlign w:val="center"/></w:tcPr>');
                } else {
                  modified = modified.replace('<w:tc>', '<w:tc><w:tcPr><w:textDirection w:val="btLr"/><w:vAlign w:val="center"/></w:tcPr>');
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
