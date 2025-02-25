import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	server: {
		host: true, // Allows external access
		strictPort: false,
		allowedHosts: ['avaxslap.com'], // Add this to explicitly allow the domain
	}
});
