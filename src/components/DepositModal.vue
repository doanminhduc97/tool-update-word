<template>
  <div v-if="visible" class="deposit-modal-backdrop" @click.self="close">
    <div class="deposit-modal-card">
      <div class="modal-header">
        <div class="modal-title-wrap">
          <span class="icon-wallet">💳</span>
          <h3>Nạp tiền vào tài khoản</h3>
        </div>
        <button class="btn-close" @click="close">&times;</button>
      </div>

      <div class="modal-body">
        <!-- Banner trạng thái đang đợi thanh toán -->
        <div v-if="polling" class="status-waiting-box">
          <div class="pulse-dot"></div>
          <span>Hệ thống đang tự động lắng nghe giao dịch chuyển khoản từ BIDV...</span>
        </div>

        <!-- Chú ý nghiêm ngặt cảnh báo sai nội dung -->
        <div class="alert-warning-box">
          <div class="alert-icon">⚠️</div>
          <div class="alert-text">
            <strong>LƯU Ý CỰC KỲ QUAN TRỌNG:</strong>
            <p>
              Quý khách vui lòng chuyển khoản <b>CHÍNH XÁC NỘI DUNG</b> theo mẫu dưới đây.
              <br />
              <span class="text-danger">Nếu nội dung chuyển khoản bị sai lệch hoặc thiếu, hệ thống sẽ <b>KHÔNG THỂ tự động nạp tiền</b> vào tài khoản của bạn!</span>
            </p>
          </div>
        </div>

        <div class="deposit-layout">
          <!-- Cột bên trái: Mã VietQR tạo tự động -->
          <div class="qr-pane">
            <div class="qr-frame">
              <img :src="qrImageUrl" alt="Mã VietQR nạp tiền" class="qr-img" />
            </div>
            <p class="qr-hint">Mở app Ngân hàng quét mã QR để điền sẵn STK & Nội dung</p>
          </div>

          <!-- Cột bên phải: Thông tin chuyển khoản chi tiết -->
          <div class="info-pane">
            <div class="info-group">
              <label>Ngân hàng thụ hưởng:</label>
              <div class="info-val-row">
                <span class="val-highlight"><b>{{ bankInfo.bankId }}</b> - Ngân hàng TMCP Đầu tư và Phát triển VN</span>
              </div>
            </div>

            <div class="info-group">
              <label>Số tài khoản nhận:</label>
              <div class="info-val-row">
                <strong class="val-mono val-copy">{{ bankInfo.bankAccount }}</strong>
                <button type="button" class="btn-copy" @click="copyText(bankInfo.bankAccount, 'stk')">
                  {{ copiedField === 'stk' ? '✓ Đã sao chép' : 'Sao chép' }}
                </button>
              </div>
            </div>

            <div class="info-group">
              <label>Tên chủ tài khoản:</label>
              <div class="info-val-row">
                <span class="val-bold">{{ bankInfo.bankAccountName }}</span>
              </div>
            </div>

            <div class="info-group highlight-group">
              <label class="label-required">NỘI DUNG CHUYỂN KHOẢN (BẮT BUỘC):</label>
              <div class="info-val-row">
                <strong class="val-mono val-content">{{ bankInfo.transferContent }}</strong>
                <button type="button" class="btn-copy btn-copy-primary" @click="copyText(bankInfo.transferContent, 'content')">
                  {{ copiedField === 'content' ? '✓ Đã sao chép' : 'Sao chép nội dung' }}
                </button>
              </div>
            </div>

            <div class="amount-presets">
              <label>Chọn nhanh số tiền nạp:</label>
              <div class="preset-chips">
                <button
                  v-for="amt in presetAmounts"
                  :key="amt"
                  type="button"
                  class="chip"
                  :class="{ active: selectedAmount === amt }"
                  @click="selectedAmount = amt"
                >
                  {{ (amt).toLocaleString('vi-VN') }}đ
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button type="button" class="btn-done" @click="close">Tôi đã chuyển khoản xong</button>
      </div>
    </div>
  </div>
</template>

<script>
import http from '@/lib/http'
import { useAuth } from '@/stores/auth'

export default {
  data() {
    return {
      visible: false,
      copiedField: '',
      selectedAmount: 50000,
      presetAmounts: [20000, 50000, 100000, 200000, 500000],
      pollTimer: null,
      polling: false,
      openedAt: 0,
      bankInfo: {
        bankId: 'BIDV',
        bankAccount: '1207386617',
        bankAccountName: 'DOAN MINH DUC',
        transferContent: '',
      },
    }
  },
  computed: {
    user() {
      return useAuth().state.user
    },
    qrImageUrl() {
      const bankId = this.bankInfo.bankId || 'BIDV'
      const accountNo = this.bankInfo.bankAccount || '1207386617'
      const template = 'compact2'
      const amount = this.selectedAmount || 0
      const content = encodeURIComponent(this.bankInfo.transferContent || '')
      const accountName = encodeURIComponent(this.bankInfo.bankAccountName || '')

      return `https://img.vietqr.io/image/${bankId}-${accountNo}-${template}.png?amount=${amount}&addInfo=${content}&accountName=${accountName}`
    },
  },
  beforeUnmount() {
    this.stopPolling()
  },
  methods: {
    async open() {
      this.visible = true
      this.copiedField = ''
      // Chỉ nhận giao dịch phát sinh SAU thời điểm mở modal để tránh báo nhầm giao dịch cũ
      this.openedAt = Date.now()
      try {
        const res = await http.get('/wallet/deposit-info')
        if (res.data?.bankInfo) {
          this.bankInfo = res.data.bankInfo
        }
      } catch (err) {
        console.error('Không tải được thông tin nạp tiền:', err)
        const userCode = this.user?.username ? this.user.username.toUpperCase() : 'USER'
        this.bankInfo.transferContent = `NAP ${userCode}`
      }
      this.startPolling()
    },
    close() {
      this.stopPolling()
      this.visible = false
    },
    startPolling() {
      this.stopPolling()
      this.polling = true
      // Quét mỗi 2.5 giây một lần
      this.pollTimer = setInterval(async () => {
        if (!this.visible || !this.user?.id) return
        try {
          const res = await http.get(`/wallet/check-deposit?userId=${this.user.id}&since=${this.openedAt}`)
          if (res.data?.received) {
            this.handleDepositSuccess(res.data)
          }
        } catch (err) {
          console.warn('Lỗi kiểm tra trạng thái nạp tiền:', err)
        }
      }, 2500)
    },
    stopPolling() {
      if (this.pollTimer) {
        clearInterval(this.pollTimer)
        this.pollTimer = null
      }
      this.polling = false
    },
    handleDepositSuccess(depositData) {
      this.stopPolling()
      const auth = useAuth()
      if (auth.state.user && depositData.newBalance !== undefined) {
        auth.state.user.balance = depositData.newBalance
        auth.state.user.totalDeposited = (auth.state.user.totalDeposited || 0) + depositData.amount
      }

      // Đóng modal nạp tiền
      this.visible = false

      // Bắn thông báo nạp thành công
      const formattedAmount = Number(depositData.amount || 0).toLocaleString('vi-VN') + 'đ'
      const formattedBalance = Number(depositData.newBalance || 0).toLocaleString('vi-VN') + 'đ'

      setTimeout(() => {
        alert(
          `🎉 NẠP TIỀN THÀNH CÔNG!\n\n` +
          `Ngân hàng BIDV đã ghi nhận biến động số dư: +${formattedAmount}\n` +
          `Nội dung: ${depositData.content}\n` +
          `Số dư ví hiện tại của bạn là: ${formattedBalance}.\n` +
          `Chúc bạn tạo hồ sơ thuận lợi!`
        )
      }, 300)
    },
    async copyText(text, field) {
      if (!text) return
      try {
        await navigator.clipboard.writeText(text)
        this.copiedField = field
        setTimeout(() => {
          if (this.copiedField === field) this.copiedField = ''
        }, 2500)
      } catch {
        alert('Đã chọn: ' + text)
      }
    },
  },
}
</script>

<style scoped>
.deposit-modal-backdrop {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  background: rgba(15, 23, 42, 0.65);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100000;
  padding: 16px;
  overflow: hidden;
}

.deposit-modal-card {
  background: #ffffff;
  border-radius: 16px;
  width: 100%;
  max-width: 680px;
  box-shadow: 0 20px 45px rgba(0, 0, 0, 0.25);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: modalIn 0.2s ease-out;
}

@keyframes modalIn {
  from {
    transform: scale(0.95);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 24px;
  border-bottom: 1px solid #f1f5f9;
}

.modal-title-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
}

.modal-title-wrap h3 {
  margin: 0;
  font-size: 19px;
  color: #0f172a;
  font-weight: 700;
}

.icon-wallet {
  font-size: 22px;
}

.btn-close {
  background: transparent;
  border: none;
  font-size: 26px;
  color: #94a3b8;
  cursor: pointer;
  line-height: 1;
}

.btn-close:hover {
  color: #0f172a;
}

.modal-body {
  padding: 20px 24px;
  overflow-y: auto;
  max-height: calc(85vh - 120px);
}

.status-waiting-box {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 13px;
  color: #15803d;
  font-weight: 600;
  margin-bottom: 14px;
}

.pulse-dot {
  width: 10px;
  height: 10px;
  background-color: #22c55e;
  border-radius: 50%;
  box-shadow: 0 0 0 rgba(34, 197, 94, 0.4);
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.6);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(34, 197, 94, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(34, 197, 94, 0);
  }
}

.alert-warning-box {
  background: #fffbeb;
  border: 1.5px solid #fde68a;
  border-radius: 10px;
  padding: 14px 16px;
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.alert-icon {
  font-size: 24px;
}

.alert-text {
  font-size: 13.5px;
  color: #92400e;
  line-height: 1.5;
}

.alert-text strong {
  display: block;
  font-size: 14px;
  margin-bottom: 2px;
  color: #b45309;
}

.alert-text p {
  margin: 0;
}

.text-danger {
  color: #dc2626;
  font-weight: 700;
}

.deposit-layout {
  display: grid;
  grid-template-columns: 240px 1fr;
  gap: 20px;
}

.qr-pane {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.qr-frame {
  width: 220px;
  height: 220px;
  background: #fff;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.qr-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.qr-hint {
  margin-top: 10px;
  font-size: 12px;
  color: #64748b;
  text-align: center;
}

.info-pane {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0; /* cho phép co lại khi nội dung dài, tránh vỡ grid sinh scroll ngang */
}

.info-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-group label {
  font-size: 12.5px;
  color: #64748b;
  font-weight: 600;
}

.label-required {
  color: #dc2626 !important;
  font-weight: 700 !important;
}

.info-val-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  background: #f8fafc;
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  min-width: 0;
}

.highlight-group .info-val-row {
  background: #fef2f2;
  border: 1.5px dashed #f87171;
}

.val-mono {
  font-family: monospace;
  font-size: 15px;
  min-width: 0;
  overflow-wrap: anywhere;
  word-break: break-word;
}

.val-content {
  color: #b91c1c;
  font-size: 16px;
  letter-spacing: 0.5px;
}

.btn-copy {
  padding: 5px 12px;
  border-radius: 6px;
  border: 1px solid #cbd5e1;
  background: #fff;
  color: #334155;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
}

.btn-copy:hover {
  background: #f1f5f9;
}

.btn-copy-primary {
  background: #dc2626;
  border-color: #dc2626;
  color: #fff;
}

.btn-copy-primary:hover {
  background: #b91c1c;
}

.amount-presets {
  margin-top: 4px;
}

.amount-presets label {
  font-size: 12.5px;
  color: #64748b;
  font-weight: 600;
  display: block;
  margin-bottom: 6px;
}

.preset-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.chip {
  padding: 6px 10px;
  border-radius: 20px;
  border: 1px solid #cbd5e1;
  background: #fff;
  font-size: 12px;
  font-weight: 600;
  color: #334155;
  cursor: pointer;
}

.chip:hover {
  border-color: #0284c7;
}

.chip.active {
  background: #0284c7;
  color: #fff;
  border-color: #0284c7;
}

.modal-footer {
  padding: 14px 24px;
  border-top: 1px solid #f1f5f9;
  display: flex;
  justify-content: flex-end;
}

.btn-done {
  padding: 9px 20px;
  border-radius: 8px;
  background: #0284c7;
  color: #fff;
  font-weight: 600;
  border: none;
  cursor: pointer;
}

.btn-done:hover {
  background: #0369a1;
}

@media (max-width: 760px) {
  .deposit-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 600px) {
  .deposit-modal-card {
    max-width: 100%;
  }

  .deposit-layout {
    grid-template-columns: 1fr;
  }
}
</style>
