"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.urls import path
from .views import PosicionListCreateView, PosicionRetrieveUpdateDestroyView, get_colores_pisos

urlpatterns = [
    path('posiciones/', PosicionListCreateView.as_view(), name='posicion-list-create'),
    path('posiciones/<str:id>/', PosicionRetrieveUpdateDestroyView.as_view(), name='posicion-retrieve-update-destroy'),
    path('config/', get_colores_pisos, name="config"),
]

