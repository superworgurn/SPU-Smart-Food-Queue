import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    tailwindcss(),
    svelte()
  ],
  server: {
    host: true, // หรือใช้ '0.0.0.0' เพื่อรับการเชื่อมต่อจากภายนอก/tunnel
    port: 5173,
    allowedHosts: true // อนุญาตทุก host รวมถึง .trycloudflare.com
  }
});