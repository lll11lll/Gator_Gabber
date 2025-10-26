"""
RAG (Retrieval-Augmented Generation) module for GatorGabber.
Provides context-aware responses using course materials.
"""

from .retriever import retrieve_context, format_rag_prompt
from .vector_store import get_spn1130_store, VectorStoreManager

__all__ = [
    'retrieve_context',
    'format_rag_prompt',
    'get_spn1130_store',
    'VectorStoreManager'
]
