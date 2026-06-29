import { useState } from "react";

const RATING_COLORS = {
  800: "#808080", 900: "#808080", 1000: "#808080",
  1100: "#008000", 1200: "#008000", 1300: "#008000",
  1400: "#03A89E", 1500: "#03A89E", 1600: "#03A89E",
  1700: "#0000FF", 1800: "#0000FF", 1900: "#0000FF",
  2000: "#AA00AA", 2100: "#AA00AA", 2200: "#FF8C00",
  2300: "#FF8C00", 2400: "#FF8C00", 2500: "#FF0000",
  2600: "#FF0000", 2700: "#FF0000", 2800: "#FF0000",
  3000: "#FF0000",
};

function getRatingColor(rating) {
  if (!rating || rating === "Unrated") return "#808080";
  const keys = Object.keys(RATING_COLORS).map(Number).sort((a, b) => a - b);
  let color = "#808080";
  for (const key of keys) {
    if (rating >= key) color = RATING_COLORS[key];
  }
  return color;
}

function getRatingLabel(rating) {
  if (!rating || rating === "Unrated") return "Unrated";
  if (rating < 1200) return "Newbie";
  if (rating < 1400) return "Pupil";
  if (rating < 1600) return "Specialist";
  if (rating < 1900) return "Expert";
  if (rating < 2100) return "Candidate Master";
  if (rating < 2300) return "Master";
  if (rating < 2400) return "International Master";
  if (rating < 2600) return "Grandmaster";
  if (rating < 3000) return "International Grandmaster";
  return "Legendary Grandmaster";
}

const TAG_PALETTE = [
  "#1a1a2e", "#16213e", "#0f3460", "#533483", "#2d6a4f",
  "#1b4332", "#264653", "#2a9d8f", "#6d2d92", "#3a0ca3",
];

function TagBadge({ tag, index }) {
  const bg = TAG_PALETTE[index % TAG_PALETTE.length];
  return (
    <span style={{
      background: bg,
      color: "#e0e0e0",
      padding: "2px 10px",
      borderRadius: "3px",
      fontSize: "11px",
      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
      fontWeight: 500,
      letterSpacing: "0.3px",
      border: "1px solid rgba(255,255,255,0.08)",
      whiteSpace: "nowrap",
    }}>
      {tag}
    </span>
  );
}

function ProblemCard({ problem, index }) {
  const color = getRatingColor(problem.rating);
  return (
    <a
      href={problem.link}
      target="_blank"
      rel="noopener noreferrer"
      style={{ textDecoration: "none" }}
    >
      <div style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderLeft: `3px solid ${color}`,
        borderRadius: "6px",
        padding: "16px 20px",
        marginBottom: "10px",
        cursor: "pointer",
        transition: "all 0.15s ease",
        display: "flex",
        alignItems: "flex-start",
        gap: "16px",
      }}
        onMouseEnter={e => {
          e.currentTarget.style.background = "rgba(255,255,255,0.06)";
          e.currentTarget.style.transform = "translateX(4px)";
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = "rgba(255,255,255,0.03)";
          e.currentTarget.style.transform = "translateX(0)";
        }}
      >
        <div style={{
          minWidth: "28px", height: "28px", borderRadius: "4px",
          background: "rgba(255,255,255,0.05)", display: "flex",
          alignItems: "center", justifyContent: "center",
          fontSize: "12px", fontFamily: "monospace",
          color: "#888", fontWeight: 700, marginTop: "1px",
        }}>
          {String(index + 1).padStart(2, "0")}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "15px", fontWeight: 600, color: "#f0f0f0", fontFamily: "'Inter', sans-serif" }}>
              {problem.name}
            </span>
            <span style={{
              fontSize: "13px", fontWeight: 700, color: color,
              fontFamily: "monospace", background: `${color}18`,
              padding: "2px 8px", borderRadius: "4px", border: `1px solid ${color}40`,
            }}>
              {problem.rating}
            </span>
          </div>
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {problem.tags.map((tag, i) => (
              <TagBadge key={tag} tag={tag} index={i} />
            ))}
          </div>
        </div>

        <div style={{ color: "#444", fontSize: "18px", alignSelf: "center" }}>→</div>
      </div>
    </a>
  );
}

function WeaknessBar({ tags }) {
  return (
    <div style={{ marginBottom: "28px" }}>
      <div style={{
        fontSize: "11px", fontFamily: "monospace", color: "#666",
        letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "10px",
      }}>
        WEAKNESS DIAGNOSIS
      </div>
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        {tags.map((tag, i) => (
          <div key={tag} style={{
            display: "flex", alignItems: "center", gap: "8px",
            background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)",
            borderRadius: "6px", padding: "6px 14px",
          }}>
            <div style={{
              width: "6px", height: "6px", borderRadius: "50%",
              background: `hsl(${0 + i * 15}, 70%, 55%)`,
            }} />
            <span style={{ color: "#e57373", fontFamily: "monospace", fontSize: "13px", fontWeight: 600 }}>
              {tag}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function RatingDisplay({ rating }) {
  const color = getRatingColor(rating);
  const label = getRatingLabel(rating);
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: "10px",
      background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: "8px", padding: "10px 16px", marginBottom: "24px",
    }}>
      <div style={{
        width: "10px", height: "10px", borderRadius: "50%",
        background: color, boxShadow: `0 0 8px ${color}`,
      }} />
      <span style={{ color: "#aaa", fontSize: "13px", fontFamily: "monospace" }}>targeting</span>
      <span style={{ color: color, fontSize: "20px", fontWeight: 800, fontFamily: "monospace", letterSpacing: "-0.5px" }}>
        {rating}
      </span>
      <span style={{ color: color, fontSize: "12px", fontFamily: "monospace", opacity: 0.8 }}>
        {label}
      </span>
    </div>
  );
}

function TerminalLine({ children, delay = 0, color = "#4ade80" }) {
  return (
    <div style={{
      fontFamily: "monospace", fontSize: "13px", color: color,
      animation: `fadeIn 0.3s ease ${delay}s both`, lineHeight: "1.8",
    }}>
      {children}
    </div>
  );
}

// ── Error state component ──────────────────────────────────────────────────────
function ErrorState({ message }) {
  const isTimeout = message?.toLowerCase().includes("timeout") ||
                    message?.toLowerCase().includes("failed to fetch");
  return (
    <div style={{
      background: "rgba(239,68,68,0.05)",
      border: "1px solid rgba(239,68,68,0.2)",
      borderRadius: "8px",
      padding: "20px 24px",
      fontFamily: "monospace",
      fontSize: "13px",
      color: "#ef4444",
      animation: "fadeIn 0.3s ease",
    }}>
      <div style={{ fontWeight: 700, marginBottom: "8px", fontSize: "11px", letterSpacing: "1.5px" }}>
        ERROR
      </div>

      {isTimeout ? (
        <>
          <div style={{ color: "#f0a0a0", marginBottom: "12px", lineHeight: 1.7 }}>
            The server is waking up — it sleeps after 15 minutes of inactivity.
          </div>
          <div style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: "6px",
            padding: "12px 16px",
            color: "#888",
            lineHeight: 1.8,
          }}>
            <div style={{ color: "#4ade80", marginBottom: "4px" }}>▶ what to do</div>
            Wait 20–30 seconds, then try again. The server will be ready.
          </div>
        </>
      ) : (
        <>
          <div style={{ color: "#f0a0a0", marginBottom: "12px", lineHeight: 1.7 }}>
            {message}
          </div>
          <div style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: "6px",
            padding: "12px 16px",
            color: "#888",
            lineHeight: 1.8,
          }}>
            <div style={{ color: "#4ade80", marginBottom: "4px" }}>▶ possible causes</div>
            <div>· The Codeforces handle doesn't exist</div>
            <div>· Codeforces API is temporarily down</div>
            <div>· Network issue on your end</div>
          </div>
        </>
      )}
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [handle, setHandle] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [inputFocused, setInputFocused] = useState(false);

  const analyze = async () => {
    if (!handle.trim()) return;
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const controller = new AbortController();
      // 40s timeout — enough for Render cold start + CF API call
      const timeoutId = setTimeout(() => controller.abort(), 40000);

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/analyze/${handle.trim()}`,
        { signal: controller.signal }
      );
      clearTimeout(timeoutId);

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      if (data.Message?.includes("Error fetching")) {
        setError("Codeforces returned an error. The handle may not exist or CF API is down.");
        return;
      }

      setResult(data);
    } catch (err) {
      if (err.name === "AbortError") {
        setError("timeout");
      } else {
        setError(err.message || "Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => { if (e.key === "Enter") analyze(); };

  const isNotEnoughData = result?.diagnosis?.includes("Not enough data");
  const isNoWrong = result?.diagnosis?.includes("No Wrong Submissions");
  const isSuccess = result && result["Recommended Problem"] && !isNotEnoughData && !isNoWrong;

  return (
    <div style={{
      minHeight: "100vh", background: "#0d0d0d",
      color: "#f0f0f0", fontFamily: "'Inter', system-ui, sans-serif", padding: "0",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes scanline { 0% { transform: translateY(-100%); } 100% { transform: translateY(100vh); } }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #111; }
        ::-webkit-scrollbar-thumb { background: #333; border-radius: 2px; }
      `}</style>

      {/* Scanline */}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
        <div style={{
          position: "absolute", left: 0, right: 0, height: "2px",
          background: "linear-gradient(transparent, rgba(74,222,128,0.03), transparent)",
          animation: "scanline 8s linear infinite",
        }} />
      </div>

      {/* Grid */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
        backgroundImage: `linear-gradient(rgba(74,222,128,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(74,222,128,0.02) 1px, transparent 1px)`,
        backgroundSize: "40px 40px",
      }} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: "760px", margin: "0 auto", padding: "48px 24px 80px" }}>

        {/* Header */}
        <div style={{ marginBottom: "52px" }}>
          <div style={{
            fontFamily: "monospace", fontSize: "11px", color: "#4ade80",
            letterSpacing: "3px", textTransform: "uppercase", marginBottom: "12px", opacity: 0.7,
          }}>
            $ ./algo_coach --init
          </div>
          <h1 style={{
            fontSize: "clamp(36px, 6vw, 56px)", fontWeight: 800,
            margin: "0 0 10px", letterSpacing: "-2px", lineHeight: 1, color: "#ffffff",
          }}>
            Algo<span style={{ color: "#4ade80" }}>Coach</span>
          </h1>
          <p style={{ fontSize: "15px", color: "#666", margin: 0, fontFamily: "monospace", lineHeight: 1.6 }}>
            KNN-powered weakness detection from your Codeforces history.
            <br />
            Enter your handle to get your next 5 problems.
          </p>
        </div>

        {/* Input */}
        <div style={{ marginBottom: "40px" }}>
          <div style={{
            display: "flex", gap: "0",
            border: `1px solid ${inputFocused ? "#4ade80" : "#2a2a2a"}`,
            borderRadius: "8px", overflow: "hidden",
            transition: "border-color 0.2s ease",
            boxShadow: inputFocused ? "0 0 0 3px rgba(74,222,128,0.08)" : "none",
          }}>
            <div style={{
              padding: "0 16px", background: "#111",
              display: "flex", alignItems: "center", borderRight: "1px solid #2a2a2a",
            }}>
              <span style={{ fontFamily: "monospace", fontSize: "14px", color: "#4ade80" }}>$</span>
            </div>
            <input
              type="text"
              value={handle}
              onChange={e => setHandle(e.target.value)}
              onKeyDown={handleKey}
              onFocus={() => setInputFocused(true)}
              onBlur={() => setInputFocused(false)}
              placeholder="enter codeforces handle..."
              style={{
                flex: 1, background: "#111", border: "none", outline: "none",
                color: "#f0f0f0", fontSize: "15px", fontFamily: "monospace",
                padding: "16px 18px", caretColor: "#4ade80",
              }}
            />
            <button
              onClick={analyze}
              disabled={loading || !handle.trim()}
              style={{
                background: loading || !handle.trim() ? "#1a1a1a" : "#4ade80",
                border: "none",
                color: loading || !handle.trim() ? "#444" : "#0d0d0d",
                padding: "0 28px", fontSize: "13px", fontFamily: "monospace",
                fontWeight: 700, cursor: loading || !handle.trim() ? "not-allowed" : "pointer",
                letterSpacing: "0.5px", transition: "all 0.15s ease", whiteSpace: "nowrap",
              }}
            >
              {loading ? (
                <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{
                    width: "12px", height: "12px", border: "2px solid #333",
                    borderTop: "2px solid #4ade80", borderRadius: "50%",
                    display: "inline-block", animation: "spin 0.8s linear infinite",
                  }} />
                  analyzing
                </span>
              ) : "ANALYZE →"}
            </button>
          </div>
          <div style={{ fontFamily: "monospace", fontSize: "11px", color: "#444", marginTop: "8px", paddingLeft: "4px" }}>
            press enter or click ANALYZE · requires 15+ submissions on codeforces
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ background: "#0f0f0f", border: "1px solid #1e1e1e", borderRadius: "8px", padding: "24px" }}>
            <TerminalLine color="#4ade80">▶ fetching submission history...</TerminalLine>
            <TerminalLine color="#4ade80" delay={0.4}>▶ computing tag failure rates...</TerminalLine>
            <TerminalLine color="#4ade80" delay={0.8}>▶ running KNN on problem space...</TerminalLine>
            <TerminalLine color="#888" delay={1.2}>
              <span style={{ animation: "pulse 1s infinite" }}>█</span>
            </TerminalLine>
          </div>
        )}

        {/* Error */}
        {error && <ErrorState message={error} />}

        {/* Not enough data */}
        {isNotEnoughData && (
          <div style={{ background: "#0f0f0f", border: "1px solid #2a2a2a", borderRadius: "8px", padding: "28px", animation: "fadeIn 0.3s ease" }}>
            <div style={{ fontFamily: "monospace", fontSize: "11px", color: "#666", letterSpacing: "1.5px", marginBottom: "16px" }}>DIAGNOSIS</div>
            <div style={{ color: "#f59e0b", fontFamily: "monospace", fontSize: "14px", marginBottom: "20px" }}>⚠ {result.diagnosis}</div>
            <div style={{ marginBottom: "12px", color: "#888", fontSize: "13px" }}>Start here:</div>
            <a href={result.action_plan.link} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
              <div style={{
                background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
                borderLeft: "3px solid #808080", borderRadius: "6px",
                padding: "14px 18px", color: "#f0f0f0", fontWeight: 600, fontSize: "15px",
              }}>
                {result.action_plan.recommended_problem} →
              </div>
            </a>
          </div>
        )}

        {/* No wrong submissions */}
        {isNoWrong && (
          <div style={{
            background: "#0f0f0f", border: "1px solid rgba(74,222,128,0.2)",
            borderRadius: "8px", padding: "28px", animation: "fadeIn 0.3s ease", textAlign: "center",
          }}>
            <div style={{ fontSize: "32px", marginBottom: "12px" }}>🏆</div>
            <div style={{ color: "#4ade80", fontFamily: "monospace", fontSize: "15px", fontWeight: 700 }}>{result.diagnosis}</div>
            <div style={{ color: "#666", fontFamily: "monospace", fontSize: "13px", marginTop: "8px" }}>{result.action_plan}</div>
          </div>
        )}

        {/* Success */}
        {isSuccess && (
          <div style={{ animation: "fadeIn 0.3s ease" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
              <div>
                <div style={{ fontFamily: "monospace", fontSize: "11px", color: "#666", letterSpacing: "1.5px", marginBottom: "4px" }}>ANALYSIS COMPLETE</div>
                <div style={{ fontSize: "22px", fontWeight: 700, color: "#f0f0f0" }}>{result.handle}</div>
              </div>
              <div style={{
                fontFamily: "monospace", fontSize: "11px", color: "#4ade80",
                background: "rgba(74,222,128,0.06)", border: "1px solid rgba(74,222,128,0.15)",
                padding: "6px 12px", borderRadius: "4px",
              }}>
                ✓ 5 problems found
              </div>
            </div>

            <RatingDisplay rating={result["Target Rating"]} />
            <WeaknessBar tags={result["Weakest Tag"].split(",")} />

            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
              <div style={{ fontFamily: "monospace", fontSize: "11px", color: "#666", letterSpacing: "1.5px", whiteSpace: "nowrap" }}>RECOMMENDED PROBLEMS</div>
              <div style={{ flex: 1, height: "1px", background: "#1e1e1e" }} />
            </div>

            {result["Recommended Problem"].map((problem, i) => (
              <ProblemCard key={problem.name} problem={problem} index={i} />
            ))}

            <div style={{
              marginTop: "24px", padding: "14px 18px",
              background: "rgba(74,222,128,0.03)", border: "1px solid rgba(74,222,128,0.08)",
              borderRadius: "6px", fontFamily: "monospace", fontSize: "12px", color: "#555", lineHeight: 1.7,
            }}>
              Problems selected by KNN using your fail-rate weighted tag scores and target rating ±300.
              Solve in any order. Re-analyze after 10+ new submissions for updated recommendations.
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{
          marginTop: "80px", paddingTop: "24px", borderTop: "1px solid #1a1a1a",
          display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px",
        }}>
          <span style={{ fontFamily: "monospace", fontSize: "11px", color: "#333" }}>algo_coach v1.0 · KNN + Codeforces API</span>
          <span style={{ fontFamily: "monospace", fontSize: "11px", color: "#333" }}>data from codeforces.com</span>
        </div>
      </div>
    </div>
  );
}