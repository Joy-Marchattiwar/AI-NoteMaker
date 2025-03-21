from typing import Dict, List, Any
import os
import requests
import json
from dotenv import load_dotenv
from pinecone import Pinecone
from llama_index.readers.papers import ArxivReader
from llama_index.readers.papers import PubmedReader
import threading

load_dotenv()
OR_API_KEY=os.getenv("OPEN_ROUTER_API_KEY")
pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
index = pc.Index("notecraft") 
arxiv_reader = PubmedReader()

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
            "parameters": {
        "language": "en"  # Specify language preference
    }
            
        })
        )
    return response.json()['choices'][0]['message']['content']



def get_context(topic:str)->Dict:
    try:
        query_embedding=pc.inference.embed(
                model="llama-text-embed-v2",
                inputs=[topic],
                parameters={"input_type": "query"},
            )[0].values
        results = index.query(
                namespace="ns1",  
                vector=query_embedding,
                top_k=1, 
                include_metadata=True
            )
        if results.matches:
                # Fetch relevant documents from Pinecone
                relevant_docs = [
                    match.metadata["text"] for match in results.matches 
                    if match.score >=0.2
                ]

                if relevant_docs:return {"message": "Relevant documents found", "documents": relevant_docs}
    except Exception as e:
            print(e)
            return {"message": "Error querying Pinecone", "error": str(e)}
    
    try:
            arxiv_docs = fetch_arxiv_docs(topic)
            # Generate embeddings for the new documents and store them in Pinecone
            threading.Thread(
                target=store_documents_in_pinecone,
                args=(arxiv_docs,)
            ).start()
            return {"message": "Fetched documents from arXiv", "documents": arxiv_docs[0]}
    
    except Exception as e:
            return {"message": "Error fetching documents from arXiv", "error": str(e)}

    

def fetch_arxiv_docs(search_query: str) -> List[str]:
    """
    Fetch relevant documents from arXiv using ArxivReader.
    """
    # Fetch papers from arXiv
    papers = arxiv_reader.load_data(
        search_query=search_query,
        max_results=3
    )
    #print(papers)
    # Extract document texts
    arxiv_docs = [paper.text for paper in papers]
    return arxiv_docs

def store_documents_in_pinecone(documents: List[str]):
    """
    Generate embeddings for documents and store them in Pinecone.
    """
    try:
        print("Storing documents in Pinecone...")

        # Generate embeddings for documents
        embeddings = pc.inference.embed(
            model="llama-text-embed-v2",
            inputs=documents,
            parameters={"input_type": "passage"}
        )

        # Prepare vectors for Pinecone
        vectors = [
            {
                "id": f"vec{i}",  
                "values": embedding.values,
                "metadata": {"text": doc}
            }
            for i, (doc, embedding) in enumerate(zip(documents, embeddings))
        ]

        # Upsert vectors into Pinecone
        index.upsert(
            vectors=vectors,
            namespace="ns1"  
        )

        print("Documents stored in Pinecone successfully.")
    except Exception as e:
        print(f"Error storing documents in Pinecone: {e}")