from django.core.management.base import BaseCommand
from django.contrib.auth.models import Group, Permission
from django.contrib.contenttypes.models import ContentType
from management.models import Worker, Resident


class Command(BaseCommand):
    help = 'Configura los grupos y permisos para el sistema'

    def handle(self, *args, **kwargs):
        # Crear o obtener grupos
        director_group, _ = Group.objects.get_or_create(name='Director')
        coordinador_group, _ = Group.objects.get_or_create(name='Coordinador')
        enfermero_group, _ = Group.objects.get_or_create(name='Enfermero')
        
        # Limpiar permisos existentes
        director_group.permissions.clear()
        coordinador_group.permissions.clear()
        enfermero_group.permissions.clear()
        
        # Obtener ContentTypes
        worker_ct = ContentType.objects.get_for_model(Worker)
        resident_ct = ContentType.objects.get_for_model(Resident)
        
        # ========== PERMISOS DIRECTOR (Acceso total a todo) ==========
        director_permissions = []
        
        # Trabajadores - todos los permisos
        director_permissions.extend(Permission.objects.filter(content_type=worker_ct))
        
        # Residentes - todos los permisos
        director_permissions.extend(Permission.objects.filter(content_type=resident_ct))
        
        # Asignar permisos al director
        for perm in director_permissions:
            director_group.permissions.add(perm)
        
        self.stdout.write(self.style.SUCCESS(f'✓ Director: {len(director_permissions)} permisos asignados'))
        
        # ========== PERMISOS COORDINADOR (Acceso total) ==========
        coordinador_permissions = []
        
        # Trabajadores - todos los permisos
        coordinador_permissions.extend(Permission.objects.filter(content_type=worker_ct))
        
        # Residentes - todos los permisos
        coordinador_permissions.extend(Permission.objects.filter(content_type=resident_ct))
        
        # Asignar permisos al coordinador
        for perm in coordinador_permissions:
            coordinador_group.permissions.add(perm)
        
        self.stdout.write(self.style.SUCCESS(f'✓ Coordinador: {len(coordinador_permissions)} permisos asignados'))
        
        # ========== PERMISOS ENFERMERO (Solo lectura y edición de residentes) ==========
        enfermero_permissions = []
        
        # Residentes - ver, agregar y cambiar (NO eliminar)
        enfermero_permissions.append(Permission.objects.get(codename='view_resident', content_type=resident_ct))
        enfermero_permissions.append(Permission.objects.get(codename='add_resident', content_type=resident_ct))
        enfermero_permissions.append(Permission.objects.get(codename='change_resident', content_type=resident_ct))
        
        # Trabajadores - solo ver (NO puede agregar, editar ni eliminar)
        enfermero_permissions.append(Permission.objects.get(codename='view_worker', content_type=worker_ct))
        
        # Asignar permisos al enfermero
        for perm in enfermero_permissions:
            enfermero_group.permissions.add(perm)
        
        self.stdout.write(self.style.SUCCESS(f'✓ Enfermero: {len(enfermero_permissions)} permisos asignados'))
        
        # Resumen
        self.stdout.write(self.style.SUCCESS('\n=== RESUMEN DE PERMISOS ==='))
        self.stdout.write(self.style.SUCCESS('\nDIRECTOR:'))
        self.stdout.write('  - Trabajadores: Ver, Añadir, Editar, Eliminar')
        self.stdout.write('  - Residentes: Ver, Añadir, Editar, Eliminar')
        
        self.stdout.write(self.style.SUCCESS('\nCOORDINADOR:'))
        self.stdout.write('  - Trabajadores: Ver, Añadir, Editar, Eliminar')
        self.stdout.write('  - Residentes: Ver, Añadir, Editar, Eliminar')
        
        self.stdout.write(self.style.SUCCESS('\nENFERMERO:'))
        self.stdout.write('  - Trabajadores: Solo Ver')
        self.stdout.write('  - Residentes: Ver, Añadir, Editar (NO Eliminar)')
        
        self.stdout.write(self.style.SUCCESS('\n✓ Grupos y permisos configurados correctamente'))
