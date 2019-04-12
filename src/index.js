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
	}
};

/**@type {{Provider:Function,Consumer:Function}} */
let Root = createContext("/");

/**
 * Crea una suscripcion al evento popstate del navegador
 * @returns {[string,Redirect]}
 */
export function useHistory() {
	let setState = useState()[1];

	useEffect(() => {
		window.addEventListener("popstate", setState);
		return () => window.removeEventListener("popstate", setState);
	}, []);
	return [options.pathname(), options.redirect];
}
/**
 * @type {Redirect}
 * @return {Function}
 */
export function useRedirect(pathname) {
	return options.redirect;
}

export function useRoute(path) {
	let [pathname] = useHistory();
	let rootPath = useContext(Root);
	return [...match(resolve(rootPath, path), pathname), pathname];
}
/**
 *
 * @param {{children:Vnode[]}}
 * @returns {Vnode}
 */
export function Router({ children }) {
	let [rootInRoute] = useRoute("/:pathname...");
	let pathname = options.pathname();
	let rootPath = useContext(Root);

	if (!rootInRoute) return;

	children = toList(children);

	for (let i = 0; i < children.length; i++) {
		let { type, props } = children[i];
		let { path, ...nextProps } = props;
		let value = resolve(rootPath, path);
		let [inRoute, params] = match(value, pathname);
		if (inRoute) {
			nextProps.params = params;
			return h(Root.Provider, { value }, h(type, nextProps));
		}
	}
}
