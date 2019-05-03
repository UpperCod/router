import pkg from "./package.json";
import size from "rollup-plugin-bundle-size";
let plugins = [size()];

export default {
	input: pkg.source,
	output: [
		{
			file: pkg.module,
			format: "es"
		}
	],
	plugins
};
