from resources.choices import PanelChoices, TypeChoices


def choices_processor(request):
    return {
        'PANEL_CHOICES': PanelChoices.choices,
        'TYPE_CHOICES': TypeChoices.choices,
    }
