from django.db import models
from management.models import Resident, Worker

# Create your models here.

class Fall(models.Model):
    PLACE_CHOICES = [
        ('habitacion', 'Habitación'),
        ('baño', 'Baño'),
        ('comedor', 'Comedor'),
        ('pasillo', 'Pasillo'),
        ('jardin', 'Jardín'),
        ('otro', 'Otro'),
    ]
    
    # Datos básicos
    resident = models.ForeignKey(Resident, on_delete=models.CASCADE, related_name='falls', verbose_name="Residente")
    date = models.DateField(verbose_name="Fecha")
    time = models.TimeField(auto_now_add=True, verbose_name="Hora")
    
    # Detalles de la caída
    place = models.CharField(max_length=50, choices=PLACE_CHOICES, verbose_name="Lugar")
    cause = models.TextField(blank=True, verbose_name="Causa")
    consequences = models.TextField(blank=True, verbose_name="Consecuencias")
    observations = models.TextField(blank=True, verbose_name="Observaciones")
    
    # Información adicional
    family_informed = models.CharField(max_length=200, blank=True, verbose_name="Familiar informado")
    registered_by = models.ForeignKey(Worker, on_delete=models.SET_NULL, null=True, blank=True, related_name='registered_falls', verbose_name="Registrado por")
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Fecha de creación")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Fecha de actualización")
    
    class Meta:
        verbose_name = "Caída"
        verbose_name_plural = "Caídas"
        ordering = ['-date', '-time']
    
    def __str__(self):
        return f"Caída de {self.resident.get_full_name()} - {self.date}"
