"""
RAG retrieval logic for augmenting prompts with relevant context.
"""

from typing import Optional, List
from .vector_store import get_spn1130_store


def retrieve_context(query: str, class_level: str) -> Optional[str]:
    """
    Retrieve relevant context from the vector store for the given query.
    
    Args:
        query: User's message
        class_level: The Spanish class level (e.g., 'spanish_1130')
        
    Returns:
        Formatted context string to add to the prompt, or None if RAG not available
    """
    # Only support SPN1130 for now
    if class_level != "spanish_1130":
        return None
    
    try:
        # Get the vector store
        store = get_spn1130_store()
        
        if not store or not store.vector_store:
            print("RAG: Vector store not available")
            return None
        
        # Retrieve relevant chunks
        relevant_docs = store.similarity_search(query, k=3)
        
        if not relevant_docs:
            print("RAG: No relevant documents found")
            return None
        
        # Format the context
        context = "\n\n".join([
            f"[Resource {i+1}]:\n{doc}" 
            for i, doc in enumerate(relevant_docs)
        ])
        
        print(f"RAG: Retrieved {len(relevant_docs)} relevant chunks")
        
        return context
        
    except Exception as e:
        print(f"RAG Error: {e}")
        return None


def format_rag_prompt(base_prompt: str, user_message: str, context: Optional[str]) -> tuple[str, str]:
    """
    Format the system prompt and user message with RAG context.
    
    Args:
        base_prompt: The original system prompt
        user_message: The user's message
        context: Retrieved context from vector store
        
    Returns:
        Tuple of (enhanced_system_prompt, enhanced_user_message)
    """
    if not context:
        return base_prompt, user_message
    
    # Add RAG instruction to system prompt
    enhanced_system_prompt = f"""{base_prompt}

6. KNOWLEDGE BASE: You have access to course materials and resources. When relevant information is provided below in the CONTEXT section, use it to inform your responses. Integrate this knowledge naturally into your Spanish replies without explicitly mentioning "the document says" or "according to the materials"."""
    
    # Add context to user message
    enhanced_user_message = f"""CONTEXT (Course Materials):
{context}

---

USER MESSAGE:
{user_message}"""
    
    return enhanced_system_prompt, enhanced_user_message
