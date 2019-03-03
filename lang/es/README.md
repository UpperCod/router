# @atomico/router

pequeño controlador de rutas

```jsx
import { h, render } from "@atomico/core";
import { Router, Provider } from "@atomico/router";
import { Welcome, Blog, NotFound } from "./pages";


render(
    <Provider>
        <Router>
            <Welcome path="/"/>
            <Blog path="/blog"/>
            <NotFound default/>
        </Router>
    </Provider>
)
```