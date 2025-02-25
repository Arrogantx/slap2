import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	server: {
		host: true,
		strictPort: false,
		allowedHosts: ['avaxslap.com'],
	},
	optimizeDeps: {
		include: ['@supabase/supabase-js']
	},
	build: {
		rollupOptions: {
			external: ['@supabase/supabase-js']
		}
	}
});