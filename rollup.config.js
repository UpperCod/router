import pkg from "./package.json";
import buble from "rollup-plugin-buble";
import { terser } from "rollup-plugin-terser";
import size from "rollup-plugin-bundle-size";
let plugins = [buble(), terser(), size()];

export default {
	input: pkg.source,
	output: [
		{
			file: pkg.main,
			sourcemap: true,
			format: "cjs"
		},
		{
			file: pkg.unpkg,
			sourcemap: true,
			format: "umd",
			name: pkg.name,
			globals: {
				"@atomico/core": "@atomico/core"
			}
		},
		{
			file: pkg.module,
			sourcemap: true,
			format: "es"
		}
	],
	plugins
};
