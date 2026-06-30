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

function TagBadge({ tag, index, highlighted = false }) {
  const bg = TAG_PALETTE[index % TAG_PALETTE.length];
  return (
    <span style={{
      background: highlighted ? "rgba(74,222,128,0.12)" : bg,
      color: highlighted ? "#4ade80" : "#e0e0e0",
      padding: "2px 10px",
      borderRadius: "3px",
      fontSize: "11px",
      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
      fontWeight: 500,
      letterSpacing: "0.3px",
      border: highlighted ? "1px solid rgba(74,222,128,0.35)" : "1px solid rgba(255,255,255,0.08)",
      whiteSpace: "nowrap",
    }}>
      {highlighted && "✓ "}{tag}
    </span>
  );
}

function MatchReason({ reason }) {
  if (!reason) return null;
  const [matched] = reason.tag_match_ratio.split("/").map(Number);
  const diffSign = reason.rating_diff > 0 ? "+" : "";

  return (
    <div style={{
      marginTop: "10px",
      paddingTop: "10px",
      borderTop: "1px dashed rgba(255,255,255,0.08)",
      fontFamily: "monospace",
      fontSize: "11px",
      color: "#666",
      display: "flex",
      gap: "16px",
      flexWrap: "wrap",
    }}>
      <span>
        <span style={{ color: matched > 0 ? "#4ade80" : "#666" }}>{reason.tag_match_ratio}</span> weak tags matched
      </span>
      <span>
        rating <span style={{ color: "#999" }}>{diffSign}{reason.rating_diff}</span> from target
      </span>
    </div>
  );
}

function ProblemCard({ problem, index }) {
  const color = getRatingColor(problem.rating);
  const matchedSet = new Set(problem.match_reason?.matched_tags || []);

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
              <TagBadge key={tag} tag={tag} index={i} highlighted={matchedSet.has(tag)} />
            ))}
          </div>

          <MatchReason reason={problem.match_reason} />
        </div>

        <div style={{ color: "#444", fontSize: "18px", alignSelf: "center" }}>→</div>
      </div>
    </a>
  );
}

function WeaknessBreakdown({ tags, breakdown }) {
  const hasBreakdown = breakdown && breakdown.length > 0;

  return (
    <div style={{ marginBottom: "28px" }}>
      <div style={{
        fontSize: "11px", fontFamily: "monospace", color: "#666",
        letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "10px",
      }}>
        WEAKNESS DIAGNOSIS
      </div>

      {!hasBreakdown ? (
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {tags.map((tag, i) => (
            <div key={tag} style={{
              display: "flex", alignItems: "center", gap: "8px",
              background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)",
              borderRadius: "6px", padding: "6px 14px",
            }}>
              <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: `hsl(${i * 15}, 70%, 55%)` }} />
              <span style={{ color: "#e57373", fontFamily: "monospace", fontSize: "13px", fontWeight: 600 }}>{tag}</span>
            </div>
          ))}
        </div>
      ) : (
        <div style={{
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: "8px",
          padding: "16px 18px",
        }}>
          {breakdown.map((item, i) => (
            <div key={item.tag} style={{ marginBottom: i === breakdown.length - 1 ? 0 : "10px" }}>
              <div style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                marginBottom: "4px", fontFamily: "monospace", fontSize: "12px",
              }}>
                <span style={{ color: i < 3 ? "#e57373" : "#888", fontWeight: i < 3 ? 700 : 400 }}>
                  {item.tag}
                </span>
                <span style={{ color: "#666" }}>
                  {item.fail_count} fail{item.fail_count !== 1 ? "s" : ""} · {item.percentage}%
                </span>
              </div>
              <div style={{ height: "4px", background: "rgba(255,255,255,0.05)", borderRadius: "2px", overflow: "hidden" }}>
                <div style={{
                  width: `${item.percentage}%`,
                  height: "100%",
                  background: i < 3 ? "#e57373" : "#3a3a3a",
                  borderRadius: "2px",
                  transition: "width 0.4s ease",
                }} />
              </div>
            </div>
          ))}
        </div>
      )}
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
      <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: color, boxShadow: `0 0 8px ${color}` }} />
      <span style={{ color: "#aaa", fontSize: "13px", fontFamily: "monospace" }}>targeting</span>
      <span style={{ color: color, fontSize: "20px", fontWeight: 800, fontFamily: "monospace", letterSpacing: "-0.5px" }}>
        {rating}
      </span>
      <span style={{ color: color, fontSize: "12px", fontFamily: "monospace", opacity: 0.8 }}>{label}</span>
    </div>
  );
}

function TerminalLine({ children, delay = 0, color = "#4ade80" }) {
  return (
    <div style={{ fontFamily: "monospace", fontSize: "13px", color: color, animation: `fadeIn 0.3s ease ${delay}s both`, lineHeight: "1.8" }}>
      {children}
    </div>
  );
}

function ErrorState({ error }) {
  if (error.type === "timeout") {
    return (
      <div style={{
        background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.2)",
        borderRadius: "8px", padding: "20px 24px", fontFamily: "monospace",
        fontSize: "13px", color: "#ef4444", animation: "fadeIn 0.3s ease",
      }}>
        <div style={{ fontWeight: 700, marginBottom: "8px", fontSize: "11px", letterSpacing: "1.5px" }}>SERVER WAKING UP</div>
        <div style={{ color: "#f0a0a0", marginBottom: "12px", lineHeight: 1.7 }}>
          The server sleeps after 15 minutes of inactivity. Wait 20–30 seconds and try again.
        </div>
      </div>
    );
  }

  if (error.type === "invalid_handle") {
    return (
      <div style={{
        background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.2)",
        borderRadius: "8px", padding: "20px 24px", fontFamily: "monospace",
        animation: "fadeIn 0.3s ease",
      }}>
        <div style={{ fontWeight: 700, marginBottom: "8px", fontSize: "11px", letterSpacing: "1.5px", color: "#ef4444" }}>
          INVALID HANDLE
        </div>
        <div style={{ color: "#f0a0a0", marginBottom: "16px", fontSize: "14px", lineHeight: 1.7 }}>
          {error.message}
        </div>
        <div style={{
          background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: "6px", padding: "12px 16px", color: "#666", lineHeight: 1.8, fontSize: "12px",
        }}>
          <div style={{ color: "#4ade80", marginBottom: "4px" }}>▶ how to find your handle</div>
          <div>Go to <span style={{ color: "#aaa" }}>codeforces.com</span> → your profile → the name shown in the top right.</div>
          <div>Handles are case-sensitive. <span style={{ color: "#aaa" }}>tourist</span> ≠ <span style={{ color: "#aaa" }}>Tourist</span></div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.2)",
      borderRadius: "8px", padding: "20px 24px", fontFamily: "monospace",
      fontSize: "13px", color: "#ef4444", animation: "fadeIn 0.3s ease",
    }}>
      <div style={{ fontWeight: 700, marginBottom: "8px", fontSize: "11px", letterSpacing: "1.5px" }}>ERROR</div>
      <div style={{ color: "#f0a0a0", lineHeight: 1.7 }}>{error.message || "Something went wrong. Please try again."}</div>
    </div>
  );
}

function StaircaseSection({ title, subtitle, problems, accentColor }) {
  if (!problems || problems.length === 0) return null;
  return (
    <div style={{ marginBottom: "24px" }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: "10px", marginBottom: "10px" }}>
        <span style={{ fontFamily: "monospace", fontSize: "13px", fontWeight: 700, color: accentColor }}>
          {title}
        </span>
        <span style={{ fontFamily: "monospace", fontSize: "11px", color: "#555" }}>{subtitle}</span>
      </div>
      {problems.map((problem, i) => (
        <ProblemCard key={problem.name} problem={problem} index={i} />
      ))}
    </div>
  );
}

export default function App() {
  const [handle, setHandle] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [inputFocused, setInputFocused] = useState(false);
  const [mode, setMode] = useState("standard");

  const analyze = async () => {
    if (!handle.trim()) return;
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 40000);

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/analyze/${handle.trim()}?mode=${mode}`,
        { signal: controller.signal }
      );
      clearTimeout(timeoutId);

      const data = await res.json();

      if (data.error === "invalid_handle") {
        setError({ type: "invalid_handle", message: data.message });
        return;
      }

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setResult(data);

    } catch (err) {
      if (err.name === "AbortError") {
        setError({ type: "timeout" });
      } else {
        setError({ type: "generic", message: err.message });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => { if (e.key === "Enter") analyze(); };

  const isNotEnoughData = result?.diagnosis?.includes("Not enough data");
  const isNoWrong = result?.diagnosis?.includes("No Wrong Submissions");
  const isStandardSuccess = result && result["Recommended Problem"] && !isNotEnoughData && !isNoWrong;
  const isStaircaseSuccess = result && result["Staircase"] && !isNotEnoughData && !isNoWrong;
  const weakTags = result?.["Weakest Tag"] ? result["Weakest Tag"].split(",") : [];

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

      <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
        <div style={{
          position: "absolute", left: 0, right: 0, height: "2px",
          background: "linear-gradient(transparent, rgba(74,222,128,0.03), transparent)",
          animation: "scanline 8s linear infinite",
        }} />
      </div>

      <div style={{
        position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
        backgroundImage: `linear-gradient(rgba(74,222,128,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(74,222,128,0.02) 1px, transparent 1px)`,
        backgroundSize: "40px 40px",
      }} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: "760px", margin: "0 auto", padding: "48px 24px 80px" }}>

        <div style={{ marginBottom: "40px" }}>
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
          </p>
        </div>

        <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
          {["standard", "staircase"].map(m => (
            <button
              key={m}
              onClick={() => setMode(m)}
              style={{
                background: mode === m ? "rgba(74,222,128,0.1)" : "transparent",
                border: `1px solid ${mode === m ? "rgba(74,222,128,0.4)" : "#2a2a2a"}`,
                color: mode === m ? "#4ade80" : "#666",
                fontFamily: "monospace", fontSize: "11px", fontWeight: 600,
                letterSpacing: "0.5px", padding: "6px 14px", borderRadius: "6px",
                cursor: "pointer", transition: "all 0.15s ease",
              }}
            >
              {m === "standard" ? "TOP 5" : "STAIRCASE"}
            </button>
          ))}
        </div>

        <div style={{ marginBottom: "40px" }}>
          <div style={{
            display: "flex", gap: "0",
            border: `1px solid ${inputFocused ? "#4ade80" : "#2a2a2a"}`,
            borderRadius: "8px", overflow: "hidden",
            transition: "border-color 0.2s ease",
            boxShadow: inputFocused ? "0 0 0 3px rgba(74,222,128,0.08)" : "none",
          }}>
            <div style={{ padding: "0 16px", background: "#111", display: "flex", alignItems: "center", borderRight: "1px solid #2a2a2a" }}>
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

        {loading && (
          <div style={{ background: "#0f0f0f", border: "1px solid #1e1e1e", borderRadius: "8px", padding: "24px" }}>
            <TerminalLine color="#4ade80">▶ fetching submission history...</TerminalLine>
            <TerminalLine color="#4ade80" delay={0.4}>▶ computing tag failure rates...</TerminalLine>
            <TerminalLine color="#4ade80" delay={0.8}>▶ running KNN on problem space...</TerminalLine>
            <TerminalLine color="#888" delay={1.2}><span style={{ animation: "pulse 1s infinite" }}>█</span></TerminalLine>
          </div>
        )}

        {error && <ErrorState error={error} />}

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

        {isStandardSuccess && (
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
                ✓ {result["Recommended Problem"].length} problems found
              </div>
            </div>

            <RatingDisplay rating={result["Target Rating"]} />
            <WeaknessBreakdown tags={weakTags} breakdown={result["Weakness Breakdown"]} />

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
              ✓ marks show which of your weak tags each problem covers.
            </div>
          </div>
        )}

        {isStaircaseSuccess && (
          <div style={{ animation: "fadeIn 0.3s ease" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
              <div>
                <div style={{ fontFamily: "monospace", fontSize: "11px", color: "#666", letterSpacing: "1.5px", marginBottom: "4px" }}>ANALYSIS COMPLETE</div>
                <div style={{ fontSize: "22px", fontWeight: 700, color: "#f0f0f0" }}>{result.handle}</div>
              </div>
            </div>

            <RatingDisplay rating={result["Target Rating"]} />
            <WeaknessBreakdown tags={weakTags} breakdown={result["Weakness Breakdown"]} />

            <StaircaseSection
              title="CONFIDENCE"
              subtitle="warm up · below target rating"
              problems={result.Staircase.confidence}
              accentColor="#4ade80"
            />
            <StaircaseSection
              title="TARGET"
              subtitle="the core challenge · at target rating"
              problems={result.Staircase.target}
              accentColor="#03A89E"
            />
            <StaircaseSection
              title="STRETCH"
              subtitle="growth edge · above target rating"
              problems={result.Staircase.stretch}
              accentColor="#FF8C00"
            />

            <div style={{
              marginTop: "8px", padding: "14px 18px",
              background: "rgba(74,222,128,0.03)", border: "1px solid rgba(74,222,128,0.08)",
              borderRadius: "6px", fontFamily: "monospace", fontSize: "12px", color: "#555", lineHeight: 1.7,
            }}>
              Solve confidence first to build momentum, then target, then attempt stretch if time allows.
            </div>
          </div>
        )}

        <div style={{
          marginTop: "80px", paddingTop: "24px", borderTop: "1px solid #1a1a1a",
          display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px",
        }}>
          <span style={{ fontFamily: "monospace", fontSize: "11px", color: "#333" }}>algo_coach v2.0 · KNN + Codeforces API</span>
          <span style={{ fontFamily: "monospace", fontSize: "11px", color: "#333" }}>data from codeforces.com</span>
        </div>
      </div>
    </div>
  );
}