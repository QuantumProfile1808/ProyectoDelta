# BFF and Redux data flow

The BFF lives inside Django in `backend/api/bff.py`. It assembles responses for
screens using the existing models and serializers, so no extra server is needed.
The frontend uses RTK Query (included in Redux Toolkit) to cache those responses.

New code uses English names, for example _resolve_branch_id, catalog, getCatalog,
and useCreateProductMutation. Existing Spanish identifiers such as Producto and
ProductoSerializer are used directly, without translation aliases. Keep existing
API routes, parameters, response fields, and database names unchanged. Use Spanish
in new code when necessary to reference those existing contracts. No database
migration is needed.

| State | Owner |
| --- | --- |
| Signed-in user, initialization, login error | `store/authSlice.js` |
| Catalog, dashboard, lookup lists, discount quotes, request status | `api/bffApi.js` |
| Form inputs, open dialogs, search filters, cart quantities | Local React state |

`AuthContext` is a compatibility wrapper over Redux. It does not hold a second
copy of the user. New code can read `state.auth.user` directly with `useSelector`.

## Endpoints

All BFF endpoints require the existing `Authorization: JWT <access>` header.

| GET endpoint | Response |
| --- | --- |
| `/api/bff/session/` | Current `user` with nested `perfil`, plus `perfil` |
| `/api/bff/catalogo/` | `perfil`, `sucursal`, active `productos`, `categorias` |
| `/api/bff/dashboard/` | `perfil`, `sucursal`, `ultimos`, `ventas_hoy`, `ventas_semana`, `ventas_mes`, `ganancia_mes`, `alertas_stock` |

Staff can omit `?sucursal=<id>` for all branches or supply a branch ID.
Employees are restricted to their assigned branch even when they supply an ID.
Missing employee assignments return 403. Invalid IDs return 400; nonexistent
staff-selected branches return 404. Staff can request `?inactivos=true` on the
catalog. Categories remain a shared lookup list.

Dashboard date ranges use Django's configured timezone (currently UTC), with
Monday as the first day of the week. `ganancia_mes` is the sum of stored sale
totals after discounts.

Products retain precio, descripcion, sucursal, categoria, and medida.
The session retains user.perfil, with sucursal and permiso nested inside it.
Hooks may expose English local names such as products or monthlyRevenue,
while reading the original API fields (productos and ganancia_mes).

## Using the queries

From a component under `src/components`, for example:

```jsx
import { useGetCatalogQuery, useUpdateProductMutation } from "../api/bffApi";
import { getErrorMessage } from "../api/client";

function Catalog({ branchId }) {
  const { currentData, isLoading, isFetching, error, refetch } =
    useGetCatalogQuery({ sucursal: branchId });
  const [updateProduct, { isLoading: saving, error: saveError }] =
    useUpdateProductMutation();

  if (isLoading || (isFetching && !currentData)) return <p>Loading...</p>;
  if (error) return <button onClick={refetch}>{getErrorMessage(error)}</button>;

  return <>
    {saveError && <p role="alert">{getErrorMessage(saveError)}</p>}
    {currentData?.productos.map((product) => (
      <button key={product.id} disabled={saving} onClick={async () => {
        try {
          await updateProduct({ id: product.id, is_active: false }).unwrap();
        } catch {
          // saveError renders the server's validation message.
        }
      }}>{product.descripcion}</button>
    ))}
  </>;
}
```

Do not copy query results into a second slice or `useState`, and do not fetch
them inside an effect. Query arguments identify cache entries; consumers with
the same arguments share a request. `currentData` avoids displaying a previous
branch's products while the next branch loads. Use `skip: !user` for queries in
components that can remain mounted outside an authenticated route.

Mutations continue to use the existing CRUD endpoints. Product and movement
writes invalidate catalog, discount quotes, and dashboard data; category writes
invalidate category lists and catalogs; branch writes invalidate branch lists.
Backup imports invalidate all these reads. Subscribed queries refresh
automatically, and focus/reconnect events also trigger refreshes. Manual refresh
buttons call `refetch()` instead of reloading the page. This follows RTK Query's
[tag invalidation model](https://redux-toolkit.js.org/rtk-query/usage/automated-refetching).

## Authentication and errors

`api/client.js` owns the base URL, JWT headers, response parsing, and refresh.
Set `VITE_API_BASE_URL` to override `http://127.0.0.1:8000`. JSON validation details
are preserved and exposed through `getErrorMessage`. Multipart bodies keep their
browser-generated content type. Concurrent expired requests share one refresh,
retry once, and honor refresh-token rotation. Transient failures do not erase
credentials. Logout clears local credentials immediately; stale login/refresh
responses cannot restore the session. Redux caches are cleared on login, logout,
and session expiration.

Tokens retain the project's existing localStorage storage. This is a Django
aggregation BFF, not a cookie-based token-hiding proxy.

## Migrated flows and remaining work

Dashboard, employee catalog, product administration, category/branch creation,
discount quotes, sale submissions, and backup imports use the shared API layer.
The old catalog/dashboard hooks are thin adapters for existing callers.
Discount failures now block checkout and offer retry instead of silently selling
at an undiscounted price.

User management, promotion editing/listing, finance, and history still contain
legacy fetching. Migrate each by adding query/mutation endpoints to this same API
slice and attaching the appropriate invalidation tags. Legacy writes bypassing
RTK Query cannot invalidate its cache; focus/reconnect refresh provides a fallback.

The branch checks described above apply to BFF reads. Existing CRUD viewsets and
backup endpoints retain their existing permission policies and need a separate
authorization review; these BFF changes do not secure all backend routes.

Checkout still submits one existing movement request per line. Confirmed lines
are removed from the cart after partial failure, and successful writes refresh
stock. This is not an atomic or idempotent checkout: an ambiguous network failure
still requires checking history before retrying. A transactional checkout endpoint
is a separate backend improvement.

## Verification

```text
cd frontend
npm run build

cd ../backend
python manage.py check
```

The existing migration chain cannot replay from scratch: `api/0002` deletes a
`Usuario` model absent from `0001`. The repository-wide ESLint check also has existing errors
in `Usuarios.jsx`, `promociones.jsx`, and `vite.config.js`.
