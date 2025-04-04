from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser
from rest_framework import status,permissions
from .models import Document
from .serializer import DocumentSerializer,UserSerializer
import cloudinary.uploader
from django.core.cache import cache
from rest_framework.request import Request
import uuid
from dotenv import load_dotenv
import base64
import requests
from cloudinary.utils import cloudinary_url
import os
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import TokenError,AuthenticationFailed
import fitz
from django.core.files.uploadedfile import InMemoryUploadedFile
load_dotenv()
cloudinary.config(
    cloud_name=os.getenv('CLOUDINARY_NAME'),
    api_key=os.getenv('CLOUDINARY_API'),
    api_secret =os.getenv('CLOUDINARY_KEY'),
)

config = cloudinary.config(secure=True)


def get_first_page_as_base64(pdf:InMemoryUploadedFile)->str:
    doc=fitz.open(stream=pdf.read(),filetype="pdf")
    page=doc[0]
    pix=page.get_pixmap().tobytes("png") # type: ignore
    return base64.b64encode(pix).decode("utf-8")

class DocumentUploadView(APIView):
    parser_classes = [MultiPartParser]
    permission_classes = [IsAuthenticated]

    def post(self, request:Request)->Response:
        if not request.FILES:
            return Response({"error":"No files found"},status=status.HTTP_400_BAD_REQUEST)
        name:str
        file:InMemoryUploadedFile
        for name, file in request.FILES.items(): # type: ignore
            print(name,file)
            img=get_first_page_as_base64(file)
            try:
                file.seek(0)
                upload_result = cloudinary.uploader.upload(
                    file=file.read(),
                    resource_type="raw",  
                    folder="documents"   
                )
                document = Document.objects.create(
                    id=uuid.uuid4(),
                    topic=name,
                    pdf_public_id=upload_result['secure_url'],  
                    uploaded_by=request.user,
                    first_page=img
                )
                serializer= DocumentSerializer(document)
                return Response(serializer.data,status=status.HTTP_201_CREATED)
            except Exception as e:
                return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



        return Response({"message":"File uploaded successfully"},status=status.HTTP_200_OK)

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

        query:str = request.query_params.get("topic","")
        if not query:
            return Response({"error": "Topic is required"},status=status.HTTP_400_BAD_REQUEST)
        
        documents = Document.objects.filter(topic__icontains=query)
        if not documents:
            return Response({"error":"No Pdfs Found"},status=status.HTTP_204_NO_CONTENT)
        results :list = []
        for doc in documents:
            # first_page_base64: str|None = get_first_page_as_base64(doc.pdf_public_id)

            results.append({
                "id": str(doc.id),
                "topic": doc.topic,
                "pdf_url": doc.pdf_public_id,
                "first_page_base64": doc.first_page,
                "uploaded_by": doc.uploaded_by.username,
                "created_at": doc.uploaded_at.strftime("%Y-%m-%d %H:%M:%S"),
            })
        
        return Response({"result":results},status=status.HTTP_200_OK)

class LogoutView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        try:
            refresh_token = request.data["refresh"]
            
            if not refresh_token:
                return Response({"detail": "Refresh token is required."}, status=status.HTTP_400_BAD_REQUEST)
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response(status=status.HTTP_205_RESET_CONTENT)
        except TokenError as e:
            return Response({"error":str(e)},status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error":str(e)},status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
class AuthStatusView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            return Response({"loggedIn": True},status=status.HTTP_200_OK)
        except AuthenticationFailed:
            return Response({"loggedIn": False}, status=status.HTTP_401_UNAUTHORIZED)