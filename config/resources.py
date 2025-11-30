from django.conf import settings
import resources.strings as STRINGS

def custom_resources(request):
    RESOURCES = {
        'STRINGS': STRINGS.content,
    }
    return RESOURCES