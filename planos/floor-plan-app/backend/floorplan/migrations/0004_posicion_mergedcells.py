# Generated by Django 5.1.6 on 2025-02-26 20:15

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('floorplan', '0003_alter_posicion_color'),
    ]

    operations = [
        migrations.AddField(
            model_name='posicion',
            name='mergedCells',
            field=models.JSONField(default=list),
        ),
    ]
