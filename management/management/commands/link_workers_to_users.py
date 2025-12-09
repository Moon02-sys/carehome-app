from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from management.models import Worker


class Command(BaseCommand):
    help = 'Vincula Workers existentes sin usuario a nuevos usuarios de Django'

    def generate_username(self, worker):
        """
        Genera un username único basado en el nombre del trabajador.
        Formato: primera letra del nombre + primer apellido
        Ejemplo: Isabel Sánchez → isanchez
        """
        # Normalizar y limpiar el texto
        first_name = worker.name.lower().strip()
        first_surname = worker.first_surname.lower().strip()
        
        # Remover acentos
        replacements = {
            'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ú': 'u',
            'ñ': 'n', 'ü': 'u'
        }
        for old, new in replacements.items():
            first_surname = first_surname.replace(old, new)
        
        # Remover espacios y caracteres especiales
        first_surname = ''.join(c for c in first_surname if c.isalnum())
        
        # Crear username base: primera letra del nombre + apellido
        base_username = first_name[0] + first_surname
        
        # Verificar si existe y agregar número si es necesario
        username = base_username
        counter = 1
        while User.objects.filter(username=username).exists():
            username = f"{base_username}{counter}"
            counter += 1
        
        return username

    def handle(self, *args, **kwargs):
        # Buscar workers sin usuario vinculado
        workers_without_user = Worker.objects.filter(user__isnull=True)
        
        if not workers_without_user.exists():
            self.stdout.write(self.style.SUCCESS('✓ Todos los workers ya tienen usuario vinculado'))
            return
        
        self.stdout.write(f'\nEncontrados {workers_without_user.count()} workers sin usuario')
        self.stdout.write('Creando usuarios...\n')
        
        created_count = 0
        for worker in workers_without_user:
            try:
                # Generar username único
                username = self.generate_username(worker)
                
                # Verificar si ya tiene usuario vinculado por NIF (usuarios antiguos)
                existing_user = User.objects.filter(username=worker.nif_nie).first()
                if existing_user:
                    self.stdout.write(
                        self.style.WARNING(f'⚠ Usuario existente encontrado: {worker.nif_nie}')
                    )
                    worker.user = existing_user
                    worker.save()
                    continue
                
                # Crear nuevo usuario
                email = getattr(worker, 'email', None) or f"{username}@temp.com"
                user = User.objects.create_user(
                    username=username,
                    email=email,
                    password='Change123',  # Password temporal
                    first_name=worker.name,
                    last_name=f"{worker.first_surname} {worker.second_surname}".strip()
                )
                
                # Vincular worker al usuario
                worker.user = user
                worker.save()
                
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(
                        f'✓ Worker: {worker.get_full_name()} → User: {username}'
                    )
                )
                
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f'✗ Error con {worker.get_full_name()}: {str(e)}')
                )
        
        self.stdout.write(self.style.SUCCESS(f'\n✓ {created_count} usuarios creados y vinculados'))
        self.stdout.write(self.style.WARNING('\n⚠ PASSWORD TEMPORAL: Change123'))
        self.stdout.write('Los trabajadores deben cambiar su contraseña en el primer login\n')
