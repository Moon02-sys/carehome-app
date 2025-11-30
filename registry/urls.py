from django.urls import path
from . import views

app_name = 'registry'

urlpatterns = [
    path('', views.registry_list, name='registry_list'),
    path('add/', views.add_registry, name='add_registry'),
    path('<int:pk>/', views.registry_detail, name='registry_detail'),
    path('<int:pk>/edit/', views.edit_registry, name='edit_registry'),
]