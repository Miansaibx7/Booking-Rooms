from django.contrib.auth import authenticate

from rest_framework import generics
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.reverse import reverse
from rest_framework.authtoken.models import Token
from rest_framework.views import APIView
from rest_framework.exceptions import AuthenticationFailed
from rest_framework import permissions
from rest_framework.exceptions import PermissionDenied

from .models import Room,OccupiedDate,User
from .serializers import RoomSerializer,OccupiedDateSerializer,UserSerializer
from .permissions import IsAdminOrReadOnly


@api_view(['GET'])
def api_root(request,format=None):
    return Response({
        'rooms':reverse('room-list',request=request,format=format)
    })
    

class RoomList(generics.ListCreateAPIView):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer
    permission_classes = [IsAdminOrReadOnly]
    


class RoomDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer
    permission_classes = [IsAdminOrReadOnly]
    
    
class OccupiedDatesList(generics.ListCreateAPIView):
    queryset = OccupiedDate.objects.all()
    serializer_class = OccupiedDateSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        user  = self.request.user
        if not user.is_authenticated:
            return OccupiedDate.objects.none()
        if not user.is_superuser and not user.is_staff:
            return OccupiedDate.objects.filter(user=user)
        return super().get_queryset()


class OccupiedDatesDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = OccupiedDate.objects.all()
    serializer_class = OccupiedDateSerializer
    permission_classes = [IsAdminOrReadOnly]
    
    
class UserList(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.is_staff or user.is_superuser:
            return User.objects.all()
        else:
            return User.objects.filter(id=user.id)
    
    
class UserDetail(generics.RetrieveAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        obj = super().get_object()
        user = self.request.user
        if obj == user or user.is_staff or user.is_superuser:
            return obj
        raise PermissionDenied("You do not have permission to access this user's details.")
        
        
class Register(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    
    def perform_create(self, serializer):
        user = serializer.save()
        token, created = Token.objects.get_or_create(user=user)
        
        self.response_data ={
            "user":{
                "id" : user.id,
                "username" : user.email,
                "email" : user.email,
                "full_name": user.full_name
            },
            "token":token.key
        }
        
    def create(self, request, *args, **kwargs):
        super().create(request, *args, **kwargs)
        return Response(self.response_data)
    
    
class Login(APIView):
    def post(self,request,*args,**kwargs):
        username = request.data.get("username")
        password = request.data.get("password")
        
        user = authenticate(username=username, password=password)
        
        if user is None:
            raise AuthenticationFailed("Invalid username or password")
        
        token,created = Token.objects.get_or_create(user=user)
        return Response({
            "user":{
                "id" : user.id,
                "username" : user.email,
                "email" : user.email,
                "full_name": user.full_name
            },
            "token":token.key
        })
        
        
