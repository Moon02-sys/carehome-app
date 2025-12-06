from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout, update_session_auth_hash
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
import json

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
