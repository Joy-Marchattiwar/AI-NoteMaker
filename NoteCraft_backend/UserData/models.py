from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    # Add any additional fields here if needed
    pass
class Document(models.Model):
    topic = models.CharField(max_length=255)
    pdf_url = models.CharField(max_length=500)  # Store the Cloudinary URL
    uploaded_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='documents')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.topic
