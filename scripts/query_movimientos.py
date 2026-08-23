import sqlite3
import json
import os
p = os.path.join('ProyectoDelta','backend','db.sqlite3')
conn = sqlite3.connect(p)
c = conn.cursor()
q = '''SELECT m.id,m.producto_id,m.tipo_de_movimiento,m.fecha,m.hora,m.cantidad,m.total,p.descripcion,p.sucursal_id
FROM api_movimiento m JOIN api_producto p ON m.producto_id=p.id
ORDER BY m.fecha DESC, m.hora DESC
LIMIT 50;'''
try:
    c.execute(q)
    rows = c.fetchall()
    print('MOVIMIENTOS:')
    print(json.dumps(rows, default=str, ensure_ascii=False, indent=2))

    # Perfiles
    c.execute('SELECT id, user_id, sucursal_id, dni FROM api_perfil')
    perfiles = c.fetchall()
    print('\nPERFILES:')
    print(json.dumps(perfiles, default=str, ensure_ascii=False, indent=2))

    # Usuarios
    c.execute('SELECT id, username, email FROM auth_user')
    users = c.fetchall()
    print('\nUSUARIOS:')
    print(json.dumps(users, default=str, ensure_ascii=False, indent=2))
finally:
    conn.close()
