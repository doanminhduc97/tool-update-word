<template>
  <div class="page-loader-card card common-card" :class="{ 'is-error': !!error }">
    <template v-if="error">
      <div class="loader-error-icon">⚠️</div>
      <h3 class="loader-title text-red">Không thể tải dữ liệu</h3>
      <p class="loader-desc">{{ error }}</p>
      <button type="button" class="btn-primary loader-retry-btn" @click="$emit('retry')">
        🔄 Thử lại
      </button>
    </template>
    <template v-else>
      <div class="page-spinner"></div>
      <h3 class="loader-title">{{ title || 'Đang tải dữ liệu hồ sơ...' }}</h3>
      <p class="loader-desc">{{ message || 'Hệ thống đang kết nối và đồng bộ toàn bộ dữ liệu biểu mẫu, vui lòng chờ trong giây lát...' }}</p>
    </template>
  </div>
</template>

<script>
export default {
  name: 'PageLoader',
  props: {
    title: {
      type: String,
      default: '',
    },
    message: {
      type: String,
      default: '',
    },
    error: {
      type: String,
      default: null,
    },
  },
  emits: ['retry'],
};
</script>

<style scoped>
.page-loader-card {
  min-height: 260px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 2.5rem 1.5rem;
  margin-bottom: 24px;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.page-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #e2e8f0;
  border-top: 4px solid #0284c7;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 1.25rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loader-error-icon {
  font-size: 2.5rem;
  margin-bottom: 0.75rem;
}

.loader-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 0.5rem 0;
}

.loader-title.text-red {
  color: #ef4444;
}

.loader-desc {
  font-size: 0.925rem;
  color: #64748b;
  max-width: 520px;
  margin: 0 0 1rem 0;
  line-height: 1.5;
}

.loader-retry-btn {
  margin-top: 0.5rem;
  padding: 8px 18px;
  font-size: 14px;
}
</style>
