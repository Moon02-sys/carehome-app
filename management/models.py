from django.db import models
from django.contrib.auth.models import User

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
        ('Hombre', 'Hombre'),
        ('Mujer', 'Mujer'),
    ]
    
    PROVINCE_CHOICES = [
        ('Huesca', 'Huesca'),
        ('Teruel', 'Teruel'),
        ('Zaragoza', 'Zaragoza'),
    ]
    
    ROLE_CHOICES = [
        ('Coordinador', 'Coordinador'),
        ('Enfermero', 'Enfermero'),
    ]
    
    # Relación con usuario de Django
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
    email = models.EmailField(blank=True, verbose_name="Email")
    
    # Datos laborales
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, blank=True, verbose_name="Rol")
    social_security_number = models.CharField(max_length=20, blank=True, verbose_name="NSS")
    account_number = models.CharField(max_length=24, blank=True, verbose_name="Número de cuenta")
    disability_percentage = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True, verbose_name="Minusvalía(%)")
    
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

