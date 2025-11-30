from django.shortcuts import render

def registry_list(request):
    return render(request, 'registres/registry-list.html')

def add_registry(request):
    return render(request, 'registres/add_registry.html')

def registry_detail(request, pk):
    return render(request, 'registres/registry_detail.html')

def edit_registry(request, pk):
    return render(request, 'registres/edit_registry.html')