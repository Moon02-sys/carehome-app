from django.contrib import admin
from .models import MedicationRegistry, FoodRegistry, BowelMovementRegistry, Annotation

# Register your models here.

@admin.register(MedicationRegistry)
class MedicationRegistryAdmin(admin.ModelAdmin):
    list_display = ['resident', 'date', 'time', 'medication_name', 'dosage', 'administered_by']
    list_filter = ['date', 'resident', 'administered_by']
    search_fields = ['resident__name', 'resident__first_surname', 'medication_name']
    date_hierarchy = 'date'
    ordering = ['-date', '-time']


@admin.register(FoodRegistry)
class FoodRegistryAdmin(admin.ModelAdmin):
    list_display = ['resident', 'date', 'time', 'solid_intake', 'registered_by']
    list_filter = ['date', 'resident', 'solid_intake']
    search_fields = ['resident__name', 'resident__first_surname']
    date_hierarchy = 'date'
    ordering = ['-date', '-time']


@admin.register(BowelMovementRegistry)
class BowelMovementRegistryAdmin(admin.ModelAdmin):
    list_display = ['resident', 'date', 'time', 'type', 'consistency', 'color', 'registered_by']
    list_filter = ['date', 'resident', 'type', 'consistency']
    search_fields = ['resident__name', 'resident__first_surname']
    date_hierarchy = 'date'
    ordering = ['-date', '-time']


@admin.register(Annotation)
class AnnotationAdmin(admin.ModelAdmin):
    list_display = ['resident', 'panel', 'type', 'status', 'created_by', 'created_at']
    list_filter = ['panel', 'type', 'status', 'created_at', 'resident']
    search_fields = ['resident__name', 'resident__first_surname', 'notes']
    date_hierarchy = 'created_at'
    ordering = ['-created_at']
    readonly_fields = ['created_at', 'updated_at']
