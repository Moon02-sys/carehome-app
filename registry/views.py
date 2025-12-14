from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.contrib.auth.decorators import login_required
from management.models import Resident
from .models import FoodRegistry, MedicationRegistry, BowelMovementRegistry, Annotation
from datetime import datetime
import json

def registry_list(request):
    # Obtener solo residentes activos y con registros habilitados
    residents_food = Resident.objects.filter(is_active=True, enable_food_registry=True).order_by('first_surname', 'name')
    residents_medication = Resident.objects.filter(is_active=True, enable_medication_registry=True).order_by('first_surname', 'name')
    residents_bowel = Resident.objects.filter(is_active=True, enable_bowel_registry=True).order_by('first_surname', 'name')
    
    context = {
        'residents': residents_food,  # Para compatibilidad general
        'residents_food': residents_food,
        'residents_medication': residents_medication,
        'residents_bowel': residents_bowel,
    }
    return render(request, 'registres/registry-list.html', context)

@login_required
@require_http_methods(["POST", "PUT"])
def save_food_registry(request):
    """Guarda el registro de comida del residente"""
    try:
        data = json.loads(request.body)
        registry_id = data.get('registry_id')
        
        # Si tiene ID, actualizar; sino, crear
        if registry_id:
            registry = FoodRegistry.objects.get(id=registry_id)
            registry.date = datetime.strptime(data.get('date'), '%Y-%m-%d').date()
            registry.time = datetime.strptime(data.get('time'), '%H:%M').time()
            registry.solid_intake = data.get('solid_intake', '')
            registry.first_course = data.get('first_course', '')
            registry.second_course = data.get('second_course', '')
            registry.dessert = data.get('dessert', '')
            registry.liquid_intake = data.get('liquid_intake', '')
            registry.quantity = data.get('quantity', '')
            registry.notes = data.get('notes', '')
            registry.save()
        else:
            registry = FoodRegistry.objects.create(
                resident_id=data.get('resident_id'),
                date=datetime.strptime(data.get('date'), '%Y-%m-%d').date(),
                time=datetime.strptime(data.get('time'), '%H:%M').time(),
                solid_intake=data.get('solid_intake', ''),
                first_course=data.get('first_course', ''),
                second_course=data.get('second_course', ''),
                dessert=data.get('dessert', ''),
                liquid_intake=data.get('liquid_intake', ''),
                quantity=data.get('quantity', ''),
                notes=data.get('notes', ''),
                registered_by=request.user
            )
        
        return JsonResponse({
            'success': True,
            'message': 'Registro guardado exitosamente',
            'registry_id': registry.id
        })
    except Exception:
        return JsonResponse({
            'success': False,
            'message': 'No se pudo guardar el registro de alimentación'
        }, status=400)

@login_required
@require_http_methods(["POST", "PUT"])
def save_medication_registry(request):
    """Guardar o actualizar registro de medicación"""
    try:
        data = json.loads(request.body)
        registry_id = data.get('registry_id')
        
        if registry_id:
            registry = MedicationRegistry.objects.get(id=registry_id)
            registry.date = datetime.strptime(data.get('date'), '%Y-%m-%d').date()
            registry.time = datetime.strptime(data.get('time'), '%H:%M').time()
            registry.medication_name = data.get('medication_name', '')
            registry.dosage = data.get('dosage', '')
            registry.route = data.get('route', '')
            registry.notes = data.get('notes', '')
            registry.save()
        else:
            registry = MedicationRegistry.objects.create(
                resident_id=data.get('resident_id'),
                date=datetime.strptime(data.get('date'), '%Y-%m-%d').date(),
                time=datetime.strptime(data.get('time'), '%H:%M').time(),
                medication_name=data.get('medication_name', ''),
                dosage=data.get('dosage', ''),
                route=data.get('route', ''),
                notes=data.get('notes', ''),
                administered_by=request.user
            )
        
        return JsonResponse({
            'success': True,
            'message': 'Registro guardado exitosamente',
            'registry_id': registry.id
        })
    except Exception as e:
        return JsonResponse({'success': False, 'message': str(e)}, status=400)

@login_required
@require_http_methods(["POST", "PUT"])
def save_bowel_registry(request):
    """Guardar o actualizar registro de deposición"""
    try:
        data = json.loads(request.body)
        registry_id = data.get('registry_id')
        
        # Aceptar tanto 'type' como 'type_bowel' para compatibilidad
        type_value = data.get('type_bowel', data.get('type', ''))
        
        if registry_id:
            registry = BowelMovementRegistry.objects.get(id=registry_id)
            registry.date = datetime.strptime(data.get('date'), '%Y-%m-%d').date()
            registry.time = datetime.strptime(data.get('time'), '%H:%M').time()
            registry.type = type_value
            registry.consistency = data.get('consistency', '')
            registry.color = data.get('color', '')
            registry.quantity = data.get('quantity', '')
            registry.notes = data.get('notes', '')
            registry.save()
        else:
            registry = BowelMovementRegistry.objects.create(
                resident_id=data.get('resident_id'),
                date=datetime.strptime(data.get('date'), '%Y-%m-%d').date(),
                time=datetime.strptime(data.get('time'), '%H:%M').time(),
                type=type_value,
                consistency=data.get('consistency', ''),
                color=data.get('color', ''),
                quantity=data.get('quantity', ''),
                notes=data.get('notes', ''),
                registered_by=request.user
            )
        
        return JsonResponse({
            'success': True,
            'message': 'Registro guardado exitosamente',
            'registry_id': registry.id
        })
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': f'Error al guardar: {str(e)}'
        }, status=400)

@login_required
@require_http_methods(["GET"])
def get_resident_registries(request, resident_id):
    """Devuelve los registros del residente (comida, medicación, deposición)"""
    try:
        resident = Resident.objects.get(id=resident_id)
        
        # Obtener registros de alimentación
        food_registries = FoodRegistry.objects.filter(resident=resident).order_by('-date', '-time')[:20]
        food_data = [{
            'id': r.id,
            'resident_id': r.resident.id,
            'date': r.date.strftime('%Y-%m-%d'),
            'time': r.time.strftime('%H:%M'),
            'solid_intake': r.solid_intake,
            'first_course': r.first_course,
            'second_course': r.second_course,
            'dessert': r.dessert,
            'liquid_intake': r.liquid_intake,
            'quantity': r.quantity,
            'notes': r.notes,
            'type': 'alimentacion'
        } for r in food_registries]
        
        # Obtener registros de medicación
        medication_registries = MedicationRegistry.objects.filter(resident=resident).order_by('-date', '-time')[:20]
        medication_data = [{
            'id': r.id,
            'resident_id': r.resident.id,
            'date': r.date.strftime('%Y-%m-%d'),
            'time': r.time.strftime('%H:%M'),
            'medication_name': r.medication_name,
            'dosage': r.dosage,
            'route': r.route,
            'notes': r.notes,
            'type': 'medicacion'
        } for r in medication_registries]
        
        # Obtener registros de deposición
        bowel_registries = BowelMovementRegistry.objects.filter(resident=resident).order_by('-date', '-time')[:20]
        bowel_data = [{
            'id': r.id,
            'resident_id': r.resident.id,
            'date': r.date.strftime('%Y-%m-%d'),
            'time': r.time.strftime('%H:%M'),
            'type_bowel': r.type,
            'consistency': r.consistency,
            'color': r.color,
            'quantity': r.quantity,
            'notes': r.notes,
            'type': 'deposicion'
        } for r in bowel_registries]
        
        return JsonResponse({
            'success': True,
            'resident_name': resident.get_full_name(),
            'registries': {
                'alimentacion': food_data,
                'medicacion': medication_data,
                'deposicion': bowel_data
            }
        })
    except Resident.DoesNotExist:
        return JsonResponse({
            'success': False,
            'message': 'Residente no encontrado'
        }, status=404)
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': f'Error: {str(e)}'
        }, status=400)

def add_registry(request):
    return render(request, 'registres/add_registry.html')

def registry_detail(request, pk):
    return render(request, 'registres/registry_detail.html')

def edit_registry(request, pk):
    return render(request, 'registres/edit_registry.html')

@login_required
@require_http_methods(["DELETE"])
def delete_food_registry(request, registry_id):
    """Borra un registro de comida"""
    try:
        registry = FoodRegistry.objects.get(id=registry_id)
        registry.delete()
        return JsonResponse({'success': True, 'message': 'Registro eliminado'})
    except FoodRegistry.DoesNotExist:
        return JsonResponse({'success': False, 'message': 'Registro no encontrado'}, status=404)
    except Exception as e:
        return JsonResponse({'success': False, 'message': str(e)}, status=400)

@login_required
@require_http_methods(["DELETE"])
def delete_medication_registry(request, registry_id):
    """Eliminar registro de medicación"""
    try:
        registry = MedicationRegistry.objects.get(id=registry_id)
        registry.delete()
        return JsonResponse({'success': True, 'message': 'Registro eliminado'})
    except MedicationRegistry.DoesNotExist:
        return JsonResponse({'success': False, 'message': 'Registro no encontrado'}, status=404)
    except Exception as e:
        return JsonResponse({'success': False, 'message': str(e)}, status=400)

@login_required
@require_http_methods(["DELETE"])
def delete_bowel_registry(request, registry_id):
    """Eliminar registro de deposición"""
    try:
        registry = BowelMovementRegistry.objects.get(id=registry_id)
        registry.delete()
        return JsonResponse({'success': True, 'message': 'Registro eliminado'})
    except BowelMovementRegistry.DoesNotExist:
        return JsonResponse({'success': False, 'message': 'Registro no encontrado'}, status=404)
    except Exception as e:
        return JsonResponse({'success': False, 'message': str(e)}, status=400)


# ========== ANOTACIONES ==========

@login_required
@require_http_methods(["POST"])
def save_annotation(request):
    """Crea una anotación nueva en el panel seleccionado"""
    try:
        data = json.loads(request.body)
        
        annotation = Annotation.objects.create(
            resident_id=data.get('resident_id'),
            panel=data.get('panel'),
            type=data.get('type'),
            status=data.get('status', 'abierto'),
            form_data=data.get('form_data', {}),
            notes=data.get('notes', ''),
            created_by=request.user
        )
        
        return JsonResponse({
            'success': True,
            'message': 'Anotación guardada exitosamente',
            'annotation_id': annotation.id
        })
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': f'Error al guardar: {str(e)}'
        }, status=400)


@login_required
@require_http_methods(["GET"])
def get_annotations(request):
    """Obtener todas las anotaciones"""
    try:
        annotations = Annotation.objects.select_related('resident', 'created_by').all()[:50]
        
        data = [{
            'id': a.id,
            'resident': {
                'id': a.resident.id,
                'name': a.resident.get_full_name()
            },
            'panel': a.panel,
            'type': a.type,
            'status': a.status,
            'form_data': a.form_data,
            'notes': a.notes,
            'created_by': a.created_by.get_full_name() if a.created_by else '-',
            'timestamp': a.created_at.isoformat()
        } for a in annotations]
        
        return JsonResponse({
            'success': True,
            'annotations': data
        })
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': f'Error: {str(e)}'
        }, status=400)


@login_required
@require_http_methods(["DELETE"])
def delete_annotation(request, annotation_id):
    """Eliminar una anotación"""
    try:
        annotation = Annotation.objects.get(id=annotation_id)
        annotation.delete()
        return JsonResponse({'success': True, 'message': 'Anotación eliminada'})
    except Annotation.DoesNotExist:
        return JsonResponse({'success': False, 'message': 'Anotación no encontrada'}, status=404)
    except Exception as e:
        return JsonResponse({'success': False, 'message': str(e)}, status=400)


@login_required
@require_http_methods(["PUT"])
def update_annotation(request, annotation_id):
    """Actualizar una anotación completa"""
    try:
        data = json.loads(request.body)
        annotation = Annotation.objects.get(id=annotation_id)
        
        annotation.resident_id = data.get('resident_id', annotation.resident_id)
        annotation.panel = data.get('panel', annotation.panel)
        annotation.type = data.get('type', annotation.type)
        annotation.status = data.get('status', annotation.status)
        annotation.form_data = data.get('form_data', annotation.form_data)
        annotation.notes = data.get('notes', annotation.notes)
        annotation.save()
        
        return JsonResponse({
            'success': True,
            'message': 'Anotación actualizada'
        })
    except Annotation.DoesNotExist:
        return JsonResponse({'success': False, 'message': 'Anotación no encontrada'}, status=404)
    except Exception as e:
        return JsonResponse({'success': False, 'message': str(e)}, status=400)


@login_required
@require_http_methods(["PUT"])
def update_annotation_status(request, annotation_id):
    """Actualizar el estado de una anotación con seguimiento"""
    try:
        data = json.loads(request.body)
        annotation = Annotation.objects.get(id=annotation_id)
        annotation.status = data.get('status', annotation.status)
        
        # Agregar información de seguimiento a form_data
        if not annotation.form_data:
            annotation.form_data = {}
        
        if 'followups' not in annotation.form_data:
            annotation.form_data['followups'] = []
        
        annotation.form_data['followups'].append({
            'type': data.get('followup_type'),
            'notes': data.get('followup_notes'),
            'timestamp': datetime.now().isoformat(),
            'user': request.user.get_full_name()
        })
        
        annotation.save()
        
        return JsonResponse({
            'success': True,
            'message': 'Estado actualizado'
        })
    except Annotation.DoesNotExist:
        return JsonResponse({'success': False, 'message': 'Anotación no encontrada'}, status=404)
    except Exception as e:
        return JsonResponse({'success': False, 'message': str(e)}, status=400)