# @atomico/router

[![npm](https://badgen.net/npm/v/@atomico/router)](http://npmjs.com/@atomico/router)
[![gzip](https://badgen.net/bundlephobia/minzip/@atomico/router)](https://bundlephobia.com/result?p=@atomico/router)

small route controller

```jsx
import { h, render } from "@atomico/core";
import { Router } from "@atomico/router";
import { Welcome, Blog, NotFound } from "./pages";

render(
	<Router>
		<Welcome path="/" />
		<Blog path="/blog" />
		<NotFound default />
	</Router>
);
```

## useRoute

allows you to hear the status of a specific route.

```jsx
import { useRoute } from "@atomico/router";

function Component() {
	let [inRoute, params] = useRouter("/");
}
```

- `/id` : fix route
- `/:id` : param
- `/:id?` : optional param
- `/:id...` : param rest

## useRedirect

retorna un callback de redirección

```jsx
import { useRedirect } from "@atomico/router";

function Component() {
	let redirect = useRedirect();
	redirect("/");
	redirect("/users");
}
```

## Router

selecciona de los hijos la ruta que concuerda con el patrón.

```jsx
import { h, render } from "@atomico/core";
import { Router } from "@atomico/router";
import { Welcome, Blog, NotFound } from "./pages";

render(
	<Router>
		<Welcome path="/" />
		<Blog path="/blog" />
		<NotFound default />
	</Router>
);
```

# Todo

- [ ] Basic test
- [ ] Add examples
