import { useState, useEffect, useRef } from "react";

const QUOTES = [
  "The secret of getting ahead is getting started. — Mark Twain",
  "Focus on being productive instead of busy. — Tim Ferriss",
  "Your future is created by what you do today. — Robert Kiyosaki",
  "Small daily improvements lead to stunning results. — Robin Sharma",
  "Done is better than perfect. — Sheryl Sandberg",
  "Energy and persistence conquer all things. — Benjamin Franklin",
  "The best way to predict the future is to create it. — Peter Drucker",
];

function FlowLogo() {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="lg1" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#7c3aed"/>
          <stop offset="100%" stopColor="#38bdf8"/>
        </linearGradient>
        <linearGradient id="lg2" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#a78bfa"/>
          <stop offset="100%" stopColor="#7dd3fc"/>
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="18" fill="url(#lg1)"/>
      <rect x="1" y="1" width="62" height="62" rx="17" stroke="white" strokeOpacity="0.15" strokeWidth="1"/>
      {/* Checkmark circle */}
      <circle cx="32" cy="28" r="13" stroke="url(#lg2)" strokeWidth="2.5" fill="none"/>
      {/* Checkmark */}
      <path d="M24.5 28.5L29.5 33.5L39.5 23" stroke="white" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"/>
      {/* Bottom bar */}
      <rect x="18" y="46" width="28" height="3.5" rx="1.75" fill="white" fillOpacity="0.9"/>
      <rect x="22" y="52" width="20" height="3.5" rx="1.75" fill="white" fillOpacity="0.5"/>
    </svg>
  );
}

function Sparkle({ x, y, onDone }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = 120; canvas.height = 120;
    const particles = Array.from({ length: 18 }, (_, i) => ({
      angle: (i / 18) * Math.PI * 2,
      speed: Math.random() * 3 + 1.5,
      r: Math.random() * 4 + 2,
      color: ["#a78bfa","#38bdf8","#34d399","#fbbf24"][Math.floor(Math.random()*4)],
      life: 1,
      decay: Math.random() * 0.03 + 0.02,
    }));
    let frame;
    const draw = () => {
      ctx.clearRect(0, 0, 120, 120);
      let alive = false;
      particles.forEach(p => {
        if (p.life <= 0) return;
        alive = true;
        p.x = (p.x || 60) + Math.cos(p.angle) * p.speed;
        p.y = (p.y || 60) + Math.sin(p.angle) * p.speed;
        p.life -= p.decay;
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      if (alive) frame = requestAnimationFrame(draw);
      else onDone();
    };
    draw();
    return () => cancelAnimationFrame(frame);
  }, []);
  return (
    <canvas ref={canvasRef} style={{
      position:"fixed", left: x-60, top: y-60,
      pointerEvents:"none", zIndex:9998, width:120, height:120
    }}/>
  );
}

function Confetti({ active }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const pieces = Array.from({ length: 150 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * -canvas.height,
      r: Math.random() * 8 + 4,
      color: ["#7c3aed","#38bdf8","#34d399","#fbbf24","#f87171"][Math.floor(Math.random()*5)],
      speed: Math.random() * 4 + 2,
      angle: Math.random() * 360,
      spin: Math.random() * 4 - 2,
    }));
    let frame;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pieces.forEach(p => {
        ctx.save(); ctx.translate(p.x, p.y);
        ctx.rotate((p.angle*Math.PI)/180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.r/2,-p.r/2,p.r,p.r);
        ctx.restore();
        p.y += p.speed; p.angle += p.spin;
        if (p.y > canvas.height) p.y = -10;
      });
      frame = requestAnimationFrame(draw);
    };
    draw();
    const t = setTimeout(() => cancelAnimationFrame(frame), 3200);
    return () => { cancelAnimationFrame(frame); clearTimeout(t); };
  }, [active]);
  return active ? <canvas ref={canvasRef} style={{ position:"fixed",top:0,left:0,pointerEvents:"none",zIndex:9999 }}/> : null;
}

const PC = {
  high:   { bg:"#3f0f0f", text:"#f87171", border:"#f87171" },
  medium: { bg:"#2d2010", text:"#fbbf24", border:"#fbbf24" },
  low:    { bg:"#0f2d1a", text:"#34d399",  border:"#34d399" },
};

const T = {
  a:"#7c3aed", b:"#38bdf8",
  bg:"#080c14", card:"#0f1623",
  border:"#1a2540", text:"#e2e8f0",
  muted:"#4a5568", sub:"#0a1020",
  accbg:"#150d2e", accborder:"#7c3aed", acctext:"#a78bfa",
};

export default function App() {
  const [tasks, setTasks] = useState(() => {
    try { return JSON.parse(localStorage.getItem("flowtask") || "[]"); } catch { return []; }
  });
  const [input, setInput] = useState("");
  const [priority, setPriority] = useState("medium");
  const [dueDate, setDueDate] = useState("");
  const [filter, setFilter] = useState("all");
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [confetti, setConfetti] = useState(false);
  const [search, setSearch] = useState("");
  const [sparkles, setSparkles] = useState([]);
  const prevDone = useRef(0);
  const quote = QUOTES[new Date().getDay() % QUOTES.length];

  useEffect(() => {
    localStorage.setItem("flowtask", JSON.stringify(tasks));
    const done = tasks.filter(t => t.done).length;
    if (tasks.length > 0 && done === tasks.length && done > prevDone.current) {
      setConfetti(true); setTimeout(() => setConfetti(false), 3200);
    }
    prevDone.current = done;
  }, [tasks]);

  const addTask = () => {
    if (!input.trim()) return;
    setTasks([{ id:Date.now(), text:input.trim(), priority, done:false, dueDate }, ...tasks]);
    setInput(""); setDueDate("");
  };

  const toggleDone = (id, e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const task = tasks.find(t => t.id === id);
    if (!task.done) {
      const sid = Date.now();
      setSparkles(s => [...s, { id: sid, x: cx, y: cy }]);
    }
    setTasks(tasks.map(t => t.id===id ? {...t, done:!t.done} : t));
  };

  const removeSparkle = (id) => setSparkles(s => s.filter(sp => sp.id !== id));
  const deleteTask = (id) => setTasks(tasks.filter(t => t.id!==id));
  const clearDone = () => setTasks(tasks.filter(t => !t.done));
  const startEdit = (task) => { setEditingId(task.id); setEditText(task.text); };
  const saveEdit = (id) => {
    if (!editText.trim()) return;
    setTasks(tasks.map(t => t.id===id ? {...t,text:editText.trim()} : t));
    setEditingId(null);
  };

  const total = tasks.length;
  const done = tasks.filter(t => t.done).length;
  const active = total - done;
  const pct = total===0 ? 0 : Math.round((done/total)*100);
  const filtered = tasks.filter(t => {
    const mf = filter==="all" ? true : filter==="done" ? t.done : !t.done;
    return mf && t.text.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div style={{
      minHeight:"100vh",
      background: T.bg,
      backgroundImage:`
        radial-gradient(ellipse at 20% 20%, ${T.a}18 0%, transparent 50%),
        radial-gradient(ellipse at 80% 80%, ${T.b}12 0%, transparent 50%),
        linear-gradient(${T.border}55 1px, transparent 1px),
        linear-gradient(90deg, ${T.border}55 1px, transparent 1px)
      `,
      backgroundSize:`100% 100%, 100% 100%, 32px 32px, 32px 32px`,
      padding:"32px 16px 80px",
      fontFamily:"'Segoe UI',sans-serif",
      color: T.text,
    }}>
      <Confetti active={confetti} />
      {sparkles.map(sp => <Sparkle key={sp.id} x={sp.x} y={sp.y} onDone={() => removeSparkle(sp.id)} />)}

      <div style={{ maxWidth:680, margin:"0 auto" }}>

        {/* Header */}
        <div style={{ textAlign:"center", marginBottom:36 }}>
          <div style={{ marginBottom:14, filter:`drop-shadow(0 8px 24px ${T.a}66)` }}>
            <FlowLogo />
          </div>
          <div style={{ marginBottom:6 }}>
            <span style={{
              fontSize:52, fontWeight:900, letterSpacing:"-1.5px", lineHeight:1,
              background:`linear-gradient(135deg, #a78bfa 0%, #38bdf8 100%)`,
              WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
              backgroundClip:"text", display:"inline-block", paddingBottom:4,
            }}>
              FlowTask
            </span>
          </div>
          <p style={{ color:T.muted, fontSize:13, margin:"0 0 16px", letterSpacing:"0.3px" }}>
            Your tasks. Your flow. Your rules.
          </p>
          {/* Daily Quote */}
          <div style={{ display:"inline-block", background:T.card, border:`1px solid ${T.border}`, borderLeft:`3px solid ${T.a}`, borderRadius:10, padding:"10px 18px", maxWidth:520 }}>
            <p style={{ color:"#a78bfa", fontSize:12, margin:0, fontStyle:"italic", lineHeight:1.6 }}>
              💡 "{quote}"
            </p>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display:"flex", gap:12, marginBottom:16 }}>
          {[["Total",total,T.a],["Active",active,T.b],["Done",done,"#34d399"]].map(([label,val,color]) => (
            <div key={label} style={{ flex:1, background:T.card, border:`1px solid ${T.border}`, borderRadius:14, padding:"16px 12px", textAlign:"center", boxShadow:`0 0 30px ${T.a}15` }}>
              <div style={{ fontSize:32, fontWeight:800, color, lineHeight:1 }}>{val}</div>
              <div style={{ fontSize:10, color:T.muted, textTransform:"uppercase", letterSpacing:"1.5px", marginTop:4 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Progress */}
        <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:14, padding:"18px 20px", marginBottom:14, boxShadow:`0 0 30px ${T.a}15` }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
            <span style={{ fontSize:13, color:T.muted, fontWeight:500 }}>Overall Progress</span>
            <span style={{ fontSize:15, fontWeight:800, background:`linear-gradient(135deg,${T.a},${T.b})`, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>{pct}%</span>
          </div>
          <div style={{ background:T.sub, borderRadius:999, height:8, overflow:"hidden" }}>
            <div style={{ width:`${pct}%`, height:"100%", borderRadius:999, background:`linear-gradient(90deg,${T.a},${T.b})`, transition:"width 0.5s ease", boxShadow:`0 0 12px ${T.a}88` }} />
          </div>
          {done > 0 && (
            <div style={{ display:"flex", justifyContent:"flex-end", marginTop:12 }}>
              <button onClick={clearDone} style={{ background:"none", border:`1px solid ${T.border}`, borderRadius:8, padding:"4px 14px", color:T.muted, fontSize:12, cursor:"pointer" }}>
                🗑 Clear completed ({done})
              </button>
            </div>
          )}
        </div>

        {/* Search */}
        <div style={{ position:"relative", marginBottom:12 }}>
          <span style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", fontSize:14, color:T.muted }}>🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tasks..."
            style={{ width:"100%", boxSizing:"border-box", background:T.card, border:`1px solid ${T.border}`, borderRadius:12, padding:"12px 16px 12px 40px", color:T.text, fontSize:14, outline:"none" }} />
        </div>

        {/* Input Row */}
        <div style={{ display:"flex", gap:10, marginBottom:10, flexWrap:"wrap" }}>
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key==="Enter" && addTask()}
            placeholder="What needs to be done?"
            style={{ flex:1, minWidth:200, background:T.card, border:`1px solid ${T.border}`, borderRadius:12, padding:"13px 16px", color:T.text, fontSize:14, outline:"none" }} />
          <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
            style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:12, padding:"13px 12px", color:T.muted, fontSize:13, outline:"none" }} />
          <select value={priority} onChange={e => setPriority(e.target.value)}
            style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:12, padding:"13px 12px", color:T.text, fontSize:13, outline:"none", cursor:"pointer" }}>
            <option value="high">🔴 High</option>
            <option value="medium">🟡 Medium</option>
            <option value="low">🟢 Low</option>
          </select>
          <button onClick={addTask}
            style={{ background:`linear-gradient(135deg,${T.a},${T.b})`, border:"none", borderRadius:12, padding:"13px 24px", color:"#fff", fontSize:14, fontWeight:700, cursor:"pointer", boxShadow:`0 4px 20px ${T.a}55` }}>
            + Add
          </button>
        </div>

        {/* Filters */}
        <div style={{ display:"flex", gap:8, marginBottom:20 }}>
          {[["all","All",total],["active","Active",active],["done","Done",done]].map(([f,label,count]) => (
            <button key={f} onClick={() => setFilter(f)}
              style={{ background: filter===f ? T.accbg : T.card, border:`1px solid ${filter===f ? T.accborder : T.border}`, borderRadius:10, padding:"8px 18px", color: filter===f ? T.acctext : T.muted, fontSize:13, cursor:"pointer", fontWeight: filter===f ? 700 : 400, display:"flex", alignItems:"center", gap:8, boxShadow: filter===f ? `0 0 16px ${T.a}33` : "none" }}>
              {label}
              <span style={{ background: filter===f ? T.accborder : T.border, color:"#fff", borderRadius:999, fontSize:11, padding:"1px 8px", fontWeight:700 }}>{count}</span>
            </button>
          ))}
        </div>

        {/* Task List */}
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign:"center", padding:"56px 20px", color:T.muted }}>
              <div style={{ fontSize:48, marginBottom:14 }}>{filter==="done" ? "🏆" : search ? "🔍" : "🌙"}</div>
              <p style={{ fontSize:15 }}>
                {filter==="done" ? "No completed tasks yet." : search ? "No tasks match your search." : "No tasks here. Add one above!"}
              </p>
            </div>
          ) : filtered.map(task => {
            const pc = PC[task.priority];
            const overdue = task.dueDate && !task.done && new Date(task.dueDate) < new Date();
            return (
              <div key={task.id} style={{ background:T.card, border:`1px solid ${T.border}`, borderLeft:`4px solid ${pc.border}`, borderRadius:14, padding:"16px 16px", display:"flex", alignItems:"flex-start", gap:14, opacity: task.done ? 0.45 : 1, transition:"opacity 0.3s", boxShadow:`-4px 0 20px ${pc.border}22` }}>
                {/* Checkbox */}
                <div onClick={(e) => toggleDone(task.id, e)}
                  style={{ width:24, height:24, borderRadius:"50%", border: task.done ? "none" : `2px solid ${T.border}`, background: task.done ? `linear-gradient(135deg,${T.a},${T.b})` : "transparent", cursor:"pointer", flexShrink:0, marginTop:1, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, color:"#fff", fontWeight:900, boxShadow: task.done ? `0 0 12px ${T.a}66` : "none", transition:"all 0.2s" }}>
                  {task.done ? "✓" : ""}
                </div>
                {/* Body */}
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap", marginBottom:6 }}>
                    <span style={{ fontSize:10, fontWeight:700, padding:"3px 10px", borderRadius:999, textTransform:"uppercase", letterSpacing:"0.8px", background:pc.bg, color:pc.text }}>{task.priority}</span>
                    {task.dueDate && <span style={{ fontSize:11, color: overdue ? "#f87171" : T.muted }}>{overdue ? "⚠️ Overdue · " : "📅 "}{task.dueDate}</span>}
                  </div>
                  {editingId === task.id ? (
                    <input value={editText} onChange={e => setEditText(e.target.value)} onKeyDown={e => e.key==="Enter" && saveEdit(task.id)} autoFocus
                      style={{ width:"100%", background:T.sub, border:`1px solid ${T.a}`, borderRadius:8, padding:"7px 12px", color:T.text, fontSize:14, outline:"none" }} />
                  ) : (
                    <div style={{ fontSize:15, textDecoration: task.done ? "line-through" : "none", color: task.done ? T.muted : T.text, wordBreak:"break-word", lineHeight:1.5 }}>{task.text}</div>
                  )}
                </div>
                {/* Actions */}
                <div style={{ display:"flex", gap:4, flexShrink:0 }}>
                  {editingId === task.id
                    ? <button onClick={() => saveEdit(task.id)} style={{ background:"none", border:"none", cursor:"pointer", fontSize:18, padding:"4px 6px", borderRadius:8 }}>💾</button>
                    : <button onClick={() => startEdit(task)} style={{ background:"none", border:"none", cursor:"pointer", fontSize:18, padding:"4px 6px", borderRadius:8 }}>✏️</button>
                  }
                  <button onClick={() => deleteTask(task.id)} style={{ background:"none", border:"none", cursor:"pointer", fontSize:18, padding:"4px 6px", borderRadius:8 }}>🗑️</button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{ textAlign:"center", marginTop:40, color:T.muted, fontSize:12, letterSpacing:"0.5px" }}>
          Built with ❤️ · FlowTask · Stay in the flow
        </div>

      </div>
    </div>
  );
}