from django.urls import path

from rest_framework.urlpatterns import format_suffix_patterns

from Room_Booking import views

urlpatterns =[
    path('',views.api_root,name="api-root"),
    path('rooms/',views.RoomList.as_view(),name='room-list'),
    path('rooms/<int:pk>/',views.RoomDetail.as_view(),name='room-detail'),
    path('occupied-dates/',views.OccupiedDatesList.as_view(),name='occupieddate-list'),
    path('occupied-dates/<int:pk>/',views.OccupiedDatesDetail.as_view(),name='occupieddate-detail'),
    path('users/',views.UserList.as_view(),name='user-list'),
    path('users/<int:pk>/',views.UserDetail.as_view(),name='user-detail'),
    path('register/',views.Register.as_view(),name='register'),
    path('login/',views.Login.as_view(),name='login')
]

urlpatterns = format_suffix_patterns(urlpatterns)



# For Offline Images
from django.conf import settings
from django.conf.urls.static import static

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL,document_root=settings.MEDIA_ROOT)
    