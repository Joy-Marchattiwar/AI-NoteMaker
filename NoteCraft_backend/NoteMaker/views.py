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
            return Response({"message": "Error in response from OpenRouter","error": str(e)},status=500)
        query_context=[]
        for topic in response:
            context=get_context(topic)
            if context.get("documents"):
                query_context.append(context.get("documents"))
            
            

        prompt:str= "Objective: Act as an expert academic note-taking assistant. " \
        f"Generate comprehensive, well-structured notes on {response}  Use clear formatting, concise language, and include images \
        InstructionsStructure: Organize notes hierarchically with headings, subheadings,\
        and bullet points.Content: Focus on clarity, accuracy, and relevance. Summarize key ideas and include \
        examples where applicable.Visuals: Add images they enhance understanding \
        where there is a need for image write :&&&image:(description of the image for google search)&&& \
        Context: {query_context}" 
        try:
            notes=request_OpenRouter(prompt)
            # notes=response[8:-3]
        except (TypeError,RequestException) as e:
            return Response({"message": "Error in response from OpenRouter","error": str(e)},status=500)
        return Response({"Notes": notes})


