from django import forms
from .models import Resident, Worker


class ResidentForm(forms.ModelForm):
    class Meta:
        model = Resident
        fields = [
            'name', 'first_surname', 'second_surname', 'nif_nie', 
            'birthdate', 'gender', 'address', 'locality', 'province', 
            'country', 'phone', 'social_security_number',
            'blood_type', 'allergies', 'chronic_diseases', 'current_medications',
            'medical_insurance', 'insurance_number', 'primary_doctor', 'doctor_phone',
            'mobility_level', 'dependency_degree', 'uses_wheelchair', 'uses_walker',
            'emergency_contact_name', 'emergency_contact_relationship', 'emergency_contact_phone'
        ]
        widgets = {
            'name': forms.TextInput(attrs={'class': 'form-control'}),
            'first_surname': forms.TextInput(attrs={'class': 'form-control'}),
            'second_surname': forms.TextInput(attrs={'class': 'form-control'}),
            'nif_nie': forms.TextInput(attrs={'class': 'form-control'}),
            'birthdate': forms.DateInput(attrs={'class': 'form-control', 'type': 'date'}),
            'gender': forms.Select(attrs={'class': 'form-select'}),
            'address': forms.TextInput(attrs={'class': 'form-control'}),
            'locality': forms.TextInput(attrs={'class': 'form-control'}),
            'province': forms.TextInput(attrs={'class': 'form-control'}),
            'country': forms.TextInput(attrs={'class': 'form-control'}),
            'phone': forms.TextInput(attrs={'class': 'form-control'}),
            'social_security_number': forms.TextInput(attrs={'class': 'form-control'}),
            'blood_type': forms.Select(attrs={'class': 'form-select'}),
            'allergies': forms.Textarea(attrs={'class': 'form-control', 'rows': 2}),
            'chronic_diseases': forms.Textarea(attrs={'class': 'form-control', 'rows': 2}),
            'current_medications': forms.Textarea(attrs={'class': 'form-control', 'rows': 2}),
            'medical_insurance': forms.TextInput(attrs={'class': 'form-control'}),
            'insurance_number': forms.TextInput(attrs={'class': 'form-control'}),
            'primary_doctor': forms.TextInput(attrs={'class': 'form-control'}),
            'doctor_phone': forms.TextInput(attrs={'class': 'form-control'}),
            'mobility_level': forms.Select(attrs={'class': 'form-select'}),
            'dependency_degree': forms.Select(attrs={'class': 'form-select'}),
            'uses_wheelchair': forms.CheckboxInput(attrs={'class': 'form-check-input'}),
            'uses_walker': forms.CheckboxInput(attrs={'class': 'form-check-input'}),
            'emergency_contact_name': forms.TextInput(attrs={'class': 'form-control'}),
            'emergency_contact_relationship': forms.TextInput(attrs={'class': 'form-control'}),
            'emergency_contact_phone': forms.TextInput(attrs={'class': 'form-control'}),
        }


class WorkerForm(forms.ModelForm):
    # Campo extra para el email (se guarda en user.email, no en Worker)
    email = forms.EmailField(required=False, widget=forms.EmailInput(attrs={'class': 'form-control'}))
    
    class Meta:
        model = Worker
        fields = [
            'name', 'first_surname', 'second_surname', 'nif_nie', 
            'birthdate', 'gender', 'address', 'locality', 'province', 
            'country', 'phone', 'role', 'social_security_number', 
            'account_number', 'hire_date', 'disability_percentage', 'profile_photo'
        ]
        widgets = {
            'name': forms.TextInput(attrs={'class': 'form-control'}),
            'first_surname': forms.TextInput(attrs={'class': 'form-control'}),
            'second_surname': forms.TextInput(attrs={'class': 'form-control'}),
            'nif_nie': forms.TextInput(attrs={'class': 'form-control'}),
            'birthdate': forms.DateInput(attrs={'class': 'form-control', 'type': 'date'}),
            'gender': forms.Select(attrs={'class': 'form-select'}),
            'address': forms.TextInput(attrs={'class': 'form-control'}),
            'locality': forms.TextInput(attrs={'class': 'form-control'}),
            'province': forms.Select(attrs={'class': 'form-select'}),
            'country': forms.TextInput(attrs={'class': 'form-control'}),
            'phone': forms.TextInput(attrs={'class': 'form-control'}),
            'role': forms.Select(attrs={'class': 'form-select'}),
            'social_security_number': forms.TextInput(attrs={'class': 'form-control'}),
            'account_number': forms.TextInput(attrs={'class': 'form-control'}),
            'hire_date': forms.DateInput(attrs={'class': 'form-control', 'type': 'date'}),
            'disability_percentage': forms.NumberInput(attrs={'class': 'form-control'}),
            'profile_photo': forms.FileInput(attrs={'class': 'form-control'}),
        }
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Si estamos editando, cargar el email del usuario vinculado
        if self.instance and self.instance.pk and self.instance.user:
            self.fields['email'].initial = self.instance.user.email
    
    def save(self, commit=True):
        worker = super().save(commit=False)
        
        # Actualizar el email del usuario vinculado
        if worker.user and self.cleaned_data.get('email'):
            worker.user.email = self.cleaned_data['email']
            if commit:
                worker.user.save()
        
        if commit:
            worker.save()
        
        return worker
