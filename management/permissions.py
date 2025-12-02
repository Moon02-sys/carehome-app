from django.contrib.auth.decorators import user_passes_test
from django.core.exceptions import PermissionDenied
from functools import wraps
from django.shortcuts import redirect
from django.contrib import messages


def group_required(*group_names):
    """
    Decorador para requerir que el usuario pertenezca a uno de los grupos especificados.
    Uso: @group_required('Coordinador', 'Enfermero')
    """
    def decorator(view_func):
        @wraps(view_func)
        def wrapper(request, *args, **kwargs):
            if not request.user.is_authenticated:
                return redirect('accounts:login')
            
            if request.user.is_superuser:
                return view_func(request, *args, **kwargs)
            
            user_groups = request.user.groups.values_list('name', flat=True)
            
            if any(group in user_groups for group in group_names):
                return view_func(request, *args, **kwargs)
            
            messages.error(request, 'No tienes permisos para acceder a esta sección.')
            return redirect('home:home')
        
        return wrapper
    return decorator


def permission_required_or_403(perm):
    """
    Decorador para requerir un permiso específico.
    Uso: @permission_required_or_403('management.add_worker')
    """
    def decorator(view_func):
        @wraps(view_func)
        def wrapper(request, *args, **kwargs):
            if not request.user.is_authenticated:
                return redirect('accounts:login')
            
            if request.user.is_superuser or request.user.has_perm(perm):
                return view_func(request, *args, **kwargs)
            
            raise PermissionDenied("No tienes permiso para realizar esta acción.")
        
        return wrapper
    return decorator


def coordinador_required(view_func):
    """
    Decorador específico para vistas que solo puede acceder el Coordinador o Director.
    Uso: @coordinador_required
    """
    return group_required('Coordinador', 'Director')(view_func)


def director_required(view_func):
    """
    Decorador específico para vistas que solo puede acceder el Director.
    Uso: @director_required
    """
    return group_required('Director')(view_func)


def can_edit_workers(user):
    """
    Verifica si el usuario puede editar trabajadores.
    """
    return user.is_superuser or user.groups.filter(name__in=['Coordinador', 'Director']).exists()


def can_delete_workers(user):
    """
    Verifica si el usuario puede eliminar trabajadores.
    """
    return user.is_superuser or user.groups.filter(name__in=['Coordinador', 'Director']).exists()


def can_edit_residents(user):
    """
    Verifica si el usuario puede editar residentes.
    """
    if user.is_superuser:
        return True
    return user.groups.filter(name__in=['Coordinador', 'Director', 'Enfermero']).exists()


def can_delete_residents(user):
    """
    Verifica si el usuario puede eliminar residentes.
    Solo Coordinador y Director pueden eliminar.
    """
    return user.is_superuser or user.groups.filter(name__in=['Coordinador', 'Director']).exists()
