from django.shortcuts import render
from resources.strings import content as STRINGS

def management_dashboard(request):
    return render(request, 'management/dashboard.html')

def workers_list(request):
    return render(request, 'workers/worker-list.html')

def add_worker(request):
    return render(request, 'management/add_worker.html')

def worker_detail(request, pk):
    return render(request, 'management/worker_detail.html')

def residents_list(request):
    return render(request, 'residents/resident-list.html')

def add_resident(request):
    return render(request, 'management/add_resident.html')

def resident_detail(request, pk):
    return render(request, 'residents/resident-detail.html')