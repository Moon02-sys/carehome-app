from django.db import models


class PanelChoices(models.TextChoices):
    CENTRO = 'centro', 'Centro'
    DIRECCION = 'direccion', 'Dirección'
    EQUIPO_INTERDISCIPLINAR = 'equipoInterdisciplinar', 'Equipo interdisciplinar'
    INCIDENCIAS_SANITARIAS = 'incidenciasSanitarias', 'Incidencias sanitarias'


class TypeChoices(models.TextChoices):
    ALIMENTACION = 'alimentacion', 'Alimentación'
    CAIDA = 'caida', 'Caída'
    CITA_MEDICA = 'citaMedica', 'Cita médica'
    URGENCIAS = 'urgencias', 'Derivación a urgencias'
    GENERAL = 'general', 'General'
    DIRECCION = 'direccion', 'Dirección'
    MEDICACION = 'medicacion', 'Medicación'
    DEPOSICION = 'deposicion', 'Deposición'
    CUIDADOS = 'cuidados', 'Cuidados'
    SALIDA = 'salida', 'Salida'
