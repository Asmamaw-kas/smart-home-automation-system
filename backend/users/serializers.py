"""
Serializers for user authentication and profile management
"""
from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.utils import timezone
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User, LoginHistory, SecurityQuestion, NotificationPreference

class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration"""
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)
    
    class Meta:
        model = User
        fields = ['username', 'password', 'password2', 'email', 'first_name', 
                 'last_name', 'phone_number']
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(**validated_data)
        
        # Create notification preferences for the user
        NotificationPreference.objects.create(user=user)
        
        return user


class UserLoginSerializer(serializers.Serializer):
    """Serializer for user login"""
    username = serializers.CharField(required=True)
    password = serializers.CharField(required=True, write_only=True)
    
    def validate(self, attrs):
        username = attrs.get('username')
        password = attrs.get('password')
        
        # Get request object from context
        request = self.context.get('request')
        
        try:
            user = User.objects.get(username=username)
            
            # Check if account is locked
            if user.is_account_locked():
                # Log failed attempt
                if request:
                    LoginHistory.objects.create(
                        user=user,
                        ip_address=request.META.get('REMOTE_ADDR'),
                        user_agent=request.META.get('HTTP_USER_AGENT', ''),
                        status='locked'
                    )
                raise serializers.ValidationError({
                    "error": "Account is locked due to too many failed attempts. Try again later."
                })
            
            # Authenticate user
            user = authenticate(username=username, password=password)
            
            if not user:
                # Increment failed login attempts
                user = User.objects.get(username=username)
                user.increment_login_attempts()
                
                # Log failed attempt
                if request:
                    LoginHistory.objects.create(
                        user=user,
                        ip_address=request.META.get('REMOTE_ADDR'),
                        user_agent=request.META.get('HTTP_USER_AGENT', ''),
                        status='failed'
                    )
                
                raise serializers.ValidationError({
                    "error": "Unable to log in with provided credentials."
                })
            
            # Reset login attempts on successful login
            user.reset_login_attempts()
            
            # Update last login
            user.last_login = timezone.now()
            user.last_login_ip = request.META.get('REMOTE_ADDR') if request else None
            user.save()
            
            # Log successful login
            if request:
                LoginHistory.objects.create(
                    user=user,
                    ip_address=request.META.get('REMOTE_ADDR'),
                    user_agent=request.META.get('HTTP_USER_AGENT', ''),
                    device_type=self.get_device_type(request),
                    browser=self.get_browser(request),
                    os=self.get_os(request),
                    status='success'
                )
            
        except User.DoesNotExist:
            raise serializers.ValidationError({
                "error": "User does not exist."
            })
        
        attrs['user'] = user
        return attrs
    
    def get_device_type(self, request):
        """Determine device type from user agent"""
        user_agent = request.META.get('HTTP_USER_AGENT', '').lower()
        
        if 'mobile' in user_agent:
            return 'mobile'
        elif 'tablet' in user_agent or 'ipad' in user_agent:
            return 'tablet'
        elif 'windows' in user_agent or 'mac' in user_agent or 'linux' in user_agent:
            return 'desktop'
        return 'unknown'
    
    def get_browser(self, request):
        """Extract browser info from user agent"""
        user_agent = request.META.get('HTTP_USER_AGENT', '')
        
        if 'chrome' in user_agent.lower():
            return 'Chrome'
        elif 'firefox' in user_agent.lower():
            return 'Firefox'
        elif 'safari' in user_agent.lower():
            return 'Safari'
        elif 'edge' in user_agent.lower():
            return 'Edge'
        return 'Unknown'
    
    def get_os(self, request):
        """Extract OS info from user agent"""
        user_agent = request.META.get('HTTP_USER_AGENT', '').lower()
        
        if 'windows' in user_agent:
            return 'Windows'
        elif 'mac' in user_agent:
            return 'macOS'
        elif 'linux' in user_agent:
            return 'Linux'
        elif 'android' in user_agent:
            return 'Android'
        elif 'ios' in user_agent or 'iphone' in user_agent or 'ipad' in user_agent:
            return 'iOS'
        return 'Unknown'


class TokenResponseSerializer(serializers.Serializer):
    """Serializer for JWT token response"""
    access = serializers.CharField()
    refresh = serializers.CharField()
    user = serializers.DictField()


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for user profile"""
    full_name = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'full_name',
                 'phone_number', 'profile_picture', 'notification_enabled', 
                 'theme_preference', 'date_joined', 'last_login']
        read_only_fields = ['id', 'date_joined', 'last_login']
    
    def get_full_name(self, obj):
        return obj.get_full_name()


class UserUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating user profile"""
    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'email', 'phone_number', 
                 'profile_picture', 'theme_preference', 'notification_enabled']


class ChangePasswordSerializer(serializers.Serializer):
    """Serializer for changing password"""
    old_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(required=True, write_only=True, validators=[validate_password])
    new_password2 = serializers.CharField(required=True, write_only=True)
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password2']:
            raise serializers.ValidationError({"new_password": "Password fields didn't match."})
        return attrs
    
    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Old password is incorrect.")
        return value


class LoginHistorySerializer(serializers.ModelSerializer):
    """Serializer for login history"""
    class Meta:
        model = LoginHistory
        fields = ['id', 'login_time', 'logout_time', 'ip_address', 'device_type',
                 'browser', 'os', 'location', 'status']


class SecurityQuestionSerializer(serializers.ModelSerializer):
    """Serializer for security questions"""
    class Meta:
        model = SecurityQuestion
        fields = ['id', 'question', 'answer', 'created_at']
        extra_kwargs = {
            'answer': {'write_only': True}
        }


class NotificationPreferenceSerializer(serializers.ModelSerializer):
    """Serializer for notification preferences"""
    class Meta:
        model = NotificationPreference
        fields = ['email_login_alerts', 'email_device_alerts', 'email_security_alerts',
                 'email_daily_summary', 'push_enabled', 'push_login_alerts',
                 'push_device_alerts', 'sms_enabled', 'sms_phone_number', 'sms_alerts']


class PasswordResetRequestSerializer(serializers.Serializer):
    """Serializer for password reset request"""
    email = serializers.EmailField(required=True)
    
    def validate_email(self, value):
        try:
            user = User.objects.get(email=value)
        except User.DoesNotExist:
            raise serializers.ValidationError("No user found with this email address.")
        return value


class PasswordResetConfirmSerializer(serializers.Serializer):
    """Serializer for password reset confirmation"""
    token = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, validators=[validate_password])
    new_password2 = serializers.CharField(required=True)
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password2']:
            raise serializers.ValidationError({"new_password": "Password fields didn't match."})
        return attrs