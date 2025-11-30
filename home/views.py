from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from resources.strings import content as STRINGS

@login_required
def home(request):
    context = {
        'STRINGS': STRINGS
    }
    return render(request, 'home/home.html', context)
