from django.urls import path
from . import views

app_name = 'registry'

urlpatterns = [
    path('', views.registry_list, name='registry_list'),
    path('add/', views.add_registry, name='add_registry'),
    path('<int:pk>/', views.registry_detail, name='registry_detail'),
    path('<int:pk>/edit/', views.edit_registry, name='edit_registry'),
    
    # API endpoints para guardar registros
    path('api/save-food/', views.save_food_registry, name='save_food_registry'),
    path('api/save-medication/', views.save_medication_registry, name='save_medication_registry'),
    path('api/save-bowel/', views.save_bowel_registry, name='save_bowel_registry'),
    path('api/resident/<int:resident_id>/registries/', views.get_resident_registries, name='get_resident_registries'),
    
    # API endpoints para eliminar registros
    path('api/delete-food/<int:registry_id>/', views.delete_food_registry, name='delete_food_registry'),
    path('api/delete-medication/<int:registry_id>/', views.delete_medication_registry, name='delete_medication_registry'),
    path('api/delete-bowel/<int:registry_id>/', views.delete_bowel_registry, name='delete_bowel_registry'),
    
    # API endpoints para anotaciones
    path('api/annotations/', views.get_annotations, name='get_annotations'),
    path('api/annotations/save/', views.save_annotation, name='save_annotation'),
    path('api/annotations/<int:annotation_id>/update/', views.update_annotation, name='update_annotation'),
    path('api/annotations/<int:annotation_id>/delete/', views.delete_annotation, name='delete_annotation'),
    path('api/annotations/<int:annotation_id>/status/', views.update_annotation_status, name='update_annotation_status'),
]