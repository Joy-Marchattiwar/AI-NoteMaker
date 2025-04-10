# tasks.py
import json
from .myutils import get_context, google_search_image, request_OpenRouter
from celery import shared_task

@shared_task
def generate_notes_task(prompt_1:str) -> dict:
    try:
        response_1 = request_OpenRouter(prompt_1)
        # Extract JSON
        start = response_1.find("```json") + len("```json")
        end = response_1.find("```", start)
        json_str = response_1[start:end].strip()
        fresponse = json.loads(json_str)
        
        context = get_context(prompt_1, namespace=fresponse['namespace'])

        prompt_2:str= "Objective: Act as an expert academic note-taking assistant. " \
        f"Generate comprehensive, well-structured notes on {fresponse['topics']} with all tpics covered if context given later is irrelevent to topics, ignore it\
        InstructionsStructure: Organize notes hierarchically with headings, subheadings and keep theword count high,\
        Focus on clarity, accuracy, and relevance do not add double new line or meta text ever\
        to include images write &&&image:(description of image)&&& at the place where you want to add the image this should be done in between the text\
        example- &&&image:(diagram of the human eye)&&& use 2-3 images per heading at max\
        output should be in ```markdown box keep the markup syntax the notes should have plenty text \
        examples where applicable.Context: {context}"
        notes = request_OpenRouter(prompt_2)
        start = notes.find("```markdown") + len("```markdown")
        end = notes.find("```", start)
        notes = notes[start:end].strip()

        arr = notes.split("&&&")
        processed_notes = []
        for line in arr:
            if line.startswith("image:"):
                image_query = line.split("image:", 1)[1].strip()
                image_url = google_search_image(image_query)
                processed_notes.append(f"![{image_query}]({image_url})")
            else:
                processed_notes.append(line)

        return {"success": True, "notes": "".join(processed_notes)}
    except Exception as e:
        return {"success": False, "error": str(e)}
