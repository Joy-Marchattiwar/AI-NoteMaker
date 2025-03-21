from dotenv import load_dotenv
import os
import pinecone
from typing import List, Dict
from pinecone import Pinecone
import uuid
from llama_index.readers.papers import ArxivReader
from llama_index.readers.papers import PubmedReader

arxiv_reader = ArxivReader()
pubmed_reader = PubmedReader()
load_dotenv()

key=os.getenv("PINECONE_API_KEY")
pc=Pinecone(api=key)
index = pc.Index("notecraft")


# index.delete(delete_all=True,namespace="ns2")
namespaces = {
    # "physics": [
    #     "quantum mechanics",
    #     "astrophysics",
    #     "condensed matter physics",
    #     "particle physics",
    #     "thermodynamics",
    #     "electromagnetism",
    #     "fluid dynamics",
    #     "optics",
    #     "nuclear physics",
    # ],
    # "biology": [
    #     "genomics",
    #     "ecology",
    #     "microbiology",
    #     "evolutionary biology",
    #     "molecular biology",
    #     "cell biology",
    #     "marine biology",
    #     "botany",
    #     "zoology",
    # ],
    # "chemistry": [
    #     "organic chemistry",
    #     "inorganic chemistry",
    #     "physical chemistry",
    #     "biochemistry",
    #     "environmental chemistry",
    #     "nanochemistry"
    # ],
    # "cs_math": [
    # #     "machine learning",
    #     "artificial intelligence",
    #     #"algorithms",
    #     #"data structures",
    #     "computer vision",
    #     "natural language processing",
    #     "cryptography",
    #     "theoretical computer science",
    #     "statistics",
    #     "probability",
    #     "number theory",
    #     "graph theory",
    # ],
    # "medicine": [
    #     "clinical trials",
    #     "epidemiology",
    #     "pharmacology",
    #     "immunology",
    #     "neurology",
    #     "cardiology",
    #     "oncology",
    #     "nutrition",
    #     "psychiatry"
    # ],
    # "engineering": [
    #     "electrical engineering",
    #     "mechanical engineering",
    #     "civil engineering",
    #     "aerospace engineering",
    #     "chemical engineering",
    #     "biomedical engineering",
    #     "robotics"
    # ],
    # "earth_sciences": [
    #     "geology",
    #     "meteorology",
    #     "oceanography",
    #     "climatology",
    #     "environmental science",
    #     "sustainability",
    #     "hydrology",
    #     "soil science",
    #     "paleontology",
    # ],
    # "social_sciences": [
    #     "psychology",
    #     "sociology",
    #     "anthropology",
    #     "political science",
    #     "economics",
    #     "education",
    #     "linguistics",
    #     "archaeology",
    #     "urban studies",
    #     "gender studies"
    # ],
    # "history": [
    #     "ancient history",
    #     "medieval history",
    #     "modern history",
    #     "world wars",
    #     "cultural history",
    #     "economic history",
    #     "art history",
    #     "military history",
    #     "colonial history"
    # ],
    # "philosophy_ethics": [
    #     "metaphysics",
    #     "epistemology",
    #     "ethics",
    #     "political philosophy",
    #     "philosophy of science",
    #     "philosophy of mind",
    #     "existentialism",
    #     "bioethics"
    # ],
    # "arts_humanities": [
    #     "literature",
    #     "film studies",
    #     "visual arts",
    #     "creative writing",
    #     "cultural studies",
    #     "religious studies",
    #     "folklore",
    #     "media studies"
    # ],
    # "business_management": [
    #     "marketing",
    #     "finance",
    #     "entrepreneurship",
    #     "organizational behavior",
    #     "supply chain management",
    #     "human resources",
    #     "strategic management",
    #     "accounting",
    #     "international business",
    #     "business ethics"
    # ],
    # "law_policy": [
    #     "constitutional law",
    #     "criminal law",
    #     "environmental law",
    #     "human rights law",
    #     "public policy",
    #     "corporate law",
    #     "intellectual property law",
    #     "labor law",
    #     "cyber law"
    # ],
    # "technology_innovation": [
    #     "blockchain",
    #     "internet of things (IoT)",
    #     "cybersecurity",
    #     "cloud computing",
    #     "big data",
    #     "AR/VR",
    #     "3D printing",
    #     "autonomous vehicles",
    # ],
    # "agriculture_food_science": [
    #     "agronomy",
    #     "horticulture",
    #     "food safety",
    #     "agricultural economics",
    #     "plant breeding",
    #     "soil fertility",
    #     "pest management",
    #     "sustainable agriculture"
    # ],

    "energy_sustainability": [
        #"renewable energy",
        #"energy storage",
        #"fossil fuels",
        #"carbon capture",
        "energy efficiency",
        "nuclear energy",
        "sustainable development"
    ],
    "psychology_cognitive_science": [
        "cognitive psychology",
        "developmental psychology",
        "social psychology",
        "neuropsychology",
        "behavioral psychology",
        "clinical psychology",
        "cognitive neuroscience",
        "psychometrics",
        "personality psychology",
        "industrial-organizational psychology"
    ],
    "mathematics_applied_math": [
        "algebra",
        "calculus",
        "differential equations",
        "topology",
        "mathematical modeling",
        "numerical analysis",
        "dynamical systems",
        "mathematical physics",
        "financial mathematics",
        "game theory"
    ]
}


def generate_doc_id():
    return str(uuid.uuid4())  # Generates a unique ID like "a1b2c3d4-..."

def fetch_documents(topic: str, namespace: str) -> List[Dict]:
    """
    Fetch documents based on the namespace and topic.
    """
    docs = []
    
    # Determine the source based on the namespace
    if namespace in ["physics", "chemistry", "cs_math", "engineering", "earth_sciences", 
                     "technology_innovation", "astronomy_space_science", "energy_sustainability", 
                     "mathematics_applied_math", "interdisciplinary_studies"]:
        source = "arxiv"
    elif namespace in ["biology", "medicine", "agriculture_food_science", "psychology_cognitive_science"]:
        source = "pubmed"
    elif namespace in ["social_sciences", "history", "philosophy_ethics", "arts_humanities", 
                       "business_management", "law_policy"]:
        source = "wikipedia"
    else:
        print(f"Unsupported namespace: {namespace}")
        return []
    
    # Fetch documents from the appropriate source
    if source == "arxiv":
        try:
            # Fetch only metadata (skip PDF download)
            docs = arxiv_reader.load_data(search_query=topic, max_results=3)
        except Exception as e:
            print(f"Error fetching arXiv documents: {e}")
            return []
    elif source == "pubmed":
        docs = fetch_pubmed_docs(search_query=topic, max_results=50)
    elif source == "wikipedia":
        docs = fetch_history_docs(topic)  # Reuse the Wikipedia function for general topics
    if source == "arxiv":
        # ArxivReader returns objects with a `text` attribute
        return [{"text": doc.text, "source": source, "namespace": namespace} for doc in docs]
    else:
        # PubMed and Wikipedia return dictionaries with a `text` key
        return [{"text": doc["text"], "source": source, "namespace": namespace} for doc in docs]

def upsert_documents(documents: List[Dict], index: pinecone.Index):
    batch = []
    for doc in documents:
        vector = pc.inference.embed(
            model="llama-text-embed-v2",
            inputs=doc["text"],
            parameters={
                "input_type": "passage"
            }

        )[0].values
        batch.append({
            "id": generate_doc_id(),
            "values": vector,
            "metadata": {"source": doc["source"], "namespace": doc["namespace"]}
        })
    
    # Upsert in batches (Pinecone supports up to 100 vectors per upsert)
    for i in range(0, len(batch), 100):
        index.upsert(vectors=batch[i:i+100], namespace=doc["namespace"])

import wikipedia
import requests
from typing import List, Dict

def fetch_pubmed_docs(search_query: str, max_results: int = 10) -> List[Dict]:
    """
    Fetch documents from PubMed using the eutils API.
    """
    base_url = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils"
    docs = []

    try:
        # Step 1: Search PubMed for article IDs
        search_url = f"{base_url}/esearch.fcgi"
        search_params = {
            "db": "pubmed",
            "term": search_query,
            "retmax": max_results,
            "retmode": "json"
        }
        search_response = requests.get(search_url, params=search_params)
        search_response.raise_for_status()
        search_data = search_response.json()

        # Extract article IDs from the search results
        article_ids = search_data.get("esearchresult", {}).get("idlist", [])
        if not article_ids:
            print(f"No articles found for query: {search_query}")
            return []

        # Step 2: Fetch metadata for each article
        fetch_url = f"{base_url}/efetch.fcgi"
        fetch_params = {
            "db": "pubmed",
            "id": ",".join(article_ids),
            "retmode": "xml",
            "rettype": "abstract"  # Fetch only the abstract/metadata
        }
        fetch_response = requests.get(fetch_url, params=fetch_params)
        fetch_response.raise_for_status()
        fetch_data = fetch_response.text

        # Parse the XML response (you can use a library like `xml.etree.ElementTree`)
        import xml.etree.ElementTree as ET
        root = ET.fromstring(fetch_data)

        # Extract document information
        for article in root.findall(".//PubmedArticle"):
            title = article.findtext(".//ArticleTitle")
            abstract = article.findtext(".//AbstractText")
            if title and abstract:
                docs.append({
                    "text": f"{title}\n{abstract}",  # Combine title and abstract
                    "source": "pubmed",
                    "namespace": "biology"  # Adjust based on your namespace logic
                })
            else:
                print(f"Skipping article: Missing title or abstract")

        return docs

    except Exception as e:
        print(f"Error fetching PubMed documents: {e}")
        return []
    
def fetch_history_docs(topic: str) -> List[Dict]:
    try:
        page = wikipedia.summary(topic, sentences=50)  # Fetch summary from Wikipedia
        return [{"text": page, "source": "wikipedia", "namespace": "history"}]
    except wikipedia.exceptions.PageError:
        print(f"Wikipedia page not found for topic: {topic}")
        return []
    except Exception as e:
        print(f"Error fetching Wikipedia data: {e}")
        return []


def main():
    # Iterate through namespaces and topics
    for namespace, topics in namespaces.items():
        for topic in topics:
            print(f"Fetching documents for topic: {topic} (namespace: {namespace})")
            
            # Fetch documents based on the namespace
            documents = fetch_documents(topic, namespace)
            if not documents:
                print(f"No documents found for topic: {topic}")
                continue
            upsert_documents(documents, index)
            print(f"Upserted {len(documents)} documents for topic: {topic}")

    print("All documents have been processed and upserted into Pinecone.")

# Run the driver code
if __name__ == "__main__":
    main()