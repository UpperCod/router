# @atomico/router

[![CircleCI](https://circleci.com/gh/atomicojs/router.svg?style=svg)](https://circleci.com/gh/atomicojs/router)
[![npm](https://badgen.net/npm/v/@atomico/router)](http://npmjs.com/@atomico/router)
[![gzip](https://badgen.net/bundlephobia/minzip/@atomico/router)](https://bundlephobia.com/result?p=@atomico/router)

Pequeño enrutador para la gestión de rutas con Atomico.

```jsx
import { h } from "@atomico/core";
import { lazy } from "@atomico/lazy";
import { Router } from "@atomico/router";

let PageHome = lazy(() => import("./pages/home"));
let PageUsers = lazy(() => import("./pages/users"));
let PageConfig = lazy(() => import("./pages/config"));
let NotFound = () => <h1>404</h1>;

function App() {
	return (
		<Router>
			<PageHome path="/" loading="loading home..." />
			<PageUsers path="/users" loading="loading users..." />
			<PageConfig path="/users" loading="loading config..." />
			<NotFound default />
		</Router>
	);
}
```

## Parametros de ruta

| tipo                | comodin        | ejemplo              |
| ------------------- | -------------- | -------------------- |
| requerido           |                | `/folder/folder`     |
| parametro requerido | `/:folder`     | `/:paramA/:paramB`   |
| parametro opcional  | `/:folder?`    | `/:paramA?/:paramB?` |
| parametro spread    | `/:folders...` | `/:folders...`       |

## hooks

### useMatchRoute

```js
let [inRoute, params] = useMatchRoute("/:id");
```

Compara la ruta actual con el patrón de captura, **Este hooks no se suscribe a history**

### useRoute

```js
let [inRoute, params] = useRoute("/:id");
```

Compara la ruta actual con el patrón de captura, **Este hooks si se suscribe a history**

### useRedirect

Este hook admite un primer parámetro opcional, que modifica su comportamiento.

#### redirect estatico

Este tipo de redirect aplica memo, por lo que el callback solo mutara si el primer parámetro muta.

```jsx
let toHome = useRedirect("/");

<button onClick={toHome}> click </button>;
```

#### redirect dinamico

Este redirect esta pensado para pathname dinámicos.

```jsx
let redirect = useRedirect();

<button onClick={() => redirect("/")}> click </button>;
```

### useHistory

se suscribe al historial del navegador.

```jsx
let [pathname, redirect] = useHistory();
```
