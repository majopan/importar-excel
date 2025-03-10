from django.db import models
import uuid

class Posicion(models.Model):
    ESTADOS = [
        ('disponible', 'Disponible'),
        ('ocupado', 'Ocupado'),
        ('reservado', 'Reservado'),
        ('inactivo', 'Inactivo'),
    ]

    # Generar automáticamente un ID único usando UUID
    id = models.CharField(max_length=50, primary_key=True, default=uuid.uuid4)

    nombre = models.CharField(max_length=100, blank=True, null=True)
    tipo = models.CharField(max_length=50, blank=True, null=True)
    estado = models.CharField(max_length=50, choices=ESTADOS, default='disponible')
    detalles = models.TextField(blank=True, null=True)
    fila = models.IntegerField()
    columna = models.CharField(max_length=5)
    color = models.CharField(max_length=20, default='#FFFFFF')
    colorFuente = models.CharField(max_length=20, default='#000000')
    colorOriginal = models.CharField(max_length=50, blank=True, null=True)  # Aumenté la longitud a 50    borde = models.BooleanField(default=True)
    bordeDoble = models.BooleanField(default=False)
    bordeDetalle = models.JSONField(default=dict)
    piso = models.CharField(max_length=50)
    sede = models.CharField(max_length=100, blank=True, null=True)
    servicio = models.CharField(max_length=100, blank=True, null=True)
    dispositivos = models.CharField(max_length=100, blank=True, null=True)
    mergedCells = models.JSONField(default=list)

    def __str__(self):
        return f"{self.nombre} ({self.fila}{self.columna})"

    def clean(self):
        """
        Validaciones adicionales antes de guardar el modelo.
        """
        # Validar que la fila sea un número positivo
        if self.fila < 1:
            raise ValueError("La fila debe ser un número positivo.")

        # Validar que la columna sea una letra o combinación de letras válida
        if not self.columna.isalpha():
            raise ValueError("La columna debe contener solo letras.")

    def save(self, *args, **kwargs):
        """
        Sobrescribir el método save para incluir validaciones.
        """
        self.clean()  # Ejecutar validaciones antes de guardar
        super().save(*args, **kwargs)