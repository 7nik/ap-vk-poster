import svelte from 'rollup-plugin-svelte';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';
import { sveltePreprocess } from 'svelte-preprocess';
import typescript from '@rollup/plugin-typescript';
import styles from "rollup-plugin-styles";

const production = !!process.env.PROD;

function getMetablock () {
	return new Promise((resolve, reject) => {
		require("fs").readFile("src/meta.user.js", "utf8", (err, data) => {
			err ? reject(err) : resolve(data);
		});
	});
}

export default {
	input: 'src/main.ts',
	output: {
		sourcemap: false,
		format: 'iife',
		name: 'calc',
		file: 'build/ap-vk-poster.user.js',
		banner: getMetablock,
	},
	plugins: [
		svelte({
			preprocess: sveltePreprocess(),
			compilerOptions: {
				// enable run-time checks when not in production
				dev: !production
			}
		}),
        styles(),

		resolve({
			browser: true,
			exportConditions: ['svelte', 'browser']
		}),
		commonjs(),
		typescript(),

		// If we're building for production (npm run build
		// instead of npm run dev), minify
		production && terser({
			format: {
				comments: function leaveMetaBlock (node, { value, type }) {
					if (value.trim().startsWith("==UserScript==") && !("inmeta" in leaveMetaBlock)) {
						leaveMetaBlock.inmeta = true;
						return true;
					}
					if (value.trim().startsWith("==/UserScript==") && leaveMetaBlock.inmeta) {
						leaveMetaBlock.inmeta = false;
						return true;
					}
					return leaveMetaBlock.inmeta;
				}
			}
		})
	]
};
