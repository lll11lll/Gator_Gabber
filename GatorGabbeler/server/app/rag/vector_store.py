"""
Vector store management for RAG system.
Handles PDF ingestion, embedding generation, and similarity search.
Uses ChromaDB for easy Windows compatibility.
"""

import os
from pathlib import Path
from typing import List
from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import Chroma
from dotenv import load_dotenv

load_dotenv()


class VectorStoreManager:
    """Manages vector store creation and retrieval for Spanish class resources."""
    
    def __init__(self, class_level: str = "spanish_1130"):
        self.class_level = class_level
        self.embeddings = OpenAIEmbeddings(openai_api_key=os.getenv("OPENAI_API_KEY"))
        self.vector_store = None
        self.data_dir = Path(__file__).parent.parent.parent / "data" / class_level
        self.index_path = self.data_dir / "chroma_db"
        
    def load_or_create_vector_store(self):
        """Load existing vector store or create new one from PDFs."""
        # Try to load existing index
        if self.index_path.exists() and any(self.index_path.iterdir()):
            print(f"Loading existing vector store from {self.index_path}")
            try:
                self.vector_store = Chroma(
                    persist_directory=str(self.index_path),
                    embedding_function=self.embeddings
                )
                return self.vector_store
            except Exception as e:
                print(f"Error loading existing store: {e}")
                print("Creating new vector store...")
        
        # Create new index from PDFs
        print(f"Creating new vector store from PDFs in {self.data_dir}")
        return self.create_vector_store_from_pdfs()
    
    def create_vector_store_from_pdfs(self):
        """Load PDFs, split into chunks, and create vector store."""
        if not self.data_dir.exists():
            print(f"Warning: Data directory {self.data_dir} does not exist")
            return None
        
        # Find all PDF files
        pdf_files = list(self.data_dir.glob("*.pdf"))
        
        if not pdf_files:
            print(f"Warning: No PDF files found in {self.data_dir}")
            return None
        
        print(f"Found {len(pdf_files)} PDF files to process")
        
        # Load and split PDFs
        all_documents = []
        for pdf_path in pdf_files:
            print(f"Processing: {pdf_path.name}")
            loader = PyPDFLoader(str(pdf_path))
            documents = loader.load()
            all_documents.extend(documents)
        
        # Split documents into chunks
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            length_function=len,
        )
        splits = text_splitter.split_documents(all_documents)
        print(f"Created {len(splits)} text chunks")
        
        # Create vector store
        self.vector_store = Chroma.from_documents(
            documents=splits,
            embedding=self.embeddings,
            persist_directory=str(self.index_path)
        )
        
        print(f"Vector store saved to {self.index_path}")
        
        return self.vector_store
    
    def similarity_search(self, query: str, k: int = 3) -> List[str]:
        """
        Search for relevant documents based on query.
        
        Args:
            query: The user's question or message
            k: Number of relevant chunks to retrieve
            
        Returns:
            List of relevant text chunks
        """
        if not self.vector_store:
            self.load_or_create_vector_store()
        
        if not self.vector_store:
            return []
        
        # Perform similarity search
        docs = self.vector_store.similarity_search(query, k=k)
        
        # Extract text content
        return [doc.page_content for doc in docs]
    
    def rebuild_index(self):
        """Force rebuild of the vector store from PDFs."""
        # Remove existing index
        if self.index_path.exists():
            import shutil
            shutil.rmtree(self.index_path)
        
        # Recreate
        return self.create_vector_store_from_pdfs()


# Singleton instance for SPN1130
_spn1130_store = None

def get_spn1130_store() -> VectorStoreManager:
    """Get or create the SPN1130 vector store singleton."""
    global _spn1130_store
    if _spn1130_store is None:
        _spn1130_store = VectorStoreManager("spanish_1130")
        _spn1130_store.load_or_create_vector_store()
    return _spn1130_store
