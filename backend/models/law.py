"""
Pydantic models for LawsAsk
"""

from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from enum import Enum


class Punishment(BaseModel):
    """Punishment details"""
    type: List[str] = Field(default=["Imprisonment"])
    duration: Optional[str] = None
    fine: Optional[str] = None
    note: Optional[str] = None


class Law(BaseModel):
    """Law document model"""
    law: str  # e.g., "IPC", "IT Act"
    section: str  # e.g., "420"
    title: str
    category: str  # e.g., "Crimes Against Person"
    description: str
    elements: Optional[List[str]] = None
    punishment: Punishment
    bailable: Optional[bool] = None
    cognizable: Optional[bool] = None
    compoundable: Optional[bool] = None
    triable_by: Optional[str] = None
    keywords: List[str] = Field(default_factory=list)


class QueryRequest(BaseModel):
    """Incoming query request"""
    query: str = Field(..., min_length=1, max_length=500)
    user_id: Optional[str] = None


class QueryResponse(BaseModel):
    """Query response with law details"""
    success: bool
    is_legal_query: bool
    query: str
    response: Optional[str] = None
    law: Optional[Law] = None
    confidence: Optional[float] = None
    error: Optional[str] = None


class ChatHistoryEntry(BaseModel):
    """Chat history entry"""
    user_id: str
    query: str
    response: str
    law_section: Optional[str] = None
    confidence: Optional[float] = None
    timestamp: str


class CategoriesList(BaseModel):
    """List of law categories"""
    categories: List[str]
    count: int


class SearchRequest(BaseModel):
    """Search request"""
    keyword: str = Field(..., min_length=1)
    category: Optional[str] = None
    limit: Optional[int] = 10


class HealthCheck(BaseModel):
    """Health check response"""
    status: str
    mongodb_connected: bool
    laws_count: int
    version: str
