from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser
from rest_framework import status
from .models import Document
from .serializer import DocumentSerializer,UserSerializer
import cloudinary.uploader
from rest_framework_simplejwt.views import TokenObtainPairView


class DocumentUploadView(APIView):
    parser_classes = [MultiPartParser]
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        # Get the uploaded file from the request
        pdf_file = request.FILES.get('pdf_file')
        topic = request.data.get('topic')

        if not pdf_file or not topic:
            return Response({'error': 'Both topic and PDF file are required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Upload the file to Cloudinary
            upload_result = cloudinary.uploader.upload(
                pdf_file,
                resource_type="raw",  # Use "raw" for non-image files like PDFs
                folder="documents"    # Optional: Organize files in a folder
            )

            # Save the Cloudinary URL to the database
            document = Document.objects.create(
                topic=topic,
                pdf_url=upload_result['secure_url'],  # Secure URL for the uploaded file
                uploaded_by=request.user
            )

            # Serialize and return the response
            serializer = DocumentSerializer(document)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class SignupView(APIView):
    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(TokenObtainPairView):
    pass
