# Generated by Django 5.1.6 on 2025-03-09 06:25

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('floorplan', '0008_alter_posicion_borde'),
    ]

    operations = [
        migrations.AddField(
            model_name='posicion',
            name='bordeDoble',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='posicion',
            name='colorFuente',
            field=models.CharField(default='#000000', max_length=20),
        ),
    ]
