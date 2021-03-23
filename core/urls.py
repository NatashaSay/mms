from django.urls import path
from . import views

urlpatterns = [
    path('alg1/', views.one, name='one'),
    path('alg2/', views.two, name='two'),
    path('alg3/', views.three, name='three'),
    path('', views.index, name='index'),
]
