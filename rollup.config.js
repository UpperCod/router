import pkg from "./package.json";
export default {
	input: pkg.source,
	output: [
		{
			file: pkg.module,
			format: "es",
			sourcemap: true
		}
	]
};
