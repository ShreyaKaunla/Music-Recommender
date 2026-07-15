import os
import sqlite3 as sql
from tinytag import TinyTag

DB_PATH = r"C:\Users\lenovo\csee\music hub real scratch\sql_db.db"
MUSIC_FOLDER=r"C:\Users\lenovo\csee\music hub real scratch\New folder\sk"

l=[]
def run_scan():
    conn=sql.connect(DB_PATH)
    cursor=conn.cursor()
    cursor.execute("""Create table if not EXISTS tracks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                file_path TEXT UNIQUE,
                title TEXT,
                artist TEXT,
                album TEXT)""")
    conn.commit()
    list=os.listdir(MUSIC_FOLDER)
    for i in list:
        if(i.endswith(".mp3")):
            path=os.path.join(MUSIC_FOLDER,i)
            l.append(path)
            
            tag=TinyTag.get(path)
            if(tag.title):
                title=tag.title
                
            else:
                k=i.split(".")
                title=k[0]
            if(tag.artist):
                artist=tag.artist.capitalize()

            
            else:
                
                artist="unkown artist"
            if(tag.album):
                album=tag.album
            
            else:
                
                album="unknown"
            cursor.execute(""" Insert or ignore 
                            Into tracks(file_path, title, artist, album)
                            values(?,?,?,?)""",(i,title, artist, album))
            
    conn.commit()  
    cursor.execute("select * from tracks")
    songs=cursor.fetchall()
    print(f"Scan complete. {len(songs)} tracks found in database.")
    conn.close()
if __name__ == "__main__":
    run_scan()
run_scan()