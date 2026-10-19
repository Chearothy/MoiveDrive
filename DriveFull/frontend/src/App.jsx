import { useEffect, useMemo, useState } from 'react';
import { Folder, Film, Settings, Search, RefreshCw, ExternalLink, ChevronRight, Plus, Trash2 } from 'lucide-react';

const API = import.meta.env.VITE_API_BASE || 'https://localhost:7001';
const KEY = 'drivefull.sources.v1';

function readSources() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  } catch {
    return [];
  }
}

// Helper to extract clean Folder or File ID from Google Drive URLs
function extractDriveId(url) {
  if (!url) return '';
  const matchFolder = url.match(/folders\/([a-zA-Z0-9_-]+)/);
  if (matchFolder) return matchFolder[1];
  const matchFile = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (matchFile) return matchFile[1];
  return url;
}

export default function App() {
  const [sources, setSources] = useState(readSources);
  const [name, setName] = useState('');
  const [link, setLink] = useState('');
  const [active, setActive] = useState(null);
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState('');
  const [message, setMessage] = useState('Website នេះមិនត្រូវការ Login ទេ។ ប្រើ Public Google Drive Folder Link។');
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState('home');

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(sources));
  }, [sources]);

  useEffect(() => {
    setMessage('Website នេះមិនត្រូវការ Login ទេ។ Folder ត្រូវបើកសិទ្ធិ Anyone with the link — Viewer។');
  }, []);

  const visible = useMemo(
    () => items.filter((x) => x.name?.toLowerCase().includes(query.toLowerCase())),
    [items, query]
  );

  async function browse(source) {
    setActive(source);
    setLoading(true);
    setMessage('កំពុងអាន Google Drive…');
    setItems([]);
    try {
      const endpoint = `${API}/api/drive/public-children?folderLink=${encodeURIComponent(source.link)}`;
      const res = await fetch(endpoint);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'មិនអាចអាន Folder បានទេ។');
      const rows = data.items || data.files || [];

      setItems(
        rows.map((x) => {
          const isFolder = x.isFolder ?? x.mimeType === 'application/vnd.google-apps.folder';
          const isVideo = x.mimeType?.startsWith('video/') || /\.(mp4|webm|mkv|mov|avi)$/i.test(x.name || '');
          
          // Formatted preview & stream URLs for robust video playback
          const previewUrl = x.previewUrl || (isVideo ? `https://drive.google.com/file/d/${x.id}/preview` : null);
          const streamUrl = x.streamUrl || (isVideo ? `${API}/api/drive/stream/${x.id}` : null);

          return {
            ...x,
            isFolder,
            isVideo,
            previewUrl,
            streamUrl,
          };
        })
      );
      setMessage(`បានទាញយកឯកសារ ${rows.length} មុខ តាម Public Link។`);
    } catch (e) {
      setMessage(e.message || 'មានបញ្ហាក្នុងការអាន Folder។');
    } finally {
      setLoading(false);
    }
  }

  function addSource(e) {
    e.preventDefault();
    if (!link.trim()) {
      setMessage('សូមបញ្ចូល Google Drive Folder link។');
      return;
    }
    const s = { id: crypto.randomUUID(), name: name.trim() || 'Drive Folder', link: link.trim() };
    setSources((prev) => [...prev, s]);
    setName('');
    setLink('');
    setMessage('បានរក្សាទុក Link ក្នុង Browser។ ចុច Browse ដើម្បីពិនិត្យសិទ្ធិ។');
  }

  const filteredSources = sources.filter((s) => s.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <main className="app">
      <nav className="topbar">
        <a
          className="brand"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setTab('home');
          }}
        >
          <span className="logo">▶</span> MY DRIVE <b>VIDEO LIBRARY</b>
        </a>
        <div className="navs">
          <button className={tab === 'home' ? 'selected' : ''} onClick={() => setTab('home')}>
            Home
          </button>
          <button className={tab === 'settings' ? 'selected' : ''} onClick={() => setTab('settings')}>
            <Settings size={15} /> Settings
          </button>
          <span className="public-label">No Login Required</span>
        </div>
      </nav>

      {tab === 'home' ? (
        <>
          <header className="hero">
            <div className="eyebrow">YOUR PERSONAL LIBRARY</div>
            <h1>
              Browse your folders,
              <br />
              <span>play from Drive.</span>
            </h1>
            <p>បញ្ចូល Public Google Drive Folder Link — មិនចាំបាច់ Login ទេ។</p>
            <div className="searchbar">
              <Search size={18} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="ស្វែងរក Folder ឬវីដេអូ…"
              />
              <button onClick={() => (active ? browse(active) : setMessage('ជ្រើស Folder មួយជាមុន។'))}>
                <RefreshCw size={15} /> Refresh
              </button>
            </div>
          </header>

          <section className="content">
            <h2>{active ? active.name : 'Folder របស់អ្នក'}</h2>
            <p className="status">
              {message}
              {loading ? ' ⏳' : ''}
            </p>

            {!active ? (
              <div className="cards">
                {filteredSources.map((s) => (
                  <button className="folder-card" key={s.id} onClick={() => browse(s)}>
                    <Folder />
                    <span>
                      <b>{s.name}</b>
                      <small>ចុចដើម្បីបើក Folder</small>
                    </span>
                    <ChevronRight />
                  </button>
                ))}
              </div>
            ) : (
              <>
                <button
                  className="back"
                  onClick={() => {
                    setActive(null);
                    setItems([]);
                  }}
                >
                  ← ត្រឡប់ទៅ Folder
                </button>
                <div className="cards">
                  {visible.map((f) => (
                    <article className="file-card" key={f.id}>
                      {f.isFolder ? <Folder /> : <Film />}
                      <b>{f.name}</b>
                      <small>{f.isFolder ? 'Folder' : f.mimeType}</small>

                      {/* Video Player Section */}
                      {f.isVideo && (
                        <>
                          <div className="player" style={{ marginTop: '10px', marginBottom: '10px' }}>
                            <iframe
                              src={f.previewUrl}
                              title={f.name}
                              allow="autoplay; encrypted-media; picture-in-picture"
                              allowFullScreen
                              style={{ width: '100%', height: '240px', border: 'none', borderRadius: '8px' }}
                            />
                          </div>
                          <a
                            href={f.webViewLink || `https://drive.google.com/file/d/${f.id}/view`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            បើកក្នុង Drive <ExternalLink size={13} />
                          </a>
                        </>
                      )}

                      {/* Folder Navigation */}
                      {f.isFolder && (
                        <button
                          onClick={() =>
                            browse({
                              ...active,
                              name: f.name,
                              link: `https://drive.google.com/drive/folders/${f.id}`,
                            })
                          }
                        >
                          បើក Folder <ChevronRight size={14} />
                        </button>
                      )}
                    </article>
                  ))}
                </div>
              </>
            )}
          </section>
        </>
      ) : (
        <section className="settings">
          <div className="eyebrow">PERSONAL SETTINGS</div>
          <h1>ភ្ជាប់ Google Drive Folder</h1>
          <p className="status">
            Website មិនត្រូវការ Login ទេ។ Folder ត្រូវបានកំណត់ Share → General access → Anyone with the link → Viewer។ Folder ឯកជនមិនអាចបើកតាមវិធីនេះបានទេ។
          </p>

          <form className="form" onSubmit={addSource}>
            <label>ឈ្មោះ Folder (ស្រេចចិត្ត)</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ឧ. Training videos"
            />
            <label>Google Drive Folder Link</label>
            <input
              type="url"
              required
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://drive.google.com/drive/folders/..."
            />
            <button className="primary">
              <Plus size={16} /> បន្ថែម Folder
            </button>
          </form>

          <h2>Folder ដែលបានរក្សាទុក ({sources.length})</h2>
          <div className="saved">
            {sources.map((s) => (
              <div className="saved-row" key={s.id}>
                <Folder />
                <span>
                  <b>{s.name}</b>
                  <small>{s.link}</small>
                </span>
                <button
                  onClick={() =>
                    browse(s).then(() => setTab('home'))
                  }
                >
                  Browse
                </button>
                <button
                  className="remove"
                  onClick={() => setSources((p) => p.filter((x) => x.id !== s.id))}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>

          <p className="note">
            Folder Link ត្រូវបានរក្សាទុកក្នុង Browser នេះប៉ុណ្ណោះ។ មិនមានការផ្ទេរ ឬកែប្រែឯកសារដើមក្នុង Drive ទេ។ ដើម្បីរក្សាឯកជនភាព សូមកុំបើក Anyone with the link សម្រាប់ឯកសារសម្ងាត់។
          </p>
          <button onClick={() => setTab('home')}>← ត្រឡប់ Home</button>
        </section>
      )}

      <footer>React + ASP.NET Core Web API · Google Drive API</footer>
    </main>
  );
}
