"""
URLs for users app
"""
from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    # Authentication
    path('register/', views.RegisterView.as_view(), name='register'),
    path('login/', views.LoginView.as_view(), name='login'),
    path('logout/', views.LogoutView.as_view(), name='logout'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('check/', views.CheckAuthView.as_view(), name='check_auth'),
    
    # Profile
    path('profile/', views.ProfileView.as_view(), name='profile'),
    path('change-password/', views.ChangePasswordView.as_view(), name='change_password'),
    
    # Security
    path('login-history/', views.LoginHistoryView.as_view(), name='login_history'),
    path('security-questions/', views.SecurityQuestionView.as_view(), name='security_questions'),
    path('security-questions/<int:question_id>/', views.SecurityQuestionView.as_view(), name='delete_question'),
    path('toggle-2fa/', views.Toggle2FAView.as_view(), name='toggle_2fa'),
    path('verify-email/', views.VerifyEmailView.as_view(), name='verify_email'),
    
    # Notifications
    path('notifications/', views.NotificationPreferenceView.as_view(), name='notifications'),
    
    # Password Reset
    path('password-reset/', views.PasswordResetRequestView.as_view(), name='password_reset'),
    path('password-reset/confirm/', views.PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
    
    # Account Management
    path('delete-account/', views.DeleteAccountView.as_view(), name='delete_account'),
]