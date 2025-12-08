from django.db import models
from django.contrib.auth.models import User
from management.models import Resident

# Create your models here.

class MedicationRegistry(models.Model):
    """Registro de administración de medicación"""
    resident = models.ForeignKey(Resident, on_delete=models.CASCADE, related_name='medication_registries', verbose_name="Residente")
    date = models.DateField(verbose_name="Fecha")
    time = models.TimeField(verbose_name="Hora")
    medication_name = models.CharField(max_length=200, verbose_name="Nombre del medicamento")
    dosage = models.CharField(max_length=100, verbose_name="Dosis")
    route = models.CharField(max_length=50, blank=True, verbose_name="Vía de administración")  # Oral, Intravenosa, etc.
    notes = models.TextField(blank=True, verbose_name="Observaciones")
    administered_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Administrado por")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Fecha de creación")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Fecha de actualización")
    
    class Meta:
        verbose_name = "Registro de Medicación"
        verbose_name_plural = "Registros de Medicación"
        ordering = ['-date', '-time']
    
    def __str__(self):
        return f"{self.resident.get_full_name()} - {self.medication_name} - {self.date} {self.time}"


class FoodRegistry(models.Model):
    """Registro de alimentación"""
    SOLID_INTAKE_CHOICES = [
        ('nada', 'Nada'),
        ('poco', 'Poco (25%)'),
        ('medio', 'Medio (50%)'),
        ('bastante', 'Bastante (75%)'),
        ('todo', 'Todo (100%)'),
    ]
    
    LIQUID_INTAKE_CHOICES = [
        ('desayuno', 'Desayuno'),
        ('comida', 'Comida'),
        ('merienda', 'Merienda'),
        ('cena', 'Cena'),
    ]
    
    resident = models.ForeignKey(Resident, on_delete=models.CASCADE, related_name='food_registries', verbose_name="Residente")
    date = models.DateField(verbose_name="Fecha")
    time = models.TimeField(verbose_name="Hora")
    solid_intake = models.CharField(max_length=20, choices=SOLID_INTAKE_CHOICES, blank=True, verbose_name="Ingesta de sólidos")
    first_course = models.CharField(max_length=200, blank=True, verbose_name="Primer plato")
    second_course = models.CharField(max_length=200, blank=True, verbose_name="Segundo plato")
    dessert = models.CharField(max_length=200, blank=True, verbose_name="Postre")
    liquid_intake = models.CharField(max_length=20, choices=LIQUID_INTAKE_CHOICES, blank=True, verbose_name="Ingesta de líquidos")
    quantity = models.CharField(max_length=100, blank=True, verbose_name="Cantidad")
    notes = models.TextField(blank=True, verbose_name="Observaciones")
    registered_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Registrado por")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Fecha de creación")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Fecha de actualización")
    
    class Meta:
        verbose_name = "Registro de Alimentación"
        verbose_name_plural = "Registros de Alimentación"
        ordering = ['-date', '-time']
    
    def __str__(self):
        return f"{self.resident.get_full_name()} - {self.date} {self.time}"


class BowelMovementRegistry(models.Model):
    """Registro de deposición"""
    TYPE_CHOICES = [
        ('normal', 'Normal'),
        ('diarrea', 'Diarrea'),
        ('estreñimiento', 'Estreñimiento'),
        ('sangre', 'Con sangre'),
    ]
    
    CONSISTENCY_CHOICES = [
        ('tipo1', 'Tipo 1 - Trozos duros separados'),
        ('tipo2', 'Tipo 2 - Con forma de salchicha grumosa'),
        ('tipo3', 'Tipo 3 - Con forma de salchicha con grietas'),
        ('tipo4', 'Tipo 4 - Con forma de salchicha lisa'),
        ('tipo5', 'Tipo 5 - Trozos blandos con bordes definidos'),
        ('tipo6', 'Tipo 6 - Trozos blandos con bordes irregulares'),
        ('tipo7', 'Tipo 7 - Líquida sin trozos'),
    ]
    
    COLOR_CHOICES = [
        ('marron', 'Marrón'),
        ('verde', 'Verde'),
        ('amarillo', 'Amarillo'),
        ('negro', 'Negro'),
        ('rojo', 'Rojo'),
    ]
    
    resident = models.ForeignKey(Resident, on_delete=models.CASCADE, related_name='bowel_registries', verbose_name="Residente")
    date = models.DateField(verbose_name="Fecha")
    time = models.TimeField(verbose_name="Hora")
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, verbose_name="Tipo de deposición")
    consistency = models.CharField(max_length=20, choices=CONSISTENCY_CHOICES, blank=True, verbose_name="Consistencia")
    color = models.CharField(max_length=20, choices=COLOR_CHOICES, blank=True, verbose_name="Color")
    quantity = models.CharField(max_length=50, blank=True, verbose_name="Cantidad")
    notes = models.TextField(blank=True, verbose_name="Observaciones")
    registered_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Registrado por")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Fecha de creación")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Fecha de actualización")
    
    class Meta:
        verbose_name = "Registro de Deposición"
        verbose_name_plural = "Registros de Deposición"
        ordering = ['-date', '-time']
    
    def __str__(self):
        return f"{self.resident.get_full_name()} - {self.type} - {self.date} {self.time}"


class Annotation(models.Model):
    """Anotaciones desde los registros"""
    PANEL_CHOICES = [
        ('sanitario', 'Sanitario'),
        ('general', 'General'),
        ('incidencia', 'Incidencia'),
    ]
    
    STATUS_CHOICES = [
        ('abierto', 'Abierto'),
        ('cerrado', 'Cerrado'),
    ]
    
    TYPE_CHOICES = [
        ('alimentacion', 'Alimentación'),
        ('medicacion', 'Medicación'),
        ('deposicion', 'Deposición'),
        ('caida', 'Caída'),
    ]
    
    resident = models.ForeignKey(Resident, on_delete=models.CASCADE, related_name='annotations', verbose_name="Residente")
    panel = models.CharField(max_length=20, choices=PANEL_CHOICES, verbose_name="Panel")
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, verbose_name="Tipo")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='abierto', verbose_name="Estado")
    form_data = models.JSONField(blank=True, null=True, verbose_name="Datos del formulario")
    notes = models.TextField(blank=True, verbose_name="Notas adicionales")
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Creado por")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Fecha de creación")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Fecha de actualización")
    
    class Meta:
        verbose_name = "Anotación"
        verbose_name_plural = "Anotaciones"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.resident.get_full_name()} - {self.type} - {self.created_at.strftime('%Y-%m-%d %H:%M')}"
