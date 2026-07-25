import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// IMPORTANT: base must match your GitHub repo name for GitHub Pages
// project sites, e.g. if your repo is github.com/you/solo-tracker,
// this should be '/solo-tracker/'. If you rename the repo, update this.
export default defineConfig({
  plugins: [react()],
  base: '/solo-tracker/',
})
