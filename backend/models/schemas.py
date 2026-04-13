from pydantic import BaseModel, Field
from typing import List, Optional, Literal, Union

class ClassificationResult(BaseModel):
    severity: Literal["Critical", "High", "Medium", "Low"]
    reason: str

class ReviewItem(BaseModel):
    id: Optional[str] = None
    content: str
    date: Optional[str] = None
    source: Optional[str] = None
    classification: Optional[ClassificationResult] = None

class AppFetchRequest(BaseModel):
    app_id: str
    from_date: Optional[str] = None # format YYYY-MM-DD
    to_date: Optional[str] = None
    limit: Union[int, str] = 100
    source: Literal["google", "apple"]

class AnalyzeBatchRequest(BaseModel):
    reviews: List[ReviewItem]
    
class ClassifyRequest(BaseModel):
    text: str
