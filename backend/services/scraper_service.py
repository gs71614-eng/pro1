from google_play_scraper import Sort, reviews as google_reviews
import pandas as pd
from datetime import datetime
import re
import requests
import json

GENERIC_PHRASES = ["good", "great", "nice", "ok", "awesome", "love it", "cool", "nice app", "good app", "great app", "perfect", "excellent", "amazing"]

def is_meaningful(text: str) -> bool:
    if not text or len(str(text).strip()) < 3:
        return False
    # Discard pure emojis or non-alphas
    t_clean = str(text).strip().lower()
    t_alphas = re.sub(r'[^a-z]', '', t_clean)
    if not t_alphas:
        return False
    if t_alphas in [p.replace(' ', '') for p in GENERIC_PHRASES]:
        return False
    return True

def clean_reviews(raw_reviews: list[dict], limit: int) -> tuple[list[dict], int]:
    seen = set()
    unique_reviews = []
    
    for r in raw_reviews:
        text = r.get("content", "")
        if text not in seen:
            seen.add(text)
            unique_reviews.append(r)

    filtered = []
    dropped_count = len(raw_reviews) - len(unique_reviews)
    
    for r in unique_reviews:
        if is_meaningful(r.get("content", "")):
            filtered.append(r)
        else:
            dropped_count += 1
            
    final_reviews = filtered[:limit]
    if len(filtered) > limit:
        dropped_count += (len(filtered) - limit)
        
    return final_reviews, dropped_count

def fetch_google(app_id: str, from_date: str, to_date: str, limit: int) -> tuple[list[dict], int]:
    try:
        f_date = datetime.strptime(from_date, "%Y-%m-%d") if from_date else None
        t_date = datetime.strptime(to_date, "%Y-%m-%d") if to_date else None

        result, _ = google_reviews(
            app_id,
            lang='en',
            country='us',
            sort=Sort.NEWEST,
            count=max(limit * 3, 500)
        )
        
        valid_reviews = []
        for r in result:
            dt = r.get('at')
            if dt:
                if f_date and dt < f_date:
                    continue
                if t_date and dt > t_date:
                    continue
            valid_reviews.append({
                "id": str(r.get("reviewId")),
                "content": r.get("content", ""),
                "date": dt.strftime("%Y-%m-%d") if dt else None,
                "source": "google"
            })
            
        return clean_reviews(valid_reviews, limit)
    except Exception as e:
        print(f"Error fetching Google reviews: {str(e)}")
        raise e

def fetch_apple(app_id: str, from_date: str, to_date: str, limit: int) -> tuple[list[dict], int]:
    try:
        f_date = datetime.strptime(from_date, "%Y-%m-%d") if from_date else None
        t_date = datetime.strptime(to_date, "%Y-%m-%d") if to_date else None

        valid_reviews = []
        page = 1
        max_pages = 10 
        
        while page <= max_pages and len(valid_reviews) < max(limit * 2, 200):
            url = f"https://itunes.apple.com/us/rss/customerreviews/page={page}/id={app_id}/sortBy=mostRecent/json"
            resp = requests.get(url, timeout=10)
            if resp.status_code != 200:
                break
                
            data = resp.json()
            entries = data.get("feed", {}).get("entry", [])
            if not entries:
                break
                
            for entry in entries:
                if "content" not in entry:
                    continue
                dt_str = entry.get("updated", {}).get("label")
                dt = datetime.strptime(dt_str[:19], "%Y-%m-%dT%H:%M:%S") if dt_str else None
                
                if dt:
                    if f_date and dt < f_date:
                        continue
                    if t_date and dt > t_date:
                        continue
                        
                review_text = entry.get("content", {}).get("label", "")
                review_id = entry.get("id", {}).get("label", "")
                
                valid_reviews.append({
                    "id": review_id,
                    "content": review_text,
                    "date": dt.strftime("%Y-%m-%d") if dt else None,
                    "source": "apple"
                })
            page += 1
            
        return clean_reviews(valid_reviews, limit)
    except Exception as e:
        print(f"Error fetching Apple reviews: {str(e)}")
        raise e
