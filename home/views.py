from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from resources.strings import content as STRINGS
from management.models import Resident

@login_required
def home(request):
    residents = Resident.objects.filter(is_active=True).order_by('first_surname', 'name')
    context = {
        'STRINGS': STRINGS,
        'residents': residents
    }
    return render(request, 'home/home.html', context)
