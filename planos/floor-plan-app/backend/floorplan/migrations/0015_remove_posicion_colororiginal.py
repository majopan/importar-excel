# Generated by Django 5.1.6 on 2025-03-10 01:59

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('floorplan', '0014_posicion_colororiginal'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='posicion',
            name='colorOriginal',
        ),
    ]
