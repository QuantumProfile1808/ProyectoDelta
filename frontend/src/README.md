# Frontend structure

- `components/`: UI shared across screens, such as Button, Modal, Header, and ProtectedRoute.
- `page/views/admin/`: admin screens, each in its own folder.
- `page/views/auth/` and `page/views/noadmin/`: authentication and employee screens using the same folder structure.
- `page/hooks/`: existing shared hooks.
- `styles/`: CSS used by multiple screens, including tables and forms.
- `index.css`: global styles and design variables. Use px for new size variables.

Each screen has its JSX, a CSS file, and an `index.js` that re-exports the component:

```text
page/views/admin/Products/
  Products.jsx
  Products.css
  index.js
  components/
    CreateCategory/
    CreateBranch/
```

Import the folder entry point:

```jsx
import Products from "./page/views/admin/Products";
import Button from "./components/Button";
```

Keep components used by one screen inside that screen's `components/` folder.
Move components shared by multiple screens to `src/components/`.
Import shared CSS at the top of a screen's CSS file, before any style rules.
Screen-specific CSS can then extend those shared styles without copying them.

Button accepts native button props, including `disabled`, `onClick`, and `className`.
It defaults to `type="button"`; use `type="submit"` for form submission.

Use English for file names, components, hooks, variables, CSS classes, and comments.
Keep visible labels, messages, and accessibility text in Spanish.
Backend field names, enum values, form payload keys, and existing route URLs retain
their original names to preserve the API contract and existing links.
