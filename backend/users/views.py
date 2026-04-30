"""
Views for user authentication and profile management
"""
from rest_framework import status, generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import logout
from django.utils import timezone
from rest_framework_simplejwt.views import TokenObtainPairView
from .models import User, LoginHistory, SecurityQuestion, NotificationPreference
from .serializers import (
    UserRegistrationSerializer, UserLoginSerializer, TokenResponseSerializer,
    UserProfileSerializer, UserUpdateSerializer, ChangePasswordSerializer,
    LoginHistorySerializer, SecurityQuestionSerializer, NotificationPreferenceSerializer,
    PasswordResetRequestSerializer, PasswordResetConfirmSerializer
)

class RegisterView(APIView):
    """User registration endpoint"""
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            
            # Generate tokens
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'success': True,
                'message': 'User registered successfully',
                'data': {
                    'user': UserProfileSerializer(user).data,
                    'tokens': {
                        'refresh': str(refresh),
                        'access': str(refresh.access_token),
                    }
                }
            }, status=status.HTTP_201_CREATED)
        
        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    """User login endpoint"""
    permission_classes = [permissions.AllowAny]
    authentication_classes = []
    
    def post(self, request):
        serializer = UserLoginSerializer(data=request.data, context={'request': request})
        
        if serializer.is_valid():
            user = serializer.validated_data['user']
            
            # Generate tokens
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'success': True,
                'message': 'Login successful',
                'data': {
                    'user': UserProfileSerializer(user).data,
                    'tokens': {
                        'refresh': str(refresh),
                        'access': str(refresh.access_token),
                    }
                }
            })
        
        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_401_UNAUTHORIZED)


class LogoutView(APIView):
    """User logout endpoint"""
    
    def post(self, request):
        try:
            # Update last logout time in login history
            LoginHistory.objects.filter(
                user=request.user,
                logout_time__isnull=True
            ).update(logout_time=timezone.now())
            
            logout(request)
            
            return Response({
                'success': True,
                'message': 'Logout successful'
            })
        except Exception as e:
            return Response({
                'success': False,
                'message': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ProfileView(generics.RetrieveUpdateAPIView):
    """Get and update user profile"""
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return self.request.user
    
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = UserUpdateSerializer(instance, data=request.data, partial=partial)
        
        if serializer.is_valid():
            serializer.save()
            return Response({
                'success': True,
                'message': 'Profile updated successfully',
                'data': UserProfileSerializer(instance).data
            })
        
        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class ChangePasswordView(APIView):
    """Change user password"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
        
        if serializer.is_valid():
            user = request.user
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            
            return Response({
                'success': True,
                'message': 'Password changed successfully'
            })
        
        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class LoginHistoryView(generics.ListAPIView):
    """Get user login history"""
    serializer_class = LoginHistorySerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return LoginHistory.objects.filter(user=self.request.user)[:20]  # Last 20 logins


class SecurityQuestionView(APIView):
    """Manage security questions"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        questions = SecurityQuestion.objects.filter(user=request.user)
        serializer = SecurityQuestionSerializer(questions, many=True)
        return Response({
            'success': True,
            'data': serializer.data
        })
    
    def post(self, request):
        serializer = SecurityQuestionSerializer(data=request.data)
        
        if serializer.is_valid():
            # Check if user already has 3 questions
            if SecurityQuestion.objects.filter(user=request.user).count() >= 3:
                return Response({
                    'success': False,
                    'message': 'Maximum 3 security questions allowed'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            serializer.save(user=request.user)
            return Response({
                'success': True,
                'message': 'Security question added',
                'data': serializer.data
            }, status=status.HTTP_201_CREATED)
        
        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, question_id):
        try:
            question = SecurityQuestion.objects.get(id=question_id, user=request.user)
            question.delete()
            return Response({
                'success': True,
                'message': 'Security question deleted'
            })
        except SecurityQuestion.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Question not found'
            }, status=status.HTTP_404_NOT_FOUND)


class NotificationPreferenceView(generics.RetrieveUpdateAPIView):
    """Get and update notification preferences"""
    serializer_class = NotificationPreferenceSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        prefs, created = NotificationPreference.objects.get_or_create(user=self.request.user)
        return prefs


class PasswordResetRequestView(APIView):
    """Request password reset"""
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        
        if serializer.is_valid():
            email = serializer.validated_data['email']
            user = User.objects.get(email=email)
            
            # Here you would generate a token and send email
            # For now, just return success
            return Response({
                'success': True,
                'message': 'Password reset email sent'
            })
        
        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class PasswordResetConfirmView(APIView):
    """Confirm password reset"""
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        
        if serializer.is_valid():
            # Here you would validate token and reset password
            # For now, just return success
            return Response({
                'success': True,
                'message': 'Password reset successful'
            })
        
        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class DeleteAccountView(APIView):
    """Delete user account"""
    permission_classes = [permissions.IsAuthenticated]
    
    def delete(self, request):
        user = request.user
        # Soft delete or hard delete?
        user.is_active = False
        user.save()
        
        return Response({
            'success': True,
            'message': 'Account deactivated successfully'
        })


class VerifyEmailView(APIView):
    """Verify email address"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        # Here you would verify email token
        user = request.user
        user.is_email_verified = True
        user.save()
        
        return Response({
            'success': True,
            'message': 'Email verified successfully'
        })


class Toggle2FAView(APIView):
    """Toggle two-factor authentication"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        user = request.user
        user.is_2fa_enabled = not user.is_2fa_enabled
        user.save()
        
        return Response({
            'success': True,
            'message': f'2FA {"enabled" if user.is_2fa_enabled else "disabled"}',
            'is_2fa_enabled': user.is_2fa_enabled
        })


class CheckAuthView(APIView):
    """Check if user is authenticated"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        return Response({
            'success': True,
            'is_authenticated': True,
            'user': UserProfileSerializer(request.user).data
        })