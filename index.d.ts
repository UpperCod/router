import { lazy } from "./module";

interface Props {
	[index: string]: any;
	loading?: any;
}

interface Callback {
	(props: Props): Promise;
}

interface StateImport {
	loading: boolean;
	default: any;
}

declare module "@atomico/lazy" {
	export function lazy(callback: Callback): object;
	export function useImport(callback: Callback, props: Props): StateImport;
}
