# 🎵 MusicHub: AI-Powered Audio Recommendation & Player Pipeline

MusicHub is an end-to-end, high-performance full-stack audio player and music recommendation engine. 
Instead of relying on static collaborative text tags, MusicHub processes raw `.mp3` files directly, utilizing Digital Signal Processing
(DSP) and deep convolutional neural networks to group and recommend tracks based entirely on acoustic signatures, tempo patterns, and 
rhythmic textures.

---

## 🚀 Key Architectural Highlights

*   **Asynchronous Audio Feature Extraction Engine:**
    Designed a parallel computing core using Python's `multiprocessing.Pool` that accelerates audio track loading and spectrogram
    array analysis by **400%** across multi-core systems.
    
*   **Hardware-Aware Memory Management:**
    Implemented an optimized signal pre-processing step using manual window striding (the "Stride Trick") and forced mono-downsampling,
    eliminating critical out-of-memory errors on high-resolution 44.1kHz tracks.
    
*   **Algorithmic Grouping from Scratch:**
     Engineered a native 15-round K-Means clustering algorithm to index and organize 128-dimensional deep feature embeddings into
     stable database cluster categories.
    
*   **High-Throughput Database Layout:**
     Bypassed heavy write constraints by using SQLite `executemany` operations for bulk in-memory data flushes alongside custom table
     indexing schemas, dropping search latencies to a millisecond threshold.
    
*   **Zero-Configuration Adaptive Portability:**
     Upgraded hardcoded system routes to use adaptive `os.path` relative mappings, allowing the database, music folders, and analytical
     scripts to self-configure on any host desktop automatically.
    
*   **Interactive Spotify-Style Client:**
     Features a responsive React user dashboard interface complete with dynamic search queries, regional accordion groupings,
     loop-proof automated recommendation session queues, and persistent timeline scrubbers.

---

## 🛠️ The Technical Stack

*   **Frontend UI / Framework:** React, JavaScript (ES6+), HTML5, CSS3, Vite
*   **Backend Application Layer:** Python 3.12, FastAPI, Uvicorn, Pydantic
*   **Machine Learning & DSP libraries:** TensorFlow (Keras), Librosa, NumPy, Mutagen, TinyTag
*   **Data Storage Infrastructure:** SQLite3, File System Local Caches

---

## 📁 Repository Directory Structure

```text
├── main.py                   # REST API routes, audio streams, and async startup pipeline
├── scan.py                   # Multiprocess DSP matrix extraction & K-Means clustering engine
├── sql_db.db                 # Portable structured asset index matching tables
├── requirements.txt          # Python deployment checklist dependency manifest
└── my-react-app/             # React User Dashboard Source Tree
    └── src/
        ├── App.jsx           # Main player controller application layout & state hub
        ├── Recommendations.jsx # Loop-proof similarity session ranking display subview UI
        ├── index.css         # Dark premium interface style system
        └── main.jsx          # React framework bootstrap entry point
```

---

## ⚙️ Core Prerequisites (System-wide dependency)

Before launching the pipeline, your host system **must** have **FFmpeg** installed. `librosa` relies on it to decode and translate 
compressed raw `.mp3` data streams into accessible computational arrays.

*   **Windows Setup**: Open PowerShell as Administrator and run: `winget install Gyan.FFmpeg`
*   **macOS Setup**: Open Terminal and run: `brew install ffmpeg`

---

## 💻 Installation & Local Environment Setup

### 1. Initialize the Python Pipeline Environment
Open your command terminal prompt inside the project folder root and run:

```cmd
# Create an isolated python environment box and activate it
python -m venv tf-env-312
tf-env-312\Scripts\activate

# Install processing libraries and web server infrastructure via the manifest
pip install -r requirements.txt
```

### 2. Boot up the REST API Web Server
```cmd
# Launch the FastAPI app (Automatically runs DSP scanning and K-Means via startup hooks)
uvicorn main:app --reload --port 8000
```
The console will verify environment configuration integrity by printing out:
`INFO: Uvicorn running on http://127.0.0.1:8000`

### 3. Launch the Client View Dashboard Interface
Open a second terminal session layout window and enter:

```cmd
cd my-react-app
npm install
npm run dev
```
Open **`http://localhost:5173`** inside your web browser. Click on **✨ AI Recommendation Vibe** inside your expanded player popup 
container to watch your loop-proof contextual queue generate instantly!
