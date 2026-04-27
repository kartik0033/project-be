from django.urls import path
from .views import AISummaryView

urlpatterns = [
    path('summarize/', AISummaryView.as_view(), name='ai-summarize'),
]
