from django.contrib import admin
from django.urls import path, include
from django.views.generic import TemplateView

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView
)

urlpatterns = [

    # =========================
    # FRONTEND PAGES (HTML)
    # =========================
    path('', TemplateView.as_view(template_name='signup.html')),
    path('login/', TemplateView.as_view(template_name='login.html')),
    path(
    'request-doctor/',
    TemplateView.as_view(
        template_name='request-doctor.html'
    ),
),
    path(
    'patient/appointments/',
    TemplateView.as_view(
        template_name='patient-appointments.html'
    )
),
    path('doctor-dashboard/', TemplateView.as_view(template_name='doctor-dashboard.html')),
    path('patient-dashboard/', TemplateView.as_view(template_name='patient-dashboard.html')),
    path('admin-dashboard/', TemplateView.as_view(template_name='admin-dashboard.html')),
    path('manage-patient/', TemplateView.as_view(template_name="manage-patient.html")),
    path('manage-doctor/', TemplateView.as_view(template_name="manage-doctor.html")),
    path(
        'manage-doctors/',
        TemplateView.as_view(
            template_name='manage-doctors.html'
        )
    ),

    
 # =========================
    # DOCTOR PAGES
    # =========================

   

    path(
        "doctor/appointments/",
        TemplateView.as_view(template_name="doctor-appointment.html"),
        name="doctor-appointments",
    ),

    path(
        "doctor/schedule/",
        TemplateView.as_view(template_name="doctor-schedule.html"),
        name="doctor-schedule",
    ),

    path(
        "doctor/prescriptions/",
        TemplateView.as_view(template_name="doctor-prescription.html"),
        name="doctor-prescriptions",
    ),






    # =========================
    # ADMIN PANEL
    # =========================
    path('admin/', admin.site.urls),

    # =========================
    # API ROUTES
    # =========================
    path('api/accounts/', include('accounts.urls')),
    path('api/appointments/', include('appointments.urls')),
    path('api/doctor/', include('doctor.urls')),
    path('api/schedule/', include('schedule.urls')),
    path('api/prescriptions/', include('prescriptions.urls')),
    path('api/dashboard/', include('dashboard.urls')),
    path( "api/notifications/", include("notifications.urls")
),
    # =========================
    # AUTH (JWT)
    # =========================
    path('api/token/', TokenObtainPairView.as_view()),
    path('api/token/refresh/', TokenRefreshView.as_view()),
]