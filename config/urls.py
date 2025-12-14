from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.shortcuts import redirect

def redirect_to_login(request):
    return redirect('accounts:login')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', redirect_to_login),
    path('accounts/', include('accounts.urls')),
    path('home/', include('home.urls')),
    path('registry/', include('registry.urls')),
    path('management/', include('management.urls')),
]

# Servir archivos media en desarrollo
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATICFILES_DIRS[0])
