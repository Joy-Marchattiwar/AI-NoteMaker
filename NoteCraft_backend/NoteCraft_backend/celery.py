# your_project/celery.py
import os
from celery import Celery

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'NoteCraft_backend.settings') 

app = Celery('NoteCraft')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()
