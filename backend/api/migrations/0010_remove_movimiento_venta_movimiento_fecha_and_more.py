# Generated by Django 5.2.1 on 2025-07-21 12:28

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0009_remove_movimiento_fecha_remove_movimiento_hora_and_more'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.RemoveField(
            model_name='movimiento',
            name='venta',
        ),
        migrations.AddField(
            model_name='movimiento',
            name='fecha',
            field=models.DateField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='movimiento',
            name='hora',
            field=models.TimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='movimiento',
            name='metodo_de_pago',
            field=models.CharField(blank=True, choices=[('efectivo', 'Efectivo'), ('debito', 'Débito'), ('credito', 'Crédito'), ('transferencia', 'Transferencia'), ('otro', 'Otro')], max_length=20, null=True),
        ),
        migrations.AddField(
            model_name='movimiento',
            name='usuario',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL),
        ),
        migrations.AlterField(
            model_name='movimiento',
            name='tipo_de_movimiento',
            field=models.CharField(blank=True, choices=[('entrada', 'Entrada'), ('salida', 'Salida')], max_length=10, null=True),
        ),
        migrations.DeleteModel(
            name='Venta',
        ),
    ]
