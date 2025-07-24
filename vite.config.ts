import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // React相关库分割
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // UI组件库分割
          'ui-vendor': ['@radix-ui/react-accordion', '@radix-ui/react-alert-dialog', '@radix-ui/react-avatar', '@radix-ui/react-checkbox', '@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-label', '@radix-ui/react-popover', '@radix-ui/react-progress', '@radix-ui/react-select', '@radix-ui/react-separator', '@radix-ui/react-switch', '@radix-ui/react-tabs', '@radix-ui/react-toast', '@radix-ui/react-tooltip'],
          // 图表库分割
          'chart-vendor': ['recharts'],
          // 图标库分割
          'icon-vendor': ['lucide-react'],
          // 表单相关分割
          'form-vendor': ['react-hook-form', '@hookform/resolvers', 'zod'],
          // 其他工具库分割
          'utility-vendor': ['date-fns', 'clsx', 'tailwind-merge', 'class-variance-authority', 'cmdk', 'sonner', 'vaul'],
          // 管理员页面分割
          'admin': ['src/pages/admin/AdminDashboard.tsx', 'src/pages/admin/AdminLogin.tsx', 'src/pages/admin/AdminLayout.tsx', 'src/pages/admin/GameManagement.tsx', 'src/pages/admin/CategoryManagement.tsx', 'src/pages/admin/AdManagement.tsx']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
}));
