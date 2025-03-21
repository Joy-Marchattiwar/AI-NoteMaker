from rest_framework.response import Response
from rest_framework.request import Request
from rest_framework.views import APIView
from typing import Dict
from .myutils import *
from requests.exceptions import RequestException
from google_images_search import GoogleBackendException
class HelloWorldView(APIView):
    def get(self, request:Request)->Response:
        return Response({"message": "Hello, world!"})

class GenerateNoteView(APIView):
    def post(self, request:Request)->Response:
        query:Dict= request.data
        query=query.get("query")+topics_query
        try:
            response=request_OpenRouter(query)
            start = response.find("```json") + len("```json")
            end = response.find("```", start)
            json_str = response[start:end].strip()
            response=json.loads(json_str)
            print(response)
        except (TypeError,RequestException) as e:
            return Response({"message": "Error in response from OpenRouter","error": str(e)},status=500)
        context=get_context(query,namespace=response['namespace'])
            
            

        prompt:str= "Objective: Act as an expert academic note-taking assistant. " \
        f"Generate comprehensive, well-structured notes on {response['topics']}\
        InstructionsStructure: Organize notes hierarchically with headings, subheadings and keep theword count high,\
        and bullet points.Content: Focus on clarity, accuracy, and relevance. Summarize key ideas and include \
        outpu should be in ```text box\
        examples where applicable.Context: {context}" 
        try:
            notes=request_OpenRouter(prompt)
            start = notes.find("```text") + len("```text")
            end = notes.find("```", start)
            notes=notes[start:end].strip()
        except (TypeError,RequestException) as e:
            return Response({"message": "Error in response from OpenRouter","error": str(e)},status=500)
        
        images_prompt:str="taking these notes and add images to make them more engaging and visually appealing.\
        to include images write &&&image:(description of image)&&& at the place where you want to add the image this should be done in between the text\
        example- &&&image:(diagram of the human eye)&&&\
        the image should be google searchable keep notes as it is or add anything relevent to images\
        output should be in ```text box"

        try:
            imaged_notes=request_OpenRouter(notes+images_prompt)
            start = imaged_notes.find("```text") + len("```text")
            end = imaged_notes.find("```", start)
            imaged_notes=imaged_notes[start:end].strip()
        except (TypeError,RequestException) as e:
            return Response({"message": "Error in response from OpenRouter","error": str(e)},status=500)
        
        arr=imaged_notes.split("&&&")
        for i in range(len(arr)):
            if arr[i].startswith("image:"):
                image_query=arr[i].split("image:")[1]
                try:
                    arr[i]=google_search_image(image_query)
                except (TypeError,RequestException,GoogleBackendException) as e:
                    return Response({"message": "Error in response from Fetching Images","error": str(e)},status=500)
        
        return Response({"message": "Notes generated successfully","notes": arr})


