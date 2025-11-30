from django import forms
from .models import Resident, Worker


class ResidentForm(forms.ModelForm):
    class Meta:
        model = Resident
        fields = [
            'name', 'first_surname', 'second_surname', 'nif_nie', 
            'birthdate', 'gender', 'address', 'locality', 'province', 
            'country', 'phone', 'social_security_number'
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
        }


class WorkerForm(forms.ModelForm):
    class Meta:
        model = Worker
        fields = [
            'name', 'first_surname', 'second_surname', 'nif_nie', 
            'birthdate', 'gender', 'address', 'locality', 'province', 
            'country', 'phone', 'email', 'social_security_number', 
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
            'email': forms.EmailInput(attrs={'class': 'form-control'}),
            'social_security_number': forms.TextInput(attrs={'class': 'form-control'}),
            'account_number': forms.TextInput(attrs={'class': 'form-control'}),
            'hire_date': forms.DateInput(attrs={'class': 'form-control', 'type': 'date'}),
            'disability_percentage': forms.NumberInput(attrs={'class': 'form-control'}),
            'profile_photo': forms.FileInput(attrs={'class': 'form-control'}),
        }
