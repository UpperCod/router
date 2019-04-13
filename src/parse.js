let FOLDERS = /([^\/]+)/g;
let FOLDER = "[^\\/]";
let SPLIT = "(?:\\/){0,1}";
let RELATIVE = /(\/[^\/]+)\/(\.\.|\.)/;
let PARAM = /(:)(\w+)(\?|(\.){3}){0,1}/;
let PARAMS_EMPTY = {};
let MEMO = {};

export function format(path) {
	return path.replace(/([^\/])+\/$/, "$1");
}

export function parse(string) {
	let folders = string.match(FOLDERS) || [""],
		params = [],
		regexp = new RegExp(
			"^" +
				folders
					.map(folder => {
						let [string, param, field, type] = folder.match(PARAM) || [];
						if (param) {
							params.push(field);
							if (type === "...") {
								return `(.*)`;
							} else if (type === "?") {
								return `${SPLIT}(${FOLDER}*)`;
							} else {
								return `\\/(${FOLDER}+)`;
							}
						} else {
							return `\\/(?:${folder
								.replace(/\./g, "\\.")
								.replace(/\*/g, FOLDER + "+")
								.replace(/\((?!\?\:)/g, "(?:")})`;
						}
					})
					.join("") +
				"$",
			"i"
		);

	return { regexp, params, logs: {} };
}
/**
 * permite comparar un patron de captura vs un ruta de entrada
 * @param {string} path - ruta de patron de captura
 * @param {string} value  - ruta de comparacion a patron
 * @return {array} - [ inRoute:boolean, params:object ];
 */
export function match(path, value) {
	path = format(path);
	value = format(value);
	if (!MEMO[path]) {
		MEMO[path] = parse(path);
	}
	let { regexp, params, logs } = MEMO[path];
	if (logs[value]) {
		return logs[value];
	}
	let vs = value.match(regexp);
	return (logs[value] = [
		vs ? true : false,
		vs
			? vs.slice(1).reduce((next, value, index) => {
					next[params[index] || index] = value;
					return next;
			  }, {})
			: PARAMS_EMPTY
	]);
}

export function relative(string) {
	while (RELATIVE.test(string)) {
		string = string.replace(RELATIVE, (all, previus, dot) =>
			dot.length === 2 ? "" : previus
		);
	}
	return string || "/";
}
/**
 * Permite unificar 2 rutas
 * @param {*} a
 * @param {*} b
 */
export function resolve(a = "", b = "") {
	return a.replace(/\/(:[\w]+...){0,1}$/, "") + "/" + b.replace(/^\//, "");
}
