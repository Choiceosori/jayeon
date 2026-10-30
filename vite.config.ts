import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base './' 덕분에 GitHub Pages 하위 경로나 로컬 파일 어디서든 열 수 있다.
export default defineConfig({
  base: './',
  plugins: [react()],
});
