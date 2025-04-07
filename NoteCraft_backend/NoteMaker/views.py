from rest_framework.response import Response
from rest_framework.request import Request
from rest_framework.views import APIView
from typing import Dict
from .myutils import request_OpenRouter,google_search_image,get_context,topics_query,new_image
from requests.exceptions import RequestException
import requests
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from rest_framework import status
import json
class HelloWorldView(APIView):
    def get(self, request:Request)->Response:
        return Response({"message": "Hello, world!"})

class GenerateNoteView(APIView):
    def post(self, request:Request)->Response:
        params = request.data.get("params", {}) # type: ignore

        if not isinstance(params, dict):
            return Response({"error": "params must be a dictionary"}, status=400)

        query = params.get("query", "")
        if not query:
            return Response({"error": "query parameter is required"}, status=400)

        prompt = query + topics_query
        try:
            response:str=request_OpenRouter(prompt)
            start:int = response.find("```json") + len("```json")
            end:int = response.find("```", start)
            json_str:str = response[start:end].strip()
            fresponse:Dict=json.loads(json_str)
        except (TypeError,RequestException) as e:
            return Response({"message": "Error in response from OpenRouter","error": str(e)},status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        context=get_context(prompt,namespace=fresponse['namespace'])



        prompt:str= "Objective: Act as an expert academic note-taking assistant. " \
        f"Generate comprehensive, well-structured notes on {fresponse['topics']}\
        InstructionsStructure: Organize notes hierarchically with headings, subheadings and keep theword count high,\
        Focus on clarity, accuracy, and relevance do not add double new line or meta text ever\
        to include images write &&&image:(description of image)&&& at the place where you want to add the image this should be done in between the text\
        example- &&&image:(diagram of the human eye)&&& use 1-2 images per heading at max\
        output should be in ```markdown box keep the markup syntax the notes should always be generated in full length and no meta text shouldbe there \
        examples where applicable.Context: {context}"
        try:
            notes:str=request_OpenRouter(prompt)
            start = notes.find("```markdown") + len("```markdown")
            end = notes.find("```", start)
            notes=notes[start:end].strip()
        except (TypeError,RequestException) as e:
            return Response({"message": "Error in response from OpenRouter","error": str(e)},status=status.HTTP_500_INTERNAL_SERVER_ERROR)


        arr=notes.split("&&&")
        processed_notes = []

        for line in arr:
                if line.startswith("image:"):
                    image_query = line.split("image:", 1)[1].strip()
                    image_url = google_search_image(image_query)
                    processed_notes.append(f"![{image_query}]({image_url})")
                else:
                    processed_notes.append(line)

        return Response({"message": "Notes generated successfully","notes": "".join(processed_notes)})


class ModifyTextView(APIView):
    def post(self,request:Request)->Response:
        change_text:str=request.data.get("text") # type: ignore
        print(change_text)
        try:
            response:str=request_OpenRouter(change_text+"rework this part of text to get more clarity and elaborate the ouput should be in ```text box the new content should not be more than 3 times original lenght")
            start:int = response.find("```text") + len("```text")
            end:int = response.find("```", start)
            new_text:str = response[start:end].strip()
            return Response({"message": "Text modified successfully","modifiedContent": new_text})
        except (TypeError,RequestException) as e:
            return Response({"message": "Error in response from OpenRouter","error": str(e)},status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ModifyImageView(APIView):
    def post(self,request:Request)->Response:
        change_image:str=request.data.get("imgText") # type: ignore
        try:
            new_image_url:str=new_image(change_image)
            return Response({"message": "Image modified successfully","modifiedContent": f"![{change_image}]({new_image_url})"})
        except (TypeError,RequestException) as e:
            return Response({"message": "Error in response from OpenRouter","error": str(e)},status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@method_decorator(csrf_exempt, name='dispatch')
class ProxyImageView(APIView):
    def get(self, request, *args, **kwargs):
        # Get the image URL from the query parameters
        image_url = request.query_params.get('url', None)
        if not image_url:
            return Response({"error": "Image URL is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Fetch the image from the external URL
            response = requests.get(image_url, stream=True)
            response.raise_for_status()

            # Set CORS headers
            http_response = HttpResponse(
                response.raw,
                content_type=response.headers.get('Content-Type')
            )
            http_response['Access-Control-Allow-Origin'] = '*'

            return http_response

        except requests.RequestException as e:
            return Response({"error": f"Failed to fetch image: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
