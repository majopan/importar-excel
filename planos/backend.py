# models.py

from django.db import models

class Posicion(models.Model):
    ESTADOS = [
        ('disponible', 'Disponible'),
        ('ocupado', 'Ocupado'),
        ('reservado', 'Reservado'),
        ('inactivo', 'Inactivo'),
    ]

    id = models.CharField(max_length=50, primary_key=True)
    nombre = models.CharField(max_length=100, blank=True, null=True)
    tipo = models.CharField(max_length=50, blank=True, null=True)
    estado = models.CharField(max_length=50, choices=ESTADOS, default='disponible')
    detalles = models.TextField(blank=True, null=True)
    fila = models.IntegerField()
    columna = models.CharField(max_length=5)
    color = models.CharField(max_length=20, default='#FFFFFF')  # Campo para el color de fondo
    colorFuente = models.CharField(max_length=20, default='#000000')  # Campo para el color de texto
    borde = models.BooleanField(default=True)
    bordeDoble = models.BooleanField(default=False)
    bordeDetalle = models.JSONField(default=dict)  # Detalles de los bordes
    piso = models.CharField(max_length=50)
    sede = models.CharField(max_length=100, blank=True, null=True)
    servicio = models.CharField(max_length=100, blank=True, null=True)
    dispositivos = models.CharField(max_length=100, blank=True, null=True)
    mergedCells = models.JSONField(default=list)  # Celdas combinadas

    def __str__(self):
        return f"{self.nombre} ({self.fila}{self.columna})"
    
    
    
# views.py  
    from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.decorators import api_view
from .models import Posicion
from .serializers import PosicionSerializer

# views.py
from rest_framework import generics, status
from rest_framework.response import Response
from .models import Posicion
from .serializers import PosicionSerializer

# views.py
# views.py
from rest_framework import generics, status
from rest_framework.response import Response
from .models import Posicion
from .serializers import PosicionSerializer

from rest_framework import generics, status
from rest_framework.response import Response
from .models import Posicion
from .serializers import PosicionSerializer

class PosicionListCreateView(generics.ListCreateAPIView):
    queryset = Posicion.objects.all()
    serializer_class = PosicionSerializer

    def create(self, request, *args, **kwargs):
        data = request.data

        # Verificar si ya existe
        if "id" in data and Posicion.objects.filter(id=data["id"]).exists():
            return Response({'error': 'La posición ya existe'}, status=status.HTTP_400_BAD_REQUEST)

        # Si no se proporciona un ID, generarlo automáticamente
        if "id" not in data:
            data["id"] = f"pos_{int(time.time())}"  # Genera un ID único basado en el tiempo

        # Validar y guardar
        serializer = self.get_serializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)





# views.py
class PosicionRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Posicion.objects.all()
    serializer_class = PosicionSerializer
    lookup_field = 'id'

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        print(f"Datos recibidos: {request.data}")  # Agrega este log
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        print(f"Errores de validación: {serializer.errors}")  # Agrega este log
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.delete()
        return Response({"message": "Posición eliminada correctamente"}, status=status.HTTP_204_NO_CONTENT)

@api_view(['GET'])
def get_colores_pisos(request):
    """Devuelve la lista de colores y pisos disponibles."""
    return Response({
        "colores": dict(Posicion.COLORES),
        "pisos": dict(Posicion.PISOS),
    })



from rest_framework import serializers
from .models import Posicion

class PosicionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Posicion
        fields = '__all__'
        extra_kwargs = {
            'id': {'required': False},  # Hace que el campo 'id' sea opcional
        }

    def validate_id(self, value):
        """
        Evita que IDs duplicados causen errores.
        """
        if value and Posicion.objects.filter(id=value).exists():
            raise serializers.ValidationError("Este ID ya existe en la base de datos.")
        return value

    def create(self, validated_data):
        # Si no se proporciona un ID, generarlo automáticamente
        if "id" not in validated_data:
            validated_data["id"] = f"pos_{int(time.time())}"  # Genera un ID único basado en el tiempo
        return super().create(validated_data)



from rest_framework import serializers
from .models import Posicion

class PosicionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Posicion
        fields = '__all__'

    def validate(self, data):
        # Verificar que las celdas combinadas no se superpongan
        merged_cells = data.get('mergedCells', [])
        for cell in merged_cells:
            row = cell['row']
            col = cell['col']
            # Excluir la posición actual si estamos en un contexto de actualización
            queryset = Posicion.objects.filter(mergedCells__contains=[{'row': row, 'col': col}])
            if self.instance:  # Si estamos actualizando, excluir la posición actual
                queryset = queryset.exclude(id=self.instance.id)
            if queryset.exists():
                raise serializers.ValidationError(f"La celda {row}-{col} ya está ocupada.")
        return data


#urls.py

from django.urls import path
from .views import PosicionListCreateView, PosicionRetrieveUpdateDestroyView, get_colores_pisos

urlpatterns = [
    path('posiciones/', PosicionListCreateView.as_view(), name='posicion-list-create'),
    path('posiciones/<str:id>/', PosicionRetrieveUpdateDestroyView.as_view(), name='posicion-retrieve-update-destroy'),
    path('config/', get_colores_pisos, name="config"),
]