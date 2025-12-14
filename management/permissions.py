from functools import wraps
from django.shortcuts import redirect
from django.contrib import messages


def is_coordinator(user):
    """Verifica si el usuario es coordinador"""
    return hasattr(user, 'worker_profile') and user.worker_profile.role == 'Coordinador'


def is_director(user):
    """Verifica si el usuario es director"""
    return hasattr(user, 'worker_profile') and user.worker_profile.role == 'Director'


def has_permission(perm):
    """
    Decorador que verifica permisos usando el sistema nativo de Django.
    Uso: @has_permission('management.add_worker')
    """
    def decorator(view_func):
        @wraps(view_func)
        def wrapper(request, *args, **kwargs):
            if not request.user.is_authenticated:
                return redirect('accounts:login')
            
            # Superusuario siempre puede
            if request.user.is_superuser:
                return view_func(request, *args, **kwargs)
            
            # Verificar permiso
            if request.user.has_perm(perm):
                return view_func(request, *args, **kwargs)
            
            messages.error(request, 'No tienes permisos para realizar esta acción.')
            return redirect('home:home')
        
        return wrapper
    return decorator
