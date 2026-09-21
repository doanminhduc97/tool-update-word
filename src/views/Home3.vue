<template>
<div class="editor">
  <section v-show="placeholdersCommon.length" class="card common-card">
    <h3 class="title-form">Thông Tin Chung Của Các File</h3>
    <form>
      <div v-for="ph in placeholdersCommon" :key="'c-' + ph" class="form-group">
        <label :for="'c-' + ph">{{ ph.includes('ct_') ? ph.slice(3) : ph }}</label>
        <input type="text" :id="'c-' + ph" v-model="formValuesCommon[ph]" required>
      </div>
    </form>
  </section>
  <section v-show="placeholders.length" class="card file-card">
    <h3 class="title-form">Thông Tin File (Điều lệ.docx)</h3>
    <form>
      <div v-for="ph in placeholders" :key="'f0-' + ph" class="form-group">
        <label :for="'f0-' + ph">{{ ph.includes('ct_') ? ph.slice(4) : ph }}</label>
        <input type="text" :id="'f0-' + ph" v-model="formValues[ph]" required>
      </div>
    </form>
  </section>
  <section v-show="placeholders2.length" class="card file-card">
    <h3 class="title-form">Thông Tin File (GĐN đăng ký doanh nghiệp.docx)</h3>
    <form>
      <div v-for="ph in placeholders2" :key="'f1-' + ph" class="form-group">
        <label :for="'f1-' + ph">{{ ph.includes('ct_') ? ph.slice(4) : ph }}</label>
        <input type="text" :id="'f1-' + ph" v-model="formValues2[ph]" required>
      </div>
    </form>
  </section>
  <section v-show="placeholders3.length" class="card file-card">
    <h3 class="title-form">Thông Tin File (Giấy ủy quyền.docx)</h3>
    <form>
      <div v-for="ph in placeholders3" :key="'f2-' + ph" class="form-group">
        <label :for="'f2-' + ph">{{ ph }}</label>
        <input type="text" :id="'f2-' + ph" v-model="formValues3[ph]" required>
      </div>
    </form>
  </section>
  <section v-show="placeholders4.length" class="card file-card">
    <h3 class="title-form">Thông Tin File (DANH SÁCH CHỦ SỞ HỮU HƯỞNG LỢI CỦA DOANH NGHIỆP.docx)</h3>
    <form>
      <div v-for="ph in placeholders4" :key="'f3-' + ph" class="form-group">
        <label :for="'f3-' + ph">{{ ph }}</label>
        <input type="text" :id="'f3-' + ph" v-model="formValues4[ph]" required>
      </div>
    </form>
  </section>
  <section v-show="this.placeholdersCommon.length" class="card members-card">
    <div class="card-head">
      <h3 class="title-form">Danh Sách Cổ Đông</h3>
      <button type="button" @click="addUser" class="btn-add">Thêm cổ đông</button>
    </div>
    <template v-if="userInfoForm.length > 0">
      <div v-for="(item, index) in userInfoForm" :key="index" class="member-card">
        <div class="member-head">
          <h4 class="member-title">Cổ đông {{ index + 1 }}</h4>
          <button type="button" v-on:click="removeUser(index)" class="btn-remove">Xóa</button>
        </div>
        <div class="member-grid">
          <div class="form-group">
            <label>Họ và tên</label>
            <input type="text" v-model="item.name">
          </div>
          <div class="form-group">
            <label>Giới tính</label>
            <input type="text" v-model="item.gender">
          </div>
          <div class="form-group">
            <label>Ngày sinh</label>
            <input type="text" v-model="item.birthday">
          </div>
          <div class="form-group">
            <label>Số định danh cá nhân</label>
            <input type="text" v-model="item.idNumber">
          </div>
          <div class="form-group">
            <label>Số nhà</label>
            <input type="text" v-model="item.homeNumber">
          </div>
          <div class="form-group">
            <label>Phường</label>
            <input type="text" v-model="item.ward">
          </div>
          <div class="form-group">
            <label>Tỉnh</label>
            <input type="text" v-model="item.city">
          </div>
          <div class="form-group">
            <label>Vốn bằng chữ</label>
            <input type="text" v-model="item.vbc">
          </div>
          <div class="form-group">
            <label>Tổng số cổ phần (Số lượng)</label>
            <input type="text" v-model="item.sl">
          </div>
          <div class="form-group">
            <label>Tổng số cổ phần (Giá trị)</label>
            <input type="text" v-model="item.giaTri">
          </div>
          <div class="form-group">
            <label>Tỉ lệ %</label>
            <input type="text" v-model="item.tl">
          </div>
          <div class="form-group">
            <label>Chức danh</label>
            <input type="text" v-model="item.position">
          </div>
        </div>
      </div>
    </template>
    <p v-else class="empty-hint">Chưa có cổ đông nào. Nhấn "Thêm cổ đông" để bắt đầu.</p>
  </section>
  <section v-show="placeholdersCommon.length" class="card">
    <h3 class="title-form">Ngành Nghề Kinh Doanh</h3>
    <div class="checkbox-grid">
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
    </div>
  </section>
  <section v-show="placeholdersCommon.length" class="btn-group">
    <button @click="resetAll()" class="btn-refesh">Làm Mới</button>
    <button :disabled="updating" @click="applyChanges()" class="btn-primary">{{ updating ? 'Đang Tạo File...' : 'Tạo File Mới' }}</button>
  </section>
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
  data() {
    return {
      fileId: "",
      fileContent: "",
      // Điều lệ
      docLink: 'https://docs.google.com/document/d/1z-TnY91ND0OXV-xy33XRObOMUjzxu4nj/edit?usp=drive_link&ouid=107831693588829116850&rtpof=true&sd=true',
      // GĐN
      link1: 'https://docs.google.com/document/d/106jnDEo7G_lYF7OBYuuy656uCU4mNgPP/edit?usp=drive_link&ouid=107831693588829116850&rtpof=true&sd=true',
      // Giấy ủy quyền
      link2: 'https://docs.google.com/document/d/1oSbGxFBP9mX7nM1KxszYxw_S1JlrPlAM/edit?usp=drive_link&ouid=107831693588829116850&rtpof=true&sd=true',
      // 5. DANH SÁCH CHỦ SỞ HỮU HƯỞNG LỢI CỦA DOANH NGHIỆP
      link3: 'https://docs.google.com/document/d/1sKC6oKp4Yfz8WgL6Gm7PlM8FWZk3iPmK/edit?usp=drive_link&ouid=107831693588829116850&rtpof=true&sd=true',
      // 3. Danh sách cổ đông sáng lập
      link4: 'https://docs.google.com/document/d/1OpBIjGF_m1A8KVJDju7rOnmIzzUp1mGB/edit?usp=drive_link&ouid=107831693588829116850&rtpof=true&sd=true',
      updating: false,
      previewHtml: '',
      downloadUrl: '',
      placeholders: [],
      placeholders2: [],
      placeholders3: [],
      placeholders4: [],
      placeholders5: [],
      placeholdersCommon: [],
      formValues: {},
      formValues2: {},
      formValues3: {},
      formValues4: {},
      formValues5: {},
      formValuesCommon: {},
      uniq: [],
      uniq2: [],
      uniq3: [],
      uniq4: [],
      uniq5: [],
      nngd: false,
      nncxcq: false,
      nnth: false,
      bbqa: false,
      nnxd: false,
      nnmm: false,
      nnbbth: false,
      userInfoForm: [],


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
    removeUser(index) {
      this.userInfoForm.splice(index, 1);
    },
    addUser() {
      this.userInfoForm.push({
        name: '',
        gender: '',
        birthday: '',
        idNumber: '',
        homeNumber: '',
        ward: '',
        city: '',
        sl: '',
        tl: '',
        position: '',
        giaTri: '',
        vbc: '',
      })
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

    // login() {
    //   this.tokenClient.requestAccessToken();
    // },
    async getFile() {
      const loading = document.getElementById("loading-overlay");
      loading.style.display = "flex";
      try {
      if (!this.docLink) return alert('Vui Lòng Nhập Link!');
      if (this.docLink) {
        this.fileId = this.extractDocId(this.docLink);
      }
        const [uniq, uniq2, uniq3, uniq4, uniq5] = await Promise.all([
          this.getPlaceholdersFromDoc(this.docLink),
          this.getPlaceholdersFromDoc(this.link1),
          this.getPlaceholdersFromDoc(this.link2),
          this.getPlaceholdersFromDoc(this.link3),
          this.getPlaceholdersFromDoc(this.link4),
        ]);
        
        const {commonAtLeast2, uniqueByArray} = this.analyzeArrays([uniq, uniq2, uniq3, uniq4, uniq5]);
        this.uniq = uniq;
        this.uniq2 = uniq2;
        this.uniq3 = uniq3;
        this.uniq4 = uniq4;
        this.uniq5 = uniq5;
        
        commonAtLeast2.forEach(key => (this.formValuesCommon[key] = ''));
        uniqueByArray[0].forEach(key => (this.formValues[key] = ''));
        uniqueByArray[1].forEach(key => (this.formValues2[key] = ''));
        uniqueByArray[2].forEach(key => (this.formValues3[key] = ''));
        uniqueByArray[3].forEach(key => (this.formValues4[key] = ''));
        uniqueByArray[4].forEach(key => (this.formValues5[key] = ''));
        this.placeholders = uniqueByArray[0];
        
        
        this.placeholders2 = uniqueByArray[1];
        this.placeholders3 = uniqueByArray[2];
        this.placeholders4 = uniqueByArray[3];
        this.placeholders5 = uniqueByArray[4];
        this.placeholdersCommon = commonAtLeast2;
        
        // object table word
        const filterByPrefix = (arr, keyword) => arr.filter(item => item.includes(keyword));
        const cd1Items = filterByPrefix(this.placeholdersCommon, 'cđ1_');
        const removeCommonList = [...cd1Items, '#listUser2', '/listUser2', '#nganhList', '/nganhList', '/listUser', '#listUser', 'code', 'id', 'name1', 'name2', 'name3', "name"];
        const removeList2 = ['#listUser2', '/listUser2', 'name1', 'name2', 'name3'];

        const result = this.placeholdersCommon.filter(item => !removeCommonList.includes(item))
        const result2 = this.placeholders.filter(item => !removeList2.includes(item))

        this.placeholdersCommon = result;
        // Điều lệ công ty
        this.placeholders = result2;
        // cđ1 vốn bằng chữ
        this.placeholders5 = this.placeholders5.filter(item => !item.includes('cđ1'));

        this.placeholdersCommon = this.sortCustom(this.placeholdersCommon).reverse();
      } catch (error) {
        alert("Lỗi khi tải hoặc phân tích file: " + error.message);
      } finally {
        loading.style.display = "none";
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
      this.userInfoForm = [];
    },
    // APPLY CHANGES
    async applyChanges() {
      if(this.userInfoForm.length === 0) {
        alert("Vui lòng thêm ít nhất 1 thành viên");
        return;
      }
      const loading = document.getElementById("loading-overlay");
      loading.style.display = "flex";
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
        if (this.uniq5.indexOf(key) !== -1) {
          this.formValues5[key] = this.formValuesCommon[key];
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
          this.extractDocId(this.link4),
        ];

        // fetch song song
        const [buffer, buffer2, buffer3, buffer4, buffer5] = await Promise.all(
          ids.map(id => this.fetchDocBuffer(id))
        );
        // tạo doc
        const docs = [
          this.createDoc(buffer),
          this.createDoc(buffer2),
          this.createDoc(buffer3),
          this.createDoc(buffer4),
          this.createDoc(buffer5),
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
        this.formValues.nganhList = mapping
          .filter(item => item.condition)
          .flatMap(item => item.data);
        this.formValues.nganhList.forEach((item, index) => {
          item.id = index + 1;
        })

        this.formValues2.nganhList = this.formValues.nganhList;
        this.formValues5.listUser = this.userInfoForm.map(item => {
          return {
            'cđ1_Giới tính': item.gender,
            'cđ1_Họ và tên': item.name,
            'cđ1_Số định danh': item.idNumber,
            'cđ1_Chức danh': item.position,
            'cđ1_Ngày sinh': item.birthday,
            'cđ1_Phường': item.ward,
            'cđ1_Số nhà': item.homeNumber,
            'cđ1_tỷ lệ %': item.tl,
            'cđ1_Tỉnh': item.city,
            'cđ1_Vốn': item.giaTri,
            'cđ1_Số cổ phần': item.sl,
            'cđ1_Vốn bằng chữ': item.vbc,
          }
        })

        //3. Danh sách thành viên
        this.formValues5 = {
          listUser: this.formValues5.listUser,
          'ct_Tỉnh': this.formValues5['ct_Tỉnh'],
          'cđ1_Chức danh': this.formValues5.listUser[0]['cđ1_Chức danh'],
          'cđ1_Họ và tên': this.formValues5.listUser[0]['cđ1_Họ và tên'],
        }
        //5. DANH SÁCH CHỦ SỞ HỮU HƯỞNG LỢI CỦA DOANH NGHIỆP
        this.formValues4.listUser = this.formValues5.listUser;
        this.formValues4['ct_Tỉnh'] = this.formValues5['ct_Tỉnh'];
        this.formValues4['cđ1_Chức danh'] = this.formValues5['cđ1_Chức danh'];
        this.formValues4['cđ1_Họ và tên'] = this.formValues5['cđ1_Họ và tên'];

        //4. Giấy ủy quyền
        this.formValues3['cđ1_Họ và tên'] = this.formValues5.listUser[0]['cđ1_Họ và tên'];
        this.formValues3['cđ1_Giới tính'] = this.formValues5.listUser[0]['cđ1_Giới tính'];
        this.formValues3['cđ1_Ngày sinh'] = this.formValues5.listUser[0]['cđ1_Ngày sinh'];
        this.formValues3['cđ1_Số định danh'] = this.formValues5.listUser[0]['cđ1_Số định danh'];
        this.formValues3['cđ1_Số nhà'] = this.formValues5.listUser[0]['cđ1_Số nhà'];
        this.formValues3['cđ1_Phường'] = this.formValues5.listUser[0]['cđ1_Phường'];
        this.formValues3['cđ1_Tỉnh'] = this.formValues5.listUser[0]['cđ1_Tỉnh'];

        // 1. GĐN Đăng ký doanh nghiệp
        this.formValues2['cđ1_Họ và tên'] = this.formValues5.listUser[0]['cđ1_Họ và tên'];
        this.formValues2['cđ1_Giới tính'] = this.formValues5.listUser[0]['cđ1_Giới tính'];
        this.formValues2['cđ1_Ngày sinh'] = this.formValues5.listUser[0]['cđ1_Ngày sinh'];
        this.formValues2['cđ1_Số định danh'] = this.formValues5.listUser[0]['cđ1_Số định danh'];
        this.formValues2['cđ1_Số nhà'] = this.formValues5.listUser[0]['cđ1_Số nhà'];
        this.formValues2['cđ1_Phường'] = this.formValues5.listUser[0]['cđ1_Phường'];
        this.formValues2['cđ1_Tỉnh'] = this.formValues5.listUser[0]['cđ1_Tỉnh'];
        this.formValues2['cđ1_Chức danh'] = this.formValues5['cđ1_Chức danh'];

        // 2. Điều lệ công ty
        this.formValues.listUser = this.formValues5.listUser;
        this.formValues['cđ1_Họ và tên'] = this.formValues5.listUser[0]['cđ1_Họ và tên'];


        const convertToArray3 = (arr) => {
            const result = [];
            for (let i = 0; i < arr.length; i += 3) {
                result.push({
                    'name1': arr[i]?.['cđ1_Họ và tên'] ?? "",
                    'name2': arr[i + 1]?.['cđ1_Họ và tên'] ?? "",
                    'name3': arr[i + 2]?.['cđ1_Họ và tên'] ?? "",
                });
            }
            return result;
        };
        this.formValues.listUser2 = convertToArray3(this.formValues5.listUser);

        const [doc, doc2, doc3, doc4, doc5] = docs;
        const outBlob = this.renderToBlob(doc, this.formValues);
        const outBlob2 = this.renderToBlob(doc2, this.formValues2);
        const outBlob3 = this.renderToBlob(doc3, this.formValues3);
        const outBlob4 = this.renderToBlob(doc4, this.formValues4);
        const outBlob5 = this.renderToBlob(doc5, this.formValues5);

        let fileArr = [
          {
            name: '2. Điều lệ công ty',
            data: outBlob,
          },
          {
            name: '1. GĐN Đăng ký doanh nghiệp',
            data: outBlob2,
          },
          {
            name: '4. Giấy ủy quyền',
            data: outBlob3,
          },
          {
            name: '5. DANH SÁCH CHỦ SỞ HỮU HƯỞNG LỢI CỦA DOANH NGHIỆP',
            data: outBlob4,
          },
          {
            name: '3. Danh sách thành viên',
            data: outBlob5,
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
        loading.style.display = "none";
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

