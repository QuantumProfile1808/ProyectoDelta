# Generated by Django 5.2.1 on 2025-07-19 11:48

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0008_producto_is_active'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.RemoveField(
            model_name='movimiento',
            name='fecha',
        ),
        migrations.RemoveField(
            model_name='movimiento',
            name='hora',
        ),
        migrations.RemoveField(
            model_name='movimiento',
            name='metodo_de_pago',
        ),
        migrations.RemoveField(
            model_name='movimiento',
            name='usuario',
        ),
        migrations.AlterField(
            model_name='movimiento',
            name='tipo_de_movimiento',
            field=models.CharField(choices=[('entrada', 'Entrada'), ('salida', 'Salida')], max_length=10),
        ),
        migrations.CreateModel(
            name='Venta',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('metodo_de_pago', models.CharField(choices=[('efectivo', 'Efectivo'), ('debito', 'Débito'), ('credito', 'Crédito'), ('transferencia', 'Transferencia'), ('otro', 'Otro')], max_length=20)),
                ('fecha', models.DateField(auto_now_add=True)),
                ('hora', models.TimeField(auto_now_add=True)),
                ('usuario', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.AddField(
            model_name='movimiento',
            name='venta',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='movimientos', to='api.venta'),
        ),
    ]
