<template>
  <div class="tuw-logo-wrapper" :class="[`theme-${theme}`, { 'icon-only': !showText }]">
    <!-- OFFICIAL TUW ICON MARK (Option 1: The Legal Quill & Doc Matrix) -->
    <div class="tuw-icon-container" :style="{ width: computedSize + 'px', height: computedSize + 'px' }">
      <svg
        :width="computedSize"
        :height="computedSize"
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        class="logo-svg"
      >
        <defs>
          <linearGradient id="tuw-doc-grad" x1="15" y1="10" x2="85" y2="90" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#1E3A8A" />
            <stop offset="100%" stop-color="#0284C7" />
          </linearGradient>
          <linearGradient id="tuw-fold-grad" x1="58" y1="12" x2="82" y2="36" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#38BDF8" />
            <stop offset="100%" stop-color="#0284C7" />
          </linearGradient>
          <linearGradient id="tuw-quill-grad" x1="30" y1="35" x2="70" y2="85" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#10B981" />
            <stop offset="100%" stop-color="#047857" />
          </linearGradient>
          <filter id="tuw-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#0284C7" flood-opacity="0.35" />
          </filter>
        </defs>

        <!-- Document Body with Folded Top-Right Corner -->
        <path
          d="M22 14C22 10.6863 24.6863 8 28 8H60L82 30V86C82 89.3137 79.3137 92 76 92H28C24.6863 92 22 89.3137 22 86V14Z"
          fill="url(#tuw-doc-grad)"
          filter="url(#tuw-glow)"
        />

        <!-- Folded Corner Sheet -->
        <path
          d="M60 8V24C60 27.3137 62.6863 30 66 30H82L60 8Z"
          fill="url(#tuw-fold-grad)"
          opacity="0.9"
        />

        <!-- Document Grid Lines (Legal Tech Data) -->
        <rect x="32" y="24" width="20" height="3" rx="1.5" fill="#BAE6FD" opacity="0.8" />
        <rect x="32" y="32" width="14" height="3" rx="1.5" fill="#BAE6FD" opacity="0.6" />

        <!-- Stylized "W" & Quill Pen Intersection -->
        <!-- Left stem of W -->
        <path d="M32 46L40 76H46L39 46H32Z" fill="#FFFFFF" />
        <!-- Middle V of W -->
        <path d="M44 56L51 76H56L63 46H57L53.5 65L48 46H42L45 56" fill="#E0F2FE" />
        <!-- Right Quill Pen Nib (Forming right peak of W and pen tip) -->
        <path d="M58 44L68 76H74L79 44H71L68 58L65 44H58Z" fill="url(#tuw-quill-grad)" />
        <!-- Pen Nib slit line and legal seal -->
        <circle cx="68" cy="74" r="3" fill="#34D399" />
        <circle cx="68" cy="74" r="1.5" fill="#FFFFFF" />
      </svg>
    </div>

    <!-- LOGO TYPOGRAPHY -->
    <div v-if="showText" class="tuw-text-container">
      <div class="brand-title">
        <span class="brand-tuw">TUW</span>
        <span class="badge-dot dot-emerald"></span>
      </div>
      <div class="brand-subtitle">{{ subtitle || 'Tool Update Word' }}</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TuwLogo',
  props: {
    size: {
      type: [Number, String],
      default: 36
    },
    showText: {
      type: Boolean,
      default: true
    },
    subtitle: {
      type: String,
      default: 'Tool Update Word'
    },
    theme: {
      type: String,
      default: 'light',
      validator: (v) => ['light', 'dark'].includes(v)
    }
  },
  computed: {
    computedSize() {
      return Number(this.size) || 36
    }
  }
}
</script>

<style scoped>
.tuw-logo-wrapper {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  user-select: none;
  line-height: 1;
}

.tuw-icon-container {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.tuw-logo-wrapper:hover .tuw-icon-container {
  transform: scale(1.05);
}

.logo-svg {
  display: block;
  width: 100%;
  height: 100%;
}

.tuw-text-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: left;
}

.brand-title {
  display: flex;
  align-items: center;
  gap: 5px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  font-weight: 800;
  font-size: 18px;
  letter-spacing: 0.5px;
  color: #0F172A;
}

.theme-dark .brand-title {
  color: #FFFFFF;
}

.brand-subtitle {
  font-size: 10px;
  font-weight: 600;
  color: #64748B;
  letter-spacing: 0.3px;
  margin-top: 2px;
}

.theme-dark .brand-subtitle {
  color: #94A3B8;
}

@media (max-width: 1440px) {
  .brand-subtitle {
    display: none !important;
  }
}

.badge-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  display: inline-block;
}

.dot-emerald {
  background-color: #10B981;
  box-shadow: 0 0 6px rgba(16, 185, 129, 0.6);
}

.icon-only .tuw-text-container {
  display: none;
}
</style>
