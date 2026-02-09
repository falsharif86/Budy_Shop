import adapter from '@sveltejs/adapter-node';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter({
			out: 'build',
			precompress: true
		}),
		version: {
			name: process.env.PUBLIC_BUILD_VERSION || '0.1.0-dev'
		}
	}
};

export default config;
