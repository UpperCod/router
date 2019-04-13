import {
	h,
	useEffect,
	useState,
	createContext,
	useContext,
	toList
} from "@atomico/core";

import { match, resolve } from "./parse";

/**
 * Vnode prepare
 * @typedef {Object<string,any>} Props
 *
 * @typedef {(Function|String)} Type
 *
 * @typedef {{type:Type,props:Props}} Vnode
 *
 * redirects the browser
 * @callback Redirect
 * @param {string} pathname
 * @return {void}
 */

/**
 * @namespace options
 * @property {Function} pathname
 */
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
			if (state.pathname != pathname) {
				state.pathname = pathname;
				setState(state);
			}
		}
		window.addEventListener("popstate", handler);
		return () => window.removeEventListener("popstate", handler);
	}, []);
	return [options.pathname(), options.redirect];
}

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
	return path => {
		options.redirect(resolve(rootPath, path));
	};
}

export function useRoute(path) {
	let [pathname] = useHistory();
	let parentPath = useParentPath();

	return [...match(resolve(parentPath, path), pathname), pathname];
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
