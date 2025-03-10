# Generated by Django 5.1.6 on 2025-02-27 18:38

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('floorplan', '0004_posicion_mergedcells'),
    ]

    operations = [
        migrations.AddField(
            model_name='posicion',
            name='borde',
            field=models.BooleanField(default=False),
        ),
        migrations.AlterField(
            model_name='posicion',
            name='nombre',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
        migrations.AlterField(
            model_name='posicion',
            name='piso',
            field=models.CharField(max_length=50),
        ),
        migrations.AlterField(
            model_name='posicion',
            name='tipo',
            field=models.CharField(blank=True, max_length=50, null=True),
        ),
    ]
