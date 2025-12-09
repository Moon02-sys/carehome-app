from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from resources.strings import content as STRINGS
from .models import Resident, Worker
from registry.models import FoodRegistry, MedicationRegistry, BowelMovementRegistry
from .forms import ResidentForm, WorkerForm
from .permissions import has_permission
import json

def management_dashboard(request):
    return render(request, 'management/dashboard.html')

def workers_list(request):
    workers = Worker.objects.filter(is_active=True).order_by('first_surname', 'name')
    context = {
        'workers': workers,
        'STRINGS': STRINGS
    }
    return render(request, 'workers/worker-list.html', context)

@login_required
@has_permission('management.add_worker')
@require_http_methods(["POST"])
def add_worker(request):
    try:
        # Obtener datos del formulario
        nif_nie = request.POST.get('nif_nie')
        name = request.POST.get('name', '').strip().lower()
        first_surname = request.POST.get('first_surname', '').strip().lower()
        email = request.POST.get('email', '')
        
        # Generar username único: primera letra del nombre + primer apellido
        replacements = {
            'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ú': 'u',
            'ñ': 'n', 'ü': 'u'
        }
        surname_clean = first_surname
        for old, new in replacements.items():
            surname_clean = surname_clean.replace(old, new)
        surname_clean = ''.join(c for c in surname_clean if c.isalnum())
        
        base_username = name[0] + surname_clean if name and surname_clean else nif_nie
        
        # Verificar unicidad
        username = base_username
        counter = 1
        while User.objects.filter(username=username).exists():
            username = f"{base_username}{counter}"
            counter += 1
        
        # Crear usuario de Django
        user = User.objects.create_user(
            username=username,
            email=email or f'{username}@temp.com',
            password='Change123',  # Password temporal
            first_name=request.POST.get('name', ''),
            last_name=f"{request.POST.get('first_surname', '')} {request.POST.get('second_surname', '')}".strip()
        )
        
        # Crear Worker vinculado al usuario
        form = WorkerForm(request.POST, request.FILES)
        
        if form.is_valid():
            worker = form.save(commit=False)
            worker.user = user
            worker.save()
            
            return JsonResponse({
                'success': True,
                'message': f'Trabajador añadido correctamente. Usuario: {username} - Password temporal: Change123',
                'worker_id': worker.id
            })
        else:
            # Si falla el form, eliminar el usuario creado
            user.delete()
            return JsonResponse({
                'success': False,
                'errors': form.errors
            }, status=400)
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': str(e)
        }, status=500)

@login_required
@has_permission('management.change_worker')
@require_http_methods(["POST"])
def edit_worker(request, pk):
    try:
        worker = get_object_or_404(Worker, pk=pk)
        user_role = request.user.groups.values_list('name', flat=True).first() if request.user else None
        is_coordinator = user_role == 'Coordinador'
        
        # Si es coordinador, solo puede editar el turno
        if is_coordinator:
            shift = request.POST.get('shift', '').strip()
            if shift and shift in dict(Worker.SHIFT_CHOICES):
                worker.shift = shift
                worker.save()
                return JsonResponse({
                    'success': True,
                    'message': 'Turno actualizado correctamente'
                })
            else:
                return JsonResponse({
                    'success': False,
                    'errors': {'shift': 'Turno inválido'}
                }, status=400)
        
        # Director: edición completa
        # Verificar si se debe eliminar la foto
        if request.POST.get('remove_photo') == 'true':
            if worker.profile_photo:
                worker.profile_photo.delete()
                worker.profile_photo = None
        
        # Verificar si se debe eliminar el currículum
        if request.POST.get('remove_curriculum') == 'true':
            if worker.curriculum:
                worker.curriculum.delete()
                worker.curriculum = None
        
        form = WorkerForm(request.POST, request.FILES, instance=worker)
        
        if form.is_valid():
            worker = form.save()
            return JsonResponse({
                'success': True,
                'message': 'Trabajador actualizado correctamente',
                'worker_id': worker.id
            })
        else:
            return JsonResponse({
                'success': False,
                'errors': form.errors
            }, status=400)
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': str(e)
        }, status=500)

@login_required
@has_permission('management.delete_worker')
@require_http_methods(["POST"])
def delete_worker(request, pk):
    try:
        worker = get_object_or_404(Worker, pk=pk)
        # Soft delete: marcar como inactivo en lugar de eliminar
        worker.is_active = False
        worker.save()
        
        return JsonResponse({
            'success': True,
            'message': 'Trabajador eliminado correctamente'
        })
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': str(e)
        }, status=500)

def worker_detail(request, pk):
    worker = get_object_or_404(Worker, pk=pk)
    context = {
        'worker': worker,
        'STRINGS': STRINGS
    }
    return render(request, 'workers/worker-detail.html', context)

def residents_list(request):
    residents = Resident.objects.filter(is_active=True).order_by('first_surname', 'name')
    context = {
        'residents': residents,
        'STRINGS': STRINGS
    }
    return render(request, 'residents/resident-list.html', context)

@login_required
@has_permission('management.add_resident')
@require_http_methods(["POST"])
def add_resident(request):
    try:
        data = json.loads(request.body)
        form = ResidentForm(data)
        
        if form.is_valid():
            resident = form.save()
            return JsonResponse({
                'success': True,
                'message': 'Residente añadido correctamente',
                'resident_id': resident.id
            })
        else:
            return JsonResponse({
                'success': False,
                'errors': form.errors
            }, status=400)
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': str(e)
        }, status=500)

@login_required
@has_permission('management.change_resident')
@require_http_methods(["POST"])
def edit_resident(request, pk):
    try:
        resident = get_object_or_404(Resident, pk=pk)
        data = json.loads(request.body)
        form = ResidentForm(data, instance=resident)
        
        if form.is_valid():
            resident = form.save()
            return JsonResponse({
                'success': True,
                'message': 'Residente actualizado correctamente',
                'resident_id': resident.id
            })
        else:
            return JsonResponse({
                'success': False,
                'errors': form.errors
            }, status=400)
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': str(e)
        }, status=500)

@login_required
@has_permission('management.delete_resident')
@require_http_methods(["POST"])
def delete_resident(request, pk):
    try:
        resident = get_object_or_404(Resident, pk=pk)
        # Soft delete: marcar como inactivo
        resident.is_active = False
        resident.save()
        
        return JsonResponse({
            'success': True,
            'message': 'Residente eliminado correctamente'
        })
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': str(e)
        }, status=500)

def resident_detail(request, pk):
    resident = get_object_or_404(Resident, pk=pk)

    def user_display(u):
        if not u:
            return '-'
        full = f"{u.first_name} {u.last_name}".strip()
        return full if full else u.username

    food = FoodRegistry.objects.filter(resident=resident).order_by('-date', '-time')[:50]
    food_history = [{
        'date': r.date,
        'time': r.time,
        'description': ', '.join(filter(None, [
            f"Ingesta: {r.solid_intake}" if r.solid_intake else '',
            f"1er: {r.first_course}" if r.first_course else '',
            f"2º: {r.second_course}" if r.second_course else '',
            f"Postre: {r.dessert}" if r.dessert else '',
            f"Líquidos: {r.liquid_intake}" if r.liquid_intake else '',
            f"Cant.: {r.quantity}" if r.quantity else '',
            r.notes
        ])) or 'Sin detalle',
        'user': user_display(r.registered_by)
    } for r in food]

    meds = MedicationRegistry.objects.filter(resident=resident).order_by('-date', '-time')[:50]
    medication_history = [{
        'date': r.date,
        'time': r.time,
        'description': ', '.join(filter(None, [
            r.medication_name,
            f"Dosis: {r.dosage}" if r.dosage else '',
            f"Vía: {r.route}" if r.route else '',
            r.notes
        ])) or 'Sin detalle',
        'user': user_display(r.administered_by)
    } for r in meds]

    bowels = BowelMovementRegistry.objects.filter(resident=resident).order_by('-date', '-time')[:50]
    bowel_history = [{
        'date': r.date,
        'time': r.time,
        'description': ', '.join(filter(None, [
            f"Tipo: {r.type}" if r.type else '',
            f"Consistencia: {r.consistency}" if r.consistency else '',
            f"Color: {r.color}" if r.color else '',
            f"Cantidad: {r.quantity}" if r.quantity else '',
            r.notes
        ])) or 'Sin detalle',
        'user': user_display(r.registered_by)
    } for r in bowels]

    context = {
        'resident': resident,
        'STRINGS': STRINGS,
        'food_history': food_history,
        'medication_history': medication_history,
        'bowel_history': bowel_history
    }
    return render(request, 'residents/resident-detail.html', context)


@login_required
@has_permission('management.change_resident')
@require_http_methods(["PUT"])
def update_registry_settings(request, pk):
    """Actualizar configuración de registros habilitados para un residente"""
    try:
        resident = get_object_or_404(Resident, pk=pk)
        data = json.loads(request.body)
        
        registry_type = data.get('type')
        enabled = data.get('enabled')
        
        if registry_type == 'food':
            resident.enable_food_registry = enabled
        elif registry_type == 'medication':
            resident.enable_medication_registry = enabled
        elif registry_type == 'bowel':
            resident.enable_bowel_registry = enabled
        else:
            return JsonResponse({
                'success': False,
                'message': 'Tipo de registro no válido'
            }, status=400)
        
        resident.save()
        
        return JsonResponse({
            'success': True,
            'message': 'Configuración actualizada correctamente'
        })
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': str(e)
        }, status=500)