"""
URL configuration for NoteCraft_backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
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
from django.contrib import admin
from django.urls import path
from NoteMaker.views import *
from UserData.views import *
from rest_framework_simplejwt.views import TokenRefreshView
urlpatterns = [
    path('admin/', admin.site.urls),
    path('hello/', HelloWorldView.as_view()),
    path('generate_note/', GenerateNoteView.as_view()),
    path('modify_image/', ModifyImageView.as_view()),
    path('modify_text/', ModifyTextView.as_view()),
    path('proxy-image/',ProxyImageView.as_view()),
    path('add_pdf/',DocumentUploadView.as_view()),
    path('api/signup/', SignupView.as_view(), name='signup'),
    path('api/login/', LoginView.as_view(), name='login'),
    path('search_pdfs/',ListDocumentView.as_view()),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('logout/', LogoutView.as_view(), name="logout"),
    path('auth-status/', AuthStatusView.as_view(), name="auth-status"),
    path('task_status/<str:task_id>/', TaskStatusView.as_view(), name='task_status'),
    path('cancel_task/', CancelTaskView.as_view(), name='cancel_task'),
]
