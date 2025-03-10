from rest_framework import serializers
from .models import Posicion

class PosicionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Posicion
        fields = '__all__'

    def validate(self, data):
        # Verificar que las celdas combinadas no se superpongan
        merged_cells = data.get('mergedCells', [])
        instance = self.instance  # Obtener la instancia actual si estamos actualizando
        
        for cell in merged_cells:
            row = cell.get('row')
            col = cell.get('col')
            
            # Consulta para encontrar posiciones que ocupan esta celda
            query = Posicion.objects.filter(
                piso=data.get('piso', instance.piso if instance else None),
                mergedCells__contains=[{'row': row, 'col': col}]
            )
            
            # Si estamos actualizando, excluir la posición actual de la verificación
            if instance:
                query = query.exclude(id=instance.id)
            
            if query.exists():
                raise serializers.ValidationError(f"La celda {row}-{col} ya está ocupada.")
        
        # Validación de fila y columna
        if data.get("fila") is not None and data.get("fila") < 1:
            raise serializers.ValidationError("La fila debe ser un número positivo.")
        
        if data.get("columna") is not None and not data.get("columna").isalpha():
            raise serializers.ValidationError("La columna debe contener solo letras.")

        return data