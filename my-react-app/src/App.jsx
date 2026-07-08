import { useEffect, useState, useRef } from 'react';

function App() {
  const [songs, setSongs] = useState([]);
  const [filteredSongs, setFilteredSongs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentSongIndex, setCurrentSongIndex] = useState(null);
  const [isPopupExpanded, setIsPopupExpanded] = useState(false); // Controls full-screen slide
  
  const audioRef = useRef(null);

  // Fetch track database list
  useEffect(() => {
    fetch("http://localhost:8000/api/songs")
      .then((res) => res.json())
      .then((data) => {
        setSongs(data);
        setFilteredSongs(data);
      })
      .catch((err) => console.error("Error fetching library:", err));
  }, []);

  // Filter list with search input
  useEffect(() => {
    const results = songs.filter(song => 
      song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.artist.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredSongs(results);
  }, [searchQuery, songs]);

  const currentSong = currentSongIndex !== null ? songs[currentSongIndex] : null;

  const playNext = () => {
    if (songs.length === 0) return;
    const nextIndex = currentSongIndex === songs.length - 1 ? 0 : currentSongIndex + 1;
    setCurrentSongIndex(nextIndex);
  };

  const playPrevious = () => {
    if (songs.length === 0) return;
    const prevIndex = currentSongIndex === 0 ? songs.length - 1 : currentSongIndex - 1;
    setCurrentSongIndex(prevIndex);
  };

  return (
    <div style={{ padding: '30px', fontFamily: '"Segoe UI", Roboto, sans-serif', paddingBottom: '160px', backgroundColor: '#121212', color: '#ffffff', minHeight: '100vh' }}>
      <h1 style={{ textAlign: 'center', fontWeight: '700', letterSpacing: '-1px' }}>Music Hub Player</h1>
      
      {/* SEARCH BAR ELEMENT */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '40px' }}>
        <input 
          type="text" 
          placeholder="Search by track name or artist..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ width: '80%', maxWidth: '500px', padding: '14px 24px', borderRadius: '30px', border: 'none', backgroundColor: '#242424', color: '#fff', fontSize: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.3)', outline: 'none' }}
        />
      </div>

      <h3 style={{ maxWidth: '600px', margin: '0 auto 20px auto', borderBottom: '1px solid #282828', paddingBottom: '10px' }}>Your Track Library</h3>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        {filteredSongs.length === 0 ? (
          <p style={{ color: '#aaa', textAlign: 'center' }}>No tracks match your query.</p>
        ) : (
          <ul style={{ padding: 0 }}>
            {filteredSongs.map((song) => {
              const actualIndex = songs.findIndex(s => s.id === song.id);
              return (
                <li key={song.id} style={{ display: 'flex', alignItems: 'center', margin: '10px 0', padding: '12px', borderRadius: '8px', backgroundColor: '#181818', transition: '0.2s' }}>
                  <img 
                    src={`http://localhost:8000/api/cover/${encodeURIComponent(song.file_path)}`} 
                    alt="art" 
                    style={{ width: '50px', height: '50px', borderRadius: '6px', marginRight: '15px', objectFit: 'cover', background: '#282828' }}
                  />
                  <div style={{ flexGrow: 1 }}>
                    <strong style={{ display: 'block', fontSize: '16px' }}>{song.title}</strong>
                    <span style={{ fontSize: '14px', color: '#b3b3b3' }}>{song.artist}</span>
                  </div>
                  <button 
                    onClick={() => {
                      setCurrentSongIndex(actualIndex);
                      setIsPopupExpanded(true); // Pop up full view instantly on new track selection
                    }}
                    style={{ padding: '8px 20px', cursor: 'pointer', backgroundColor: '#1db954', color: '#fff', border: 'none', borderRadius: '20px', fontWeight: 'bold' }}
                  >
                    ▶ Play
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* FLOATING MUSIC HUB COMPACT CONTROLLER & MODAL SLIDER POPUP */}
      {currentSong && (
        <>
          {/* 1. BOTTOM COMPACT BAR LAYER (Clicking anywhere expands full view) */}
          <div 
            onClick={() => setIsPopupExpanded(true)}
            style={{
              position: 'fixed', bottom: 0, left: 0, right: 0,
              background: '#181818', borderTop: '1px solid #282828',
              padding: '12px 30px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              boxShadow: '0 -8px 24px rgba(0,0,0,0.5)', cursor: 'pointer', zIndex: 999,
              transform: isPopupExpanded ? 'translateY(100px)' : 'translateY(0)',
              transition: 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', width: '40%' }}>
              <img 
                src={`http://localhost:8000/api/cover/${encodeURIComponent(currentSong.file_path)}`} 
                alt="cover" 
                style={{ width: '55px', height: '55px', borderRadius: '4px', marginRight: '15px', objectFit: 'cover' }}
              />
              <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '15px' }}>{currentSong.title}</h4>
                <p style={{ margin: 0, fontSize: '13px', color: '#b3b3b3' }}>{currentSong.artist}</p>
              </div>
            </div>
            
            <div style={{ fontSize: '12px', color: '#b3b3b3', fontStyle: 'italic' }}>
              Click bar to expand player view ⌃
            </div>

            <div style={{ display: 'flex', alignItems: 'center' }} onClick={(e) => e.stopPropagation()}>
              <button onClick={playPrevious} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '20px', cursor: 'pointer', marginRight: '15px' }}>⏮</button>
              <audio ref={audioRef} controls autoPlay src={`http://localhost:8000/api/audio/${encodeURIComponent(currentSong.file_path)}`} onEnded={playNext} style={{ height: '40px' }} />
              <button onClick={playNext} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '20px', cursor: 'pointer', marginLeft: '15px' }}>⏭</button>
            </div>
          </div>

          {/* 2. FULL SCREEN EXPANDED PLAYER POPUP */}
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'linear-gradient(to bottom, #2c3e50, #0f2027)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000, padding: '40px',
            transform: isPopupExpanded ? 'translateY(0)' : 'translateY(100%)',
            transition: 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)'
          }}>
            {/* Top Close Button bar */}
            <button 
              onClick={() => setIsPopupExpanded(false)}
              style={{ position: 'absolute', top: '30px', left: '30px', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', padding: '10px 20px', borderRadius: '20px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' }}
            >
              ↓ Slide Down
            </button>

            {/* Giant Spinning Album Artwork Display Container */}
            <div style={{ position: 'relative', marginBottom: '30px' }}>
              <img 
                src={`http://localhost:8000/api/cover/${encodeURIComponent(currentSong.file_path)}`} 
                alt="expanded art" 
                style={{ 
                  width: '320px', height: '320px', borderRadius: '50%', objectFit: 'cover', 
                  boxShadow: '0 15px 35px rgba(0,0,0,0.6)', border: '10px solid #111',
                  animation: 'spin 20s linear infinite'
                }}
              />
              {/* Turntable Center Spindle Node */}
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '25px', height: '25px', backgroundColor: '#0f2027', borderRadius: '50%', border: '4px solid #fff' }} />
            </div>

            {/* Track Info Labels */}
            <h2 style={{ margin: '0 0 8px 0', textAlign: 'center', fontSize: '28px' }}>{currentSong.title}</h2>
            <p style={{ margin: '0 0 40px 0', color: '#1db954', fontSize: '18px', fontWeight: '500' }}>{currentSong.artist}</p>

            {/* Central Playback Controller Dashboard */}
            <div style={{ width: '100%', maxWidth: '500px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '40px', marginBottom: '25px' }}>
                <button onClick={playPrevious} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '36px', cursor: 'pointer', transition: '0.2s' }}>⏮</button>
                <button onClick={playNext} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '36px', cursor: 'pointer', transition: '0.2s' }}>⏭</button>
              </div>

              {/* Media Core Player Interface Link */}
              <audio 
                src={`http://localhost:8000/api/audio/${encodeURIComponent(currentSong.file_path)}`} 
                controls 
                autoPlay 
                onEnded={playNext}
                style={{ width: '100%', filter: 'invert(1) hue-rotate(180deg)' }} // Theme-matches vanilla audio color scheme into dark mode
              />
            </div>
          </div>
        </>
      )}

      {/* Appended Vinyl Animation Framework Injection */}
      <style>{`
        @keyframes vinyl-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default App;