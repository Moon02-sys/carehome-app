from django.contrib import admin
from .models import Worker

# Register your models here.

@admin.register(Worker)
class WorkerAdmin(admin.ModelAdmin):
    list_display = ['name', 'first_surname', 'second_surname', 'nif_nie', 'phone', 'email', 'is_active']
    list_filter = ['is_active', 'gender', 'province']
    search_fields = ['name', 'first_surname', 'second_surname', 'nif_nie', 'phone', 'email']
    list_per_page = 25
