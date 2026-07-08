import eyed3
import os
import sqlite3 as sql
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response, FileResponse, RedirectResponse
# Import the function from your scan.py file
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
        # FIXED: Extract data cleanly from tuple indices 0 to 4
        songs_list.append({
            "id": row[0],
            "file_path": row[1],  # Extract clean filename string
            "title": row[2],
            "artist": row[3],
            "album": row[4]
        })
    return songs_list


@app.get("/api/audio/{filename}")
def stream_audio(filename: str):
    full_audio_path = os.path.join(MUSIC_FOLDER, filename)
    if not os.path.exists(full_audio_path):
        raise HTTPException(status_code=404, detail="Audio file not found")
    return FileResponse(full_audio_path, media_type="audio/mpeg", filename=filename)

@app.get("/api/cover/{filename}")
def get_cover_art(filename: str):
    full_audio_path = os.path.join(MUSIC_FOLDER, filename)
    
    if not os.path.exists(full_audio_path):
        raise HTTPException(status_code=404, detail="Audio file not found")
    
    try:
        # Load the MP3 file with eyeD3
        audio_file = eyed3.load(full_audio_path)
        
        if audio_file and audio_file.tag and audio_file.tag.images:
            # Loop through all images to find any valid artwork frame
            for image in audio_file.tag.images:
                if image.image_data:
                    # Return the raw binary image to the frontend img tag
                    return Response(content=image.image_data, media_type="image/jpeg")
                    
    except Exception as e:
        print(f"eyeD3 error for {filename}: {e}")

    # Fallback to an external high-quality placeholder image if no art exists in the MP3 metadata
    return RedirectResponse(url="https://unsplash.com")
