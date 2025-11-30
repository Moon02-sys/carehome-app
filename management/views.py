from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from resources.strings import content as STRINGS
from .models import Resident, Worker
from .forms import ResidentForm, WorkerForm
import json

def management_dashboard(request):
    return render(request, 'management/dashboard.html')

def workers_list(request):
    workers = Worker.objects.filter(is_active=True).order_by('first_surname', 'name')
    context = {
        'workers': workers,
        'STRINGS': STRINGS
    }
    return render(request, 'workers/worker-list.html', context)

def add_worker(request):
    return render(request, 'management/add_worker.html')

def worker_detail(request, pk):
    worker = get_object_or_404(Worker, pk=pk)
    context = {
        'worker': worker,
        'STRINGS': STRINGS
    }
    return render(request, 'management/worker_detail.html', context)

def residents_list(request):
    residents = Resident.objects.filter(is_active=True).order_by('first_surname', 'name')
    context = {
        'residents': residents,
        'STRINGS': STRINGS
    }
    return render(request, 'residents/resident-list.html', context)

@login_required
@require_http_methods(["POST"])
def add_resident(request):
    try:
        data = json.loads(request.body)
        form = ResidentForm(data)
        
        if form.is_valid():
            resident = form.save()
            return JsonResponse({
                'success': True,
                'message': 'Residente añadido correctamente',
                'resident_id': resident.id
            })
        else:
            return JsonResponse({
                'success': False,
                'errors': form.errors
            }, status=400)
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': str(e)
        }, status=500)

def resident_detail(request, pk):
    resident = get_object_or_404(Resident, pk=pk)
    context = {
        'resident': resident,
        'STRINGS': STRINGS
    }
    return render(request, 'residents/resident-detail.html', context)