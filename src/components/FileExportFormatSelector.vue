<template>
  <div v-if="files && files.length" class="export-format-card">
    <!-- Header của Card -->
    <div class="card-header">
      <div class="header-left">
        <div class="badge-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
        </div>
        <div>
          <h4 class="card-title">Định dạng file xuất hồ sơ</h4>
          <p class="card-subtitle">Lựa chọn tải về dạng văn bản Word (.docx) hoặc tài liệu PDF (.pdf)</p>
        </div>
      </div>

      <!-- Nút thao tác nhanh Tất cả Word / Tất cả PDF -->
      <div class="quick-actions">
        <button
          type="button"
          @click="setAll('docx')"
          class="quick-btn"
          :class="{ active: isAllWord }"
        >
          <span class="dot docx-dot"></span>
          Tất cả Word (.docx)
        </button>
        <button
          type="button"
          @click="setAll('pdf')"
          class="quick-btn"
          :class="{ active: isAllPdf }"
        >
          <span class="dot pdf-dot"></span>
          Tất cả PDF (.pdf)
        </button>
      </div>
    </div>

    <!-- Danh sách file dạng lưới -->
    <div class="files-grid">
      <div
        v-for="(file, idx) in files"
        :key="idx"
        class="file-item"
        :class="formats[file.name] === 'pdf' ? 'is-pdf' : 'is-docx'"
      >
        <div class="file-info">
          <div class="file-icon" :class="formats[file.name] === 'pdf' ? 'icon-pdf' : 'icon-docx'">
            <span v-if="formats[file.name] === 'pdf'">PDF</span>
            <span v-else>DOC</span>
          </div>
          <span class="file-name" :title="file.name">{{ file.name }}</span>
        </div>

        <!-- Segmented Toggle Button -->
        <div class="format-toggle">
          <button
            type="button"
            class="toggle-btn"
            :class="{ active: formats[file.name] !== 'pdf' }"
            @click="setFormat(file.name, 'docx')"
          >
            Word
          </button>
          <button
            type="button"
            class="toggle-btn btn-pdf-toggle"
            :class="{ active: formats[file.name] === 'pdf' }"
            @click="setFormat(file.name, 'pdf')"
          >
            PDF
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FileExportFormatSelector',
  props: {
    files: {
      type: Array,
      required: true,
      default: () => [],
    },
    modelValue: {
      type: Object,
      default: () => ({}),
    },
  },
  emits: ['update:modelValue'],
  computed: {
    formats() {
      return this.modelValue || {};
    },
    isAllWord() {
      if (!this.files.length) return false;
      return this.files.every(f => (this.formats[f.name] || 'docx') === 'docx');
    },
    isAllPdf() {
      if (!this.files.length) return false;
      return this.files.every(f => this.formats[f.name] === 'pdf');
    },
  },
  watch: {
    files: {
      immediate: true,
      handler(newFiles) {
        if (!newFiles || !newFiles.length) return;
        const updated = { ...this.modelValue };
        let hasNew = false;
        newFiles.forEach(f => {
          if (!updated[f.name]) {
            updated[f.name] = 'docx';
            hasNew = true;
          }
        });
        if (hasNew) {
          this.$emit('update:modelValue', updated);
        }
      },
    },
  },
  methods: {
    setFormat(name, format) {
      const updated = { ...this.modelValue, [name]: format };
      this.$emit('update:modelValue', updated);
    },
    setAll(format) {
      const updated = {};
      this.files.forEach(f => {
        updated[f.name] = format;
      });
      this.$emit('update:modelValue', updated);
    },
  },
};
</script>

<style scoped lang="scss">
.export-format-card {
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  margin-top: 1.5rem;
  margin-bottom: 1.5rem;
  padding: 1.25rem 1.5rem;
  border-top: 4px solid #6366f1;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #f1f5f9;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;

  .badge-icon {
    width: 36px;
    height: 36px;
    border-radius: 8px;
    background: #eef2ff;
    color: #4f46e5;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .card-title {
    font-size: 15px;
    font-weight: 700;
    color: #0f172a;
    margin: 0;
    line-height: 1.3;
  }

  .card-subtitle {
    font-size: 12.5px;
    color: #64748b;
    margin: 2px 0 0 0;
  }
}

.quick-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;

  .quick-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 12.5px;
    font-weight: 600;
    padding: 6px 12px;
    border-radius: 6px;
    border: 1px solid #e2e8f0;
    background: #f8fafc;
    color: #475569;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      background: #f1f5f9;
      color: #1e293b;
    }

    &.active {
      background: #eef2ff;
      border-color: #c7d2fe;
      color: #4338ca;
      box-shadow: 0 1px 2px rgba(67, 56, 202, 0.08);
    }

    .dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
    }

    .docx-dot {
      background: #2563eb;
    }

    .pdf-dot {
      background: #dc2626;
    }
  }
}

.files-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 0.75rem;
  margin-top: 1rem;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
}

.file-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.65rem 0.85rem;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: #fbfcfe;
  gap: 0.75rem;
  transition: all 0.15s ease;

  &:hover {
    border-color: #cbd5e1;
    background: #ffffff;
  }

  &.is-pdf {
    border-color: #fecaca;
    background: #fffafa;
  }

  .file-info {
    display: flex;
    align-items: center;
    gap: 0.65rem;
    min-width: 0;
    flex: 1;

    .file-icon {
      width: 32px;
      height: 28px;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10.5px;
      font-weight: 800;
      letter-spacing: 0.5px;
      flex-shrink: 0;

      &.icon-docx {
        background: #dbeafe;
        color: #1d4ed8;
      }

      &.icon-pdf {
        background: #fee2e2;
        color: #b91c1c;
      }
    }

    .file-name {
      font-size: 13px;
      font-weight: 600;
      color: #334155;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  .format-toggle {
    display: inline-flex;
    background: #f1f5f9;
    border-radius: 6px;
    padding: 2px;
    gap: 2px;
    flex-shrink: 0;

    .toggle-btn {
      border: none;
      background: transparent;
      font-size: 11.5px;
      font-weight: 600;
      color: #64748b;
      padding: 4px 10px;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.15s ease;

      &:hover {
        color: #1e293b;
      }

      &.active {
        background: #2563eb;
        color: #ffffff;
        box-shadow: 0 1px 3px rgba(37, 99, 235, 0.25);
      }

      &.btn-pdf-toggle.active {
        background: #dc2626;
        box-shadow: 0 1px 3px rgba(220, 38, 38, 0.25);
      }
    }
  }
}
</style>
