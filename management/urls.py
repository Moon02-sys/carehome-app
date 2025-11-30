from django.urls import path
from . import views

app_name = 'management'

urlpatterns = [
    path('', views.management_dashboard, name='dashboard'),
    path('workers/', views.workers_list, name='workers_list'),
    path('workers/add/', views.add_worker, name='add_worker'),
    path('workers/<int:pk>/', views.worker_detail, name='worker_detail'),
    path('residents/', views.residents_list, name='residents_list'),
    path('residents/add/', views.add_resident, name='add_resident'),
    path('residents/<int:pk>/', views.resident_detail, name='resident_detail'),
]