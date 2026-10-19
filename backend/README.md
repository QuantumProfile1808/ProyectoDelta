# API access

API requests require a valid JWT (`Authorization: JWT <access>`) or DRF token.
Login and token refresh remain available without an access token.

- Staff (`User.is_staff`) manage users, profiles, permissions, promotions and backups.
- `POST /api/descuento/aplicar/` is available to authenticated employees for cart
  pricing using active products in their assigned branch. It does not change stock
  or promotions. Promotion management remains restricted to staff.
- Authenticated employees can read categories and their branch's active products,
  branch details and movements. They can create sales for active products in their
  assigned branch, but cannot edit/delete movements or adjust inventory.
- The server assigns the logged-in user to new movements.
- Staff manage registration, including `/api-auth/users/`. Self-service user
  updates cannot change `is_staff` or `is_superuser`.
- Backup downloads use authenticated requests. Employees do not see backup controls.

For an existing initialized database without a staff account, run
`python manage.py createsuperuser` from this directory. Role decisions use
`User.is_staff`, matching the frontend's protected admin routes.

Cart permission and pricing regression tests (isolated in-memory database):

```sh
python -B manage.py test api.test_cart_pricing --settings=crud.test_settings --noinput
```

These settings bypass the existing broken API migration history and test the
current models; they do not validate migrations or touch the application database.
