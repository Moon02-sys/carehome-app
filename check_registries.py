import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from registry.models import FoodRegistry, MedicationRegistry, BowelMovementRegistry

print("=" * 50)
print("REGISTROS DE ALIMENTACIÓN")
print("=" * 50)
food_count = FoodRegistry.objects.count()
print(f"Total: {food_count}")
for r in FoodRegistry.objects.all()[:10]:
    print(f"  - ID: {r.id} | Residente: {r.resident.get_full_name()} | Fecha: {r.date} {r.time}")

print("\n" + "=" * 50)
print("REGISTROS DE MEDICACIÓN")
print("=" * 50)
med_count = MedicationRegistry.objects.count()
print(f"Total: {med_count}")
for r in MedicationRegistry.objects.all()[:10]:
    print(f"  - ID: {r.id} | Residente: {r.resident.get_full_name()} | Med: {r.medication_name}")

print("\n" + "=" * 50)
print("REGISTROS DE DEPOSICIÓN")
print("=" * 50)
bowel_count = BowelMovementRegistry.objects.count()
print(f"Total: {bowel_count}")
for r in BowelMovementRegistry.objects.all()[:10]:
    print(f"  - ID: {r.id} | Residente: {r.resident.get_full_name()} | Tipo: {r.type}")
