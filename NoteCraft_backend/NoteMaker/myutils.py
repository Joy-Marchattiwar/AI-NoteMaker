from typing import Dict, List, Any
import os
import requests
import json
from dotenv import load_dotenv
from pinecone import Pinecone
from llama_index.readers.papers import ArxivReader


load_dotenv()
OR_API_KEY=os.getenv("OPEN_ROUTER_API_KEY")
pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
index = pc.Index("notecraft") 
arxiv_reader = ArxivReader()

topics_query:str="Generate 10-15 subtopics that should be covered in this topic from an academic perspective. " \
"If subtopics are already present in the content, retain them without modification. " \
"Ensure the subtopics are comprehensive, logically structured, and relevant to the subject matter." \
    "The output should only contain the subtopics and not the content." \
    "the output should in form list of stings no numbers or bullets eg- ['subtopic1','subtopic2']"

def request_OpenRouter(query:str)->Any:
    response = requests.post(
        url="https://openrouter.ai/api/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {OR_API_KEY}",
            "Content-Type": "application/json",
        },
        data=json.dumps({
            "model": "deepseek/deepseek-r1-zero:free",
            "messages": [
            {
                "role": "user",
                "content": f"{query}"
            }
            ],
            
        })
        )
    return response.json()['choices'][0]['message']['content']



def get_context(topic:str)->List[str]:
    try:
        print(topic)
        query_embedding=pc.inference.embed(
                model="llama-text-embed-v2",
                inputs=[topic],
                parameters={"input_type": "query"},
            )
        results = index.query(
                namespace="ns1",  
                vector=query_embedding,
                top_k=2, 
                include_metadata=True
            )
        if results.matches:
                # Fetch relevant documents from Pinecone
                relevant_docs = [match.metadata["text"] for match in results.matches]
                print(relevant_docs)
                return {"message": "Relevant documents found", "documents": relevant_docs}

    except Exception as e:
            print(e)
            return {"message": "Error querying Pinecone", "error": str(e)}
