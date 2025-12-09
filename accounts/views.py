from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout, update_session_auth_hash
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from datetime import datetime
from decimal import Decimal, InvalidOperation
import json
from django.contrib.auth.models import User

def login_view(request):
    if request.method == 'POST':
        # Verificar si es petición AJAX
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            data = json.loads(request.body)
            username = data.get('username')
            password = data.get('password')
            user = authenticate(request, username=username, password=password)
            
            if user is not None:
                login(request, user)
                return JsonResponse({
                    'success': True,
                    'redirect_url': '/home/'
                })
            else:
                return JsonResponse({
                    'success': False,
                    'error': 'Usuario o contraseña incorrectos'
                }, status=400)
        else:
            # Fallback para peticiones normales
            username = request.POST.get('username')
            password = request.POST.get('password')
            user = authenticate(request, username=username, password=password)
            
            if user is not None:
                login(request, user)
                return redirect('home:home')
            else:
                messages.error(request, 'Usuario o contraseña incorrectos')
    
    return render(request, 'accounts/login.html')

def logout_view(request):
    logout(request)
    return redirect('accounts:login')

@login_required
def profile_view(request):
    try:
        worker = request.user.worker_profile
    except:
        worker = None
    
    context = {
        'worker': worker,
    }
    return render(request, 'accounts/profile.html', context)


@login_required
@require_http_methods(["POST"])
def update_profile(request):
    """Permite al usuario editar sus datos básicos de perfil."""
    try:
        data = json.loads(request.body)
        worker = getattr(request.user, 'worker_profile', None)

        if not worker:
            return JsonResponse({
                'success': False,
                'message': 'No tienes un perfil de trabajador asociado'
            }, status=404)

        # Campos requeridos
        required_fields = ['name', 'first_surname']

        # Validaciones básicas
        for field in required_fields:
            if field in data:
                value = (data.get(field) or '').strip()
                if not value:
                    return JsonResponse({
                        'success': False,
                        'message': 'Nombre y primer apellido son obligatorios'
                    }, status=400)

        # Asignar campos opcionales
        fields_map = {
            'name': 'name',
            'first_surname': 'first_surname',
            'second_surname': 'second_surname',
            'phone': 'phone',
            'address': 'address',
            'locality': 'locality',
            'province': 'province',
            'country': 'country',
            'social_security_number': 'social_security_number',
            'account_number': 'account_number',
            'disability_percentage': 'disability_percentage',
            'role': 'role'
        }

        for payload_key, model_field in fields_map.items():
            if payload_key in data:
                setattr(worker, model_field, (data.get(payload_key) or '').strip())

        # Fecha de contratación (yyyy-mm-dd)
        if 'hire_date' in data:
            hire_date_raw = (data.get('hire_date') or '').strip()
            if hire_date_raw:
                try:
                    worker.hire_date = datetime.strptime(hire_date_raw, '%Y-%m-%d').date()
                except ValueError:
                    return JsonResponse({
                        'success': False,
                        'message': 'Fecha de contratación inválida (usar formato AAAA-MM-DD)'
                    }, status=400)
            else:
                worker.hire_date = None

        # Normalizar porcentaje de minusvalía
        if 'disability_percentage' in data:
            raw = (data.get('disability_percentage') or '').strip()
            if raw == '':
                worker.disability_percentage = None
            else:
                try:
                    worker.disability_percentage = Decimal(raw)
                except InvalidOperation:
                    return JsonResponse({
                        'success': False,
                        'message': 'Valor de minusvalía inválido'
                    }, status=400)

        # Actualizar email del usuario si viene en la petición
        if 'email' in data:
            request.user.email = (data.get('email') or '').strip()
            request.user.save()

        worker.save()

        return JsonResponse({
            'success': True,
            'message': 'Perfil actualizado correctamente',
            'worker': {
                'name': worker.name,
                'first_surname': worker.first_surname,
                'second_surname': worker.second_surname,
                'phone': worker.phone,
                'address': worker.address,
                'locality': worker.locality,
                'province': worker.province,
                'country': worker.country,
                'social_security_number': worker.social_security_number,
                'account_number': worker.account_number,
                'disability_percentage': worker.disability_percentage,
                'role': worker.role,
                'hire_date': worker.hire_date.isoformat() if worker.hire_date else None,
                'email': request.user.email
            }
        })

    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': str(e)
        }, status=500)


@login_required
@require_http_methods(["POST"])
def change_password(request):
    """Cambiar contraseña del usuario"""
    try:
        data = json.loads(request.body)
        current_password = data.get('current_password')
        new_password = data.get('new_password')
        
        # Verificar contraseña actual
        if not request.user.check_password(current_password):
            return JsonResponse({
                'success': False,
                'message': 'La contraseña actual es incorrecta'
            }, status=400)
        
        # Validar nueva contraseña
        if len(new_password) < 8:
            return JsonResponse({
                'success': False,
                'message': 'La nueva contraseña debe tener al menos 8 caracteres'
            }, status=400)
        
        # Cambiar contraseña
        request.user.set_password(new_password)
        request.user.save()
        
        # Mantener sesión activa después del cambio
        update_session_auth_hash(request, request.user)
        
        return JsonResponse({
            'success': True,
            'message': 'Contraseña actualizada correctamente'
        })
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': str(e)
        }, status=500)


@require_http_methods(["POST"])
def recover_password(request):
    """Recover password by username (no email). This will set the password for the user if username exists."""
    try:
        data = json.loads(request.body)
        username = data.get('username')
        new_password = data.get('new_password')

        if not username or not new_password:
            return JsonResponse({'success': False, 'message': 'Username and new_password required'}, status=400)

        user = User.objects.filter(username=username).first()
        if not user:
            return JsonResponse({'success': False, 'message': 'Usuario no encontrado'}, status=404)

        if len(new_password) < 8:
            return JsonResponse({'success': False, 'message': 'La nueva contraseña debe tener al menos 8 caracteres'}, status=400)

        user.set_password(new_password)
        user.save()
        return JsonResponse({'success': True, 'message': 'Contraseña cambiada con éxito'})
    except Exception as e:
        return JsonResponse({'success': False, 'message': str(e)}, status=500)
