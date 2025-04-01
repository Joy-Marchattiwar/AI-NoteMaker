from django.db import models
from django.contrib.auth.models import AbstractUser
import uuid
class User(AbstractUser):
    # Add any additional fields here if needed
    pass
class Document(models.Model):
    id = models.UUIDField(primary_key=True,default=uuid.uuid4,editable=False)
    topic = models.CharField(max_length=255)
    pdf_public_id = models.CharField(max_length=500)  
    uploaded_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='documents')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    first_page=models.CharField()

    def __str__(self):
        return self.topic
