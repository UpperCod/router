import {
	h,
	useEffect,
	useState,
	createContext,
	useContext,
	toList,
	useMemo
} from "@atomico/core";

import { match, resolve } from "./parse";

/**
 * Vnode prepare
 * @typedef {Object<string,any>} Props
 **/

/**
 * @typedef {(Function|String)} Type
 */

/**
 * @typedef {{type:Type,props:Props}} Vnode
 **/

/**
 * @typedef {string} MatchPath - route pattern for parameter capture
 * @example
 * //  require
 * "/folder"
 * // param
 * "/:folder"
 * // optional
 * "/:folder?"
 * // rest param
 * "/:folder..."
 **/

/**
 * @typedef {[boolean,Object<string,string>]} MatchReturn
 */

/**
 * redirects the browser
 * @callback Redirect
 * @param {string} pathname
 * @return {void}
 **/

/**
 * @namespace options
 * @property {Function} pathname
 **/
export let options = {
	/**
	 * @return {string} pathname
	 */
	pathname() {
		return location.pathname;
	},
	/**
	 * Dispatch history a new pathname
	 * @type {Redirect}
	 */
	redirect(pathname) {
		if (pathname == options.pathname()) return;
		history.pushState({}, "history", pathname);
		window.dispatchEvent(new PopStateEvent("popstate"));
	},
	setRootDefault(path) {
		RootPath.defaultValue = path;
	}
};

/**@type {{Provider:Function,Consumer:Function}} */
let ParentPath = createContext("/");

let RootPath = createContext("");
/**
 * Crea una suscripcion al evento popstate del navegador
 * @returns {[string,Redirect]}
 */
export function useHistory() {
	let pathname = options.pathname();
	let [state, setState] = useState({ pathname });

	useEffect(() => {
		function handler() {
			let pathname = options.pathname();
			// usa el estado como ref, para comparar el valor actual con el proximo, para asi forzar la update.
			if (state.pathname != pathname) {
				state.pathname = pathname;
				setState(state);
			}
		}
		window.addEventListener("popstate", handler);
		return () => window.removeEventListener("popstate", handler);
	}, []);
	return [pathname, options.redirect];
}
/**
 *
 * @param {MatchPath} path
 * @return {MatchReturn}
 */
export function useMatchRoute(path) {
	let pathname = options.pathname();
	let parentPath = useParentPath();
	// almacena el retorno del match, esto permite evitar update, si en concurrencia los valores no cambian.
	return useMemo(() => [...match(resolve(parentPath, path), pathname)], [
		path,
		pathname,
		parentPath
	]);
}
/**
 * @return {string}
 */
export function useParentPath() {
	let parentPath = useContext(ParentPath);
	let rootPath = useContext(RootPath);
	return resolve(rootPath, parentPath);
}
/**
 * @type {Redirect}
 * @return {Function}
 */
export function useRedirect() {
	let rootPath = useContext(RootPath);
	return useMemo(
		() => path => {
			options.redirect(resolve(rootPath, path));
		},
		[rootPath]
	);
}
/**
 *
 * @param {MatchPath} path
 * @return {MatchReturn}
 */
export function useRoute(path) {
	useHistory();
	return useMatchRoute(path);
}
/**
 *
 * @param {{children:Vnode[]}}
 * @returns {Vnode}
 */
export function Router({ children }) {
	let [inRoute] = useRoute("/:pathname...");
	let pathname = options.pathname();
	let parentPath = useParentPath();

	if (!inRoute) return;

	children = toList(children);

	for (let i = 0; i < children.length; i++) {
		let { type, props } = children[i];
		let { path, ...nextProps } = props;
		let value = resolve(parentPath, path);
		let [inRoute, params] = match(value, pathname);
		if (inRoute) {
			nextProps.params = params;
			return h(ParentPath.Provider, { value }, h(type, nextProps));
		}
	}
}

export function Root({ children, path }) {
	return h(RootPath.Provider, { value: path }, children);
}
