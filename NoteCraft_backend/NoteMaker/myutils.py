from typing import Dict, List, Any
import os
import requests
import json
from dotenv import load_dotenv
from pinecone import Pinecone
from google_images_search import GoogleImagesSearch
from requests.exceptions import RequestException
from django.core.cache import cache
import random
load_dotenv()
global gis
gis = GoogleImagesSearch(developer_key=os.getenv("GOOGLE_API_KEY"), custom_search_cx=os.getenv("CX"))

OR_API_KEY=os.getenv("OPEN_ROUTER_API_KEY")
pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
index = pc.Index("notecraft")

topics_query:str="Generate 10 subtopics that should be covered in this topic from an academic perspective. " \
"If subtopics are already present in the content, retain them without modification. " \
    "The output should only contain the subtopics and not the content." \
    """the output should in form of raw json in the ```json box nothing else in format- namespace:(one of namespace from given list)""" \
    "topics:(list of stings no numbers or bullets eg- ['subtopic1','subtopic2']) "\
    "eg-{'namespace': 'cs_math', 'topics': ['machine_learning_algorithms', ....]}"\
    "namespace list-physics,chemistry,energy_sustainability,mathematics_applied_math,earth_sciences,psychology_cognitive_science,biology,medicine,agriculture_food_science,engineering,technology_innovation,cs_math,social_sciences,arts_humanities,business_management,history,law_policy,philosophy_ethics"

def request_OpenRouter(query:str)->str:
    response = requests.post(
        url="https://openrouter.ai/api/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {OR_API_KEY}",
            "Content-Type": "application/json",
        },
        data=json.dumps({
            "model": "qwen/qwq-32b:free",
            "messages": [
            {
                "role": "user",
                "content": f"{query}"
            }
            ],
            "parameters": {
        "language": "en"  # Specify language preference
    }

        })
        )
    return response.json()['choices'][0]['message']['content']



def get_context(topic:str,namespace:str)->Dict:

    try:
        query_embedding=pc.inference.embed(
                model="llama-text-embed-v2",
                inputs=[topic],
                parameters={"input_type": "query"},
            )[0].values
        results = index.query(
                namespace=namespace,
                vector=query_embedding,
                top_k=3,
                include_metadata=True
            )
        if results.matches: # type: ignore
                # Fetch relevant documents from Pinecone
                relevant_docs = [
                    match.metadata["text"] for match in results.matches # type: ignore
                ]
                return {"message": "Relevant documents found", "documents": relevant_docs}
        else:
            return{"message":"No relevant documents found"}
    except Exception as e:
            print(e)
            return {"message": "Error querying Pinecone", "error": str(e)}


def google_search_image(query: str) -> str:

    try:
        gis.search(search_params={'q': query, 'num': 1})
        image_url = gis.results()[0].url if gis.results() else "https://via.placeholder.com/150"

        return image_url
    except (IndexError, RequestException):
        return "https://via.placeholder.com/150"

def new_image(query:str)->str:
    gis.search(search_params={'q': query, 'num': 5})
    image_url = gis.results()[random.randint(0,5)].url if gis.results() else "https://via.placeholder.com/150"
    return image_url
if __name__ == "__main__":
    print(google_search_image("Eiffel Tower"))
