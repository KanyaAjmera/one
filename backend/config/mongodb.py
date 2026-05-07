"""
MongoDB connection and configuration for LawsAsk
"""

import os
from pymongo import MongoClient
from pymongo.errors import ServerSelectionTimeoutError
import json
import asyncio
from pathlib import Path


class MongoDBConnection:
    """Manage MongoDB connections and operations"""
    
    _instance = None
    _client = None
    _db = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    def __init__(self):
        if self._client is None:
            self._initialize()
    
    def _initialize(self):
        """Initialize MongoDB connection"""
        mongodb_uri = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
        database_name = os.getenv("DATABASE_NAME", "lawsask_db")
        
        print(f"[MongoDB] Connecting to: {mongodb_uri}")
        print(f"[MongoDB] Database: {database_name}")
        
        try:
            self._client = MongoClient(mongodb_uri, serverSelectionTimeoutMS=5000)
            # Verify connection
            self._client.admin.command('ping')
            print("[MongoDB] [OK] Connection successful")
        except ServerSelectionTimeoutError:
            print("[MongoDB] [ERROR] Connection failed - MongoDB may not be running")
            self._client = MongoClient(mongodb_uri)
        
        self._db = self._client[database_name]
    
    def get_db(self):
        """Get database instance"""
        if self._db is None:
            self._initialize()
        return self._db
    
    def get_client(self):
        """Get client instance"""
        if self._client is None:
            self._initialize()
        return self._client
    
    def close(self):
        """Close connection"""
        if self._client:
            self._client.close()
            self._client = None
            self._db = None
            print("[MongoDB] Connection closed")


def get_mongo_db():
    """Get database instance - use this in routes"""
    return MongoDBConnection().get_db()


def ensure_indexes():
    """Create necessary indexes for optimal performance"""
    db = get_mongo_db()
    
    laws_collection = db["laws"]
    
    # Check if indexes exist
    existing_indexes = laws_collection.list_indexes()
    index_names = [idx['name'] for idx in existing_indexes]
    
    if "keywords_text" not in index_names:
        laws_collection.create_index([("keywords", "text")])
        print("[MongoDB] Created text index on keywords")
    
    if "section_1" not in index_names:
        laws_collection.create_index([("section", 1)])
        print("[MongoDB] Created index on section")
    
    if "law_1" not in index_names:
        laws_collection.create_index([("law", 1)])
        print("[MongoDB] Created index on law")
    
    if "category_1" not in index_names:
        laws_collection.create_index([("category", 1)])
        print("[MongoDB] Created index on category")


def import_laws_dataset():
    """Import laws dataset from JSON file into MongoDB"""
    db = get_mongo_db()
    laws_collection = db["laws"]
    
    # Check if data already exists
    existing_count = laws_collection.count_documents({})
    if existing_count > 0:
        print(f"[Dataset] Laws collection already has {existing_count} documents")
        return existing_count
    
    # Find the dataset file
    dataset_paths = [
        Path(__file__).parent.parent.parent / "node-backend" / "data" / "laws_dataset.json",
        Path(__file__).parent.parent.parent / "backend" / "data" / "laws_dataset.json",
        Path.cwd() / "data" / "laws_dataset.json",
    ]
    
    dataset_file = None
    for path in dataset_paths:
        if path.exists():
            dataset_file = path
            print(f"[Dataset] Found dataset at: {dataset_file}")
            break
    
    if not dataset_file:
        print(f"[Dataset] [ERROR] Could not find laws_dataset.json")
        print(f"[Dataset] Searched paths:")
        for path in dataset_paths:
            print(f"  - {path}")
        return 0
    
    try:
        with open(dataset_file, 'r', encoding='utf-8') as f:
            laws_data = json.load(f)
        
        if not isinstance(laws_data, list):
            print("[Dataset] [ERROR] Invalid format: expected list of laws")
            return 0
        
        # Insert laws
        result = laws_collection.insert_many(laws_data)
        count = len(result.inserted_ids)
        print(f"[Dataset] [OK] Imported {count} laws")
        
        # Create indexes
        ensure_indexes()
        
        return count
    
    except json.JSONDecodeError as e:
        print(f"[Dataset] [ERROR] Error parsing JSON: {e}")
        return 0
    except Exception as e:
        print(f"[Dataset] [ERROR] Error importing dataset: {e}")
        return 0


def initialize_database():
    """Initialize database and import dataset"""
    print("\n[Database Init] Starting initialization...")
    
    # Ensure connection
    db = get_mongo_db()
    
    # Import dataset
    count = import_laws_dataset()
    
    # Ensure indexes
    ensure_indexes()
    
    print(f"[Database Init] [OK] Initialization complete ({count} laws loaded)\n")
