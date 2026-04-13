from fastapi import APIRouter, UploadFile, File, HTTPException, Form
from models.schemas import AppFetchRequest, AnalyzeBatchRequest, ReviewItem
from services.scraper_service import fetch_google, fetch_apple, clean_reviews
from services.llm_service import batch_classify
import pandas as pd
import io

router = APIRouter()

@router.post("/fetch-app")
async def fetch_app(req: AppFetchRequest):
    try:
        lim = int(req.limit) if str(req.limit) != 'Custom' else 100
        if req.source == "google":
            reviews, dropped = fetch_google(req.app_id, req.from_date, req.to_date, lim)
        else:
            reviews, dropped = fetch_apple(req.app_id, req.from_date, req.to_date, lim)
            
        return {"reviews": reviews, "dropped_count": dropped}
    except Exception as e:
        print(str(e))
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/upload-csv")
async def upload_csv(file: UploadFile = File(...), limit: str = Form("100")):
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are supported")
    
    contents = await file.read()
    try:
        df = pd.read_csv(io.BytesIO(contents))
        
        content_col = None
        for col in df.columns:
            if col.strip().lower() == "content":
                content_col = col
                break
                
        if not content_col:
            raise HTTPException(status_code=400, detail="'content' column not found in CSV")
            
        raw_reviews = []
        for index, row in df.iterrows():
            text = str(row[content_col])
            raw_reviews.append({
                "id": str(index),
                "content": text,
                "source": "csv"
            })
            
        l_int = int(limit) if str(limit) != 'Custom' else 100
        cleaned_revs, dropped = clean_reviews(raw_reviews, l_int)
        return {"reviews": cleaned_revs, "dropped_count": dropped}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/analyze-batch")
async def analyze_batch(req: AnalyzeBatchRequest):
    try:
        review_dicts = [r.dict() for r in req.reviews]
        results = await batch_classify(review_dicts)
        return {"results": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
