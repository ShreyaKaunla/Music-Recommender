from mutagen.mp3 import MP3
from mutagen.id3 import ID3, APIC
import os
import numpy as np
from pydantic import BaseModel
import sqlite3 as sql
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response, FileResponse, RedirectResponse
import urllib.parse

from scan import run_scan

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_PATH = r"C:\Users\lenovo\csee\music hub real scratch\sql_db.db"
MUSIC_FOLDER = r"C:\Users\lenovo\csee\music hub real scratch\New folder"

@app.on_event("startup")
def startup_scan():
    print("Launching music directory scan...")
    run_scan()

@app.get("/api/songs")
def get_all_songs():
    conn = sql.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT id, file_path, title, artist, album FROM tracks")
    rows = cursor.fetchall()
    conn.close()

    songs_list = []
    for row in rows:
        
        songs_list.append({
            "id": row[0],
            "file_path": row[1],  
            "title": row[2],
            "artist": row[3],
            "album": row[4]
        })
    return songs_list


@app.get("/api/audio/{filename:path}")
def stream_audio(filename: str):
    # Decode things like %20 or %5C back into spaces and slashes cleanly
    decoded_filename = urllib.parse.unquote(filename)
    
    # Check your true subfolder location path on disk
    full_audio_path = os.path.join(MUSIC_FOLDER, "sk", os.path.basename(decoded_filename))
    
    if not os.path.exists(full_audio_path):
        raise HTTPException(status_code=404, detail=f"Audio file not found at: {full_audio_path}")
    return FileResponse(full_audio_path, media_type="audio/mpeg", filename=os.path.basename(decoded_filename))

# Replace the endpoint in Main.py with this secure layout path resolution
@app.get("/api/cover/{filename:path}")
def get_cover_art(filename: str):
    # Decode things like %20 or %5C cleanly back into real characters
    decoded_path = urllib.parse.unquote(filename)
    
    # Check if the incoming string is already an absolute path
    if os.path.isabs(decoded_path):
        full_audio_path = decoded_path
    else:
        # Fallback: cross-reference inside the subfolder structure
        full_audio_path = os.path.join(MUSIC_FOLDER, "sk", os.path.basename(decoded_path))
    
    # Debugging Check: Print out where the application is actively sweeping for files
    print(f"Targeting metadata extraction at: {full_audio_path}")
    
    if not os.path.exists(full_audio_path):
        # Fallback directly to an open repository visual icon if the target file isn't on disk
        return RedirectResponse(url="https://unsplash.com")
    
    try:
        # Load the MP3 file using Mutagen's strict ID3 frame processor
        audio = MP3(full_audio_path, ID3=ID3)
        
        # Look specifically for the Attached Picture (APIC) tag frame
        if audio.tags:
            for tag in audio.tags.values():
                if isinstance(tag, APIC):
                    # Return the raw picture binary data immediately to the frontend image element
                    return Response(content=tag.data, media_type=tag.mime)
                    
    except Exception as e:
        print(f"Metadata extraction bypass for {filename}: {e}")
    
    # Fallback placeholder cover art if the audio file lacks an embedded APIC frame
    return RedirectResponse(url="https://unsplash.com")


class RecommendationRequest(BaseModel):
    file_path: str
def recommender(target):
    s=os.path.basename(target)

    conn=sql.connect(DB_PATH)
    cursor=conn.cursor()
    cursor.execute("""
        SELECT vector_data, cluster_id FROM tracks 
        WHERE file_path = ? OR file_path = ? OR file_path LIKE ?
    """, (target, s, f"%{s}"))
    t=cursor.fetchone() 
    vector,cluster=t
    target_array=np.frombuffer(vector, dtype=np.float32)
    
    cursor.execute("""
        SELECT file_path, vector_data FROM tracks 
        WHERE cluster_id = ? AND file_path != ? AND file_path != ? AND vector_data IS NOT NULL
    """, (cluster, target, s))
    list=cursor.fetchall()
    conn.close()
    
    if not list:
        print("No other songs found inside this cluster bucket neighborhood yet.")
        return []
    recommendation_queue=[]
    for i in list:
        match, match_vector=i
        array=np.frombuffer(match_vector, dtype=np.float32)
        distance = np.sqrt(np.sum((target_array - array) ** 2))
        recommendation_queue.append({"path": os.path.join(MUSIC_FOLDER,"sk",match), "score": distance})
    recommendation_queue.sort(key=lambda x: x["score"])
    top_20_matches = recommendation_queue[:20]
    return top_20_matches




@app.post("/api/recommendations")
# Inside Main.py -> @app.post("/api/recommendations")
@app.post("/api/recommendations")
def get_music_recommendations(request: RecommendationRequest):
    real_disk_path = os.path.join(MUSIC_FOLDER, "sk", request.file_path)
    
    if not os.path.exists(real_disk_path):
        raise HTTPException(status_code=404, detail=f"Target audio file path not found: {real_disk_path}")
    
    try:
        raw_results = recommender(real_disk_path)
        formatted_results = []
        
        for rank, track in enumerate(raw_results, start=1):
            # Extract pure filename to cross-reference cleanly with React state properties
            clean_name = os.path.basename(track["path"])
            
            formatted_results.append({
                "rank": rank,
                "file_name": clean_name,
                "full_path": track["path"], # Kept for safety
                "score": float(track["score"]) 
            })
        
        return {"status": "success", "sdata": formatted_results}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Recommendation engine error: {str(e)}")
