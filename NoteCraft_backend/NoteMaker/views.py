from django.http import JsonResponse
from rest_framework.response import Response
from rest_framework.request import Request
from rest_framework.views import APIView
from typing import Dict
from .myutils import *
from requests.exceptions import RequestException
class HelloWorldView(APIView):
    def get(self, request:Request)->Response:
        return Response({"message": "Hello, world!"})

class GenerateNoteView(APIView):
    def post(self, request:Request)->Response:
        query:Dict= request.data
        query=query.get("query")+topics_query
        try:
            response=request_OpenRouter(query)
            response=list(response[8:-3].split(","))
        except (TypeError,RequestException) as e:
            return Response({"message": "Error in response from OpenRouter","error": str(e)})

        return JsonResponse(get_context(response[0]))
            

