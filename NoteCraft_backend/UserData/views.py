from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser
from rest_framework import status
from .models import Document
from .serializer import DocumentSerializer,UserSerializer
import cloudinary.uploader
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.request import Request
import uuid
from dotenv import load_dotenv
import base64
import requests
from cloudinary.utils import cloudinary_url
import os
load_dotenv()
cloudinary.config(
    cloud_name=os.getenv('CLOUDINARY_NAME'),
    api_key=os.getenv('CLOUDINARY_API'),
    api_secret =os.getenv('CLOUDINARY_KEY'),
)

config = cloudinary.config(secure=True)


def get_first_page_as_base64(pdf_public_id:str)->str|None:
    image_url, _ = cloudinary_url(
        pdf_public_id + ".jpg",
        transformation=[{"pg": 1, "width": 300, "height": 400, "crop": "scale"}]
    )
    response = requests.get(image_url)
    if response.status_code == 200:
        return base64.b64encode(response.content).decode("utf-8")
    return None


class DocumentUploadView(APIView):
    parser_classes = [MultiPartParser]
    permission_classes = [IsAuthenticated]

    def post(self, request:Request)->Response:
        # Get the uploaded file from the request
        pdf_file = request.FILES.get('pdf_file')
        topic = request.data.get('topic','untitled')

        if not pdf_file or not topic:
            return Response({'error': 'Both topic and PDF file are required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Upload the file to Cloudinary
            upload_result = cloudinary.uploader.upload(
                pdf_file,
                resource_type="raw",  
                folder="documents"   
            )

            document = Document.objects.create(
                id=uuid.uuid4(),
                topic=topic,
                pdf_public_id=upload_result['secure_url'],  
                uploaded_by=request.user
            )

            # Serialize and return the response
            serializer = DocumentSerializer(document)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class SignupView(APIView):
    def post(self, request:Request)->Response:
        serializer = UserSerializer(data=request.data)
        print(request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(TokenObtainPairView):
    pass

class ListDocumentView(APIView):
    def get(self, request:Request)->Response:
        query:str = request.data.get("topic","")
        if not query:
            return Response({"error": "Topic is required"},status=status.HTTP_400_BAD_REQUEST)
        
        documents = Document.objects.filter(topic__icontains=query)
        if not documents:
            return Response({"error":"No Pdfs Found"},status=status.HTTP_204_NO_CONTENT)
        results :list = []
        for doc in documents:
            first_page_base64: str|None = get_first_page_as_base64(doc.pdf_public_id)
            pdf_url:str = f"https://res.cloudinary.com/dgokujqii/raw/upload/{doc.pdf_public_id}.pdf"

            results.append({
                "id": str(doc.id),
                "topic": doc.topic,
                "pdf_url": pdf_url,
                "first_page_base64": first_page_base64,
                "uploaded_by": doc.uploaded_by.username,
                "created_at": doc.uploaded_at.strftime("%Y-%m-%d %H:%M:%S"),
            })
        
        return Response({"result":results},status=status.HTTP_200_OK)