from django.db import models
from django.contrib.auth.models import User, Group
from django.db.models.signals import post_save
from django.dispatch import receiver

# Create your models here.

class Resident(models.Model):
    GENDER_CHOICES = [
        ('M', 'Masculino'),
        ('F', 'Femenino')
    ]
    
    # Datos personales
    name = models.CharField(max_length=100, verbose_name="Nombre")
    first_surname = models.CharField(max_length=100, verbose_name="Primer apellido")
    second_surname = models.CharField(max_length=100, blank=True, verbose_name="Segundo apellido")
    nif_nie = models.CharField(max_length=20, unique=True, verbose_name="NIF/NIE")
    birthdate = models.DateField(verbose_name="Fecha de nacimiento")
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES, verbose_name="Género")
    
    # Datos de contacto
    address = models.CharField(max_length=255, blank=True, verbose_name="Dirección")
    locality = models.CharField(max_length=100, blank=True, verbose_name="Localidad")
    province = models.CharField(max_length=100, blank=True, verbose_name="Provincia")
    country = models.CharField(max_length=100, default="España", verbose_name="País")
    phone = models.CharField(max_length=20, blank=True, verbose_name="Teléfono")
    
    # Datos médicos
    social_security_number = models.CharField(max_length=20, blank=True, verbose_name="Número de Seguridad Social")
    
    # Información médica básica
    BLOOD_TYPE_CHOICES = [
        ('A+', 'A+'), ('A-', 'A-'),
        ('B+', 'B+'), ('B-', 'B-'),
        ('AB+', 'AB+'), ('AB-', 'AB-'),
        ('O+', 'O+'), ('O-', 'O-'),
    ]
    blood_type = models.CharField(max_length=3, choices=BLOOD_TYPE_CHOICES, blank=True, verbose_name="Grupo Sanguíneo")
    allergies = models.TextField(blank=True, verbose_name="Alergias")
    chronic_diseases = models.TextField(blank=True, verbose_name="Enfermedades Crónicas")
    current_medications = models.TextField(blank=True, verbose_name="Medicación Actual")
    
    # Seguro médico
    medical_insurance = models.CharField(max_length=100, blank=True, verbose_name="Seguro Médico")
    insurance_number = models.CharField(max_length=50, blank=True, verbose_name="Número de Póliza")
    primary_doctor = models.CharField(max_length=100, blank=True, verbose_name="Médico de Cabecera")
    doctor_phone = models.CharField(max_length=15, blank=True, verbose_name="Teléfono del Médico")
    
    # Movilidad y dependencia
    MOBILITY_CHOICES = [
        ('autonomo', 'Autónomo'),
        ('ayuda_parcial', 'Ayuda Parcial'),
        ('silla_ruedas', 'Silla de Ruedas'),
        ('encamado', 'Encamado'),
    ]
    mobility_level = models.CharField(max_length=20, choices=MOBILITY_CHOICES, blank=True, verbose_name="Nivel de Movilidad")
    
    DEPENDENCY_CHOICES = [
        ('grado_I', 'Grado I - Dependencia Moderada'),
        ('grado_II', 'Grado II - Dependencia Severa'),
        ('grado_III', 'Grado III - Gran Dependencia'),
    ]
    dependency_degree = models.CharField(max_length=20, choices=DEPENDENCY_CHOICES, blank=True, verbose_name="Grado de Dependencia")
    
    uses_wheelchair = models.BooleanField(default=False, verbose_name="Usa Silla de Ruedas")
    uses_walker = models.BooleanField(default=False, verbose_name="Usa Andador")
    
    # Contacto de emergencia
    emergency_contact_name = models.CharField(max_length=100, blank=True, verbose_name="Nombre Contacto Emergencia")
    emergency_contact_relationship = models.CharField(max_length=50, blank=True, verbose_name="Relación")
    emergency_contact_phone = models.CharField(max_length=15, blank=True, verbose_name="Teléfono Emergencia")
    
    # Configuración de hoja de registro
    enable_food_registry = models.BooleanField(default=True, verbose_name="Habilitar Registro de Alimentación")
    enable_medication_registry = models.BooleanField(default=True, verbose_name="Habilitar Registro de Medicación")
    enable_bowel_registry = models.BooleanField(default=True, verbose_name="Habilitar Registro de Deposición")
    
    # Metadata
    admission_date = models.DateField(auto_now_add=True, verbose_name="Fecha de ingreso")
    is_active = models.BooleanField(default=True, verbose_name="Activo")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Fecha de creación")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Fecha de actualización")
    
    class Meta:
        verbose_name = "Residente"
        verbose_name_plural = "Residentes"
        ordering = ['first_surname', 'second_surname', 'name']
    
    def __str__(self):
        return f"{self.name} {self.first_surname} {self.second_surname}"
    
    def get_full_name(self):
        return f"{self.name} {self.first_surname} {self.second_surname}".strip()
    
    def get_age(self):
        from datetime import date
        today = date.today()
        return today.year - self.birthdate.year - ((today.month, today.day) < (self.birthdate.month, self.birthdate.day))


class Worker(models.Model):
    GENDER_CHOICES = [
        ('H', 'Hombre'),
        ('M', 'Mujer'),
    ]
    
    PROVINCE_CHOICES = [
        ('Huesca', 'Huesca'),
        ('Teruel', 'Teruel'),
        ('Zaragoza', 'Zaragoza'),
    ]
    
    ROLE_CHOICES = [
        ('Director', 'Director'),
        ('Coordinador', 'Coordinador'),
        ('Enfermero', 'Enfermero'),
    ]
    
    SHIFT_CHOICES = [
        ('Mañana', 'Mañana'),
        ('Tarde', 'Tarde'),
        ('Noche', 'Noche'),
    ]
    
    # Relación con usuario de Django (temporalmente nullable para migración)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='worker_profile', null=True, blank=True)
    
    # Datos personales
    name = models.CharField(max_length=100, verbose_name="Nombre")
    first_surname = models.CharField(max_length=100, verbose_name="Primer apellido")
    second_surname = models.CharField(max_length=100, blank=True, verbose_name="Segundo apellido")
    nif_nie = models.CharField(max_length=20, unique=True, verbose_name="NIF/NIE")
    birthdate = models.DateField(verbose_name="Fecha de nacimiento")
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES, blank=True, verbose_name="Género")
    
    # Datos de contacto
    address = models.CharField(max_length=255, blank=True, verbose_name="Dirección")
    locality = models.CharField(max_length=100, blank=True, verbose_name="Localidad")
    province = models.CharField(max_length=100, choices=PROVINCE_CHOICES, blank=True, verbose_name="Provincia")
    country = models.CharField(max_length=100, blank=True, verbose_name="País")
    phone = models.CharField(max_length=20, blank=True, verbose_name="Teléfono")
    
    # Datos laborales
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, blank=True, verbose_name="Rol")
    shift = models.CharField(max_length=20, choices=SHIFT_CHOICES, blank=True, verbose_name="Turno")
    social_security_number = models.CharField(max_length=20, blank=True, verbose_name="NSS")
    account_number = models.CharField(max_length=24, blank=True, verbose_name="Número de cuenta")
    disability_percentage = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True, verbose_name="Minusvalía(%)")
    curriculum = models.FileField(upload_to='workers/curriculum/', blank=True, null=True, verbose_name="Currículum")
    
    # Foto de perfil
    profile_photo = models.ImageField(upload_to='workers/photos/', blank=True, null=True, verbose_name="Foto de perfil")
    
    # Metadata
    hire_date = models.DateField(null=True, blank=True, verbose_name="Fecha de contratación")
    is_active = models.BooleanField(default=True, verbose_name="Activo")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Fecha de creación")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Fecha de actualización")
    
    class Meta:
        verbose_name = "Trabajador"
        verbose_name_plural = "Trabajadores"
        ordering = ['first_surname', 'second_surname', 'name']
    
    def __str__(self):
        return f"{self.name} {self.first_surname} {self.second_surname}"
    
    def get_full_name(self):
        return f"{self.name} {self.first_surname} {self.second_surname}".strip()
    
    def get_age(self):
        from datetime import date
        today = date.today()
        return today.year - self.birthdate.year - ((today.month, today.day) < (self.birthdate.month, self.birthdate.day))
    
    @property
    def email(self):
        """Acceso al email del usuario vinculado"""
        return self.user.email if self.user else ''


# Signal para sincronizar el rol del Worker con los grupos de Django
@receiver(post_save, sender=Worker)
def assign_worker_to_group(sender, instance, created, **kwargs):
    """
    Cuando se guarda un Worker, automáticamente asigna al usuario
    al grupo correspondiente según su rol.
    """
    if instance.user and instance.role:
        # Remover de todos los grupos
        instance.user.groups.clear()
        
        # Agregar al grupo correspondiente al rol
        group, _ = Group.objects.get_or_create(name=instance.role)
        instance.user.groups.add(group)
        
        # Dar acceso al admin solo a Director y Coordinador
        if instance.role in ['Director', 'Coordinador']:
            instance.user.is_staff = True
        else:
            instance.user.is_staff = False
        
        instance.user.save()

