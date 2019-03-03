import {
    h,
    createContext,
    useContext,
    useEffect,
    useState,
    useMemo,
    useRef
} from "@atomico/core";

import { match, join } from "./parse";

let ContextProvider = createContext(),
    emptyParams = {},
    ContextRootPath = createContext("/");

export function createHistory(location = "/", server) {
    let subscribers = [];
    function redirect(path, pushHistory = true) {
        this.location = path;
        subscribers.forEach(handler => handler(path));
        if (server) return;
    }

    function listener() {
        if (server) return;
        function handler() {
            redirect(location.pathname, false);
        }
        window.addEventListener("popstate", handler);
        return function unlistener() {
            window.removeEventListener("popstate", handler);
        };
    }
    function subscribe(handler) {
        subscribers.push(handler);
        return function unsubscribe() {
            subscribers.splice(subscribers.indexOf(handler) >>> 0, 1);
        };
    }
    return { redirect, listener, subscribe, location };
}
/**
 *@example useRoute("/folder");
 */
export function useRoute(path) {
    let history = useContext(ContextProvider),
        rootPath = useContext(ContextRootPath),
        [state, setLocation] = useState({ location: history.location });

    useEffect(() => {
        return history.subscribe(location => {
            if (location !== state.location) {
                state.location = location;
                setLocation(state);
            }
        });
    }, [history]);

    return useMemo(() => match(join(rootPath, path), state.location), [
        rootPath,
        path,
        state.location
    ]);
}

export function useRedirect(pathname) {
    let history = useContext(ContextProvider),
        rootPath = useContext(ContextRootPath);

    return () => {
        history.redirect(join(rootPath, pathname));
    };
}

export function Route({ path, children }) {
    let [inRoute, params] = useRoute(path),
        ref = useRef();
    if (inRoute) {
        let res;
        if (ref.params !== params) {
            res = ref.state = children[0](params);
        } else {
            res = ref.state;
        }
        ref.params = params;
        return res;
    }
    return "";
}

export function Router({ children }) {
    let [inRoute, rootParams] = useRoute("/:any..."),
        nextChild,
        nextParams = emptyParams;
    for (let i = 0; i < children.length; i++) {
        let child = children[i],
            props = child.props;
        if (props.default) {
            nextChild = child;
            continue;
        } else {
            let [inRoute, params] = match(props.path, rootParams.any);
            if (inRoute) {
                nextChild = child;
                nextParams = params;
            }
        }
    }
    if (nextChild) {
        let props = { ...nextChild.props };
        delete props.path;
        delete props.default;
        return h(
            nextChild.tag,
            { ...props, params: nextParams },
            nextChild.children
        );
    }
}

export function Provider({ location, children, path, server }) {
    let [history] = useState(() => {
        return createHistory(location, server);
    });

    useEffect(() => history.listener(), []);

    return (
        <ContextProvider.Provider value={history}>
            <ContextRootPath.Provider value={path || "/"}>
                {children}
            </ContextRootPath.Provider>
        </ContextProvider.Provider>
    );
}
