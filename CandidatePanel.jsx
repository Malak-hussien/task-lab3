
import { useEffect, useState } from "react";
import { gatherCandidates } from "../lib/gatherCandidates";

// ==================================================
// 1. STUN SERVER CONFIGURATIONS
// ==================================================



const CONFIGS = {
  none: [],
  stun: [
    { urls: "stun:stun.l.google.com:19302" },
  ],
  wrong: [
    { urls: "stun:stun.invalid.example:3478" },
  ],
};

const COLORS = {
  host: "#d5f0ec",
  srflx: "#fdecc8",
  relay: "#fbd9cf",
};


export default function CandidatePanel() {

  // State 1:
  const [configName, setConfigName] = useState("stun");
  // State 2:

  const [candidates, setCandidates] = useState([]);
  const [elapsed, setElapsed] = useState(null);
  // State 3
  const [gatherState, setGatherState] = useState("new");
  const iceServers = CONFIGS[configName];

useEffect(() => {
  let active = true;

  
  setCandidates([]);
  setElapsed(null);
  setGatherState("new");
  const start = performance.now();

  const stop = gatherCandidates({
    iceServers,

    onCandidate: (candidate) => {
      if (!active) return;

      setCandidates((prev) => [
        ...prev,
        candidate,
      ]);
    },


    onStateChange: (state) => {
      if (!active) return;
      setGatherState(state);
    },

    onDone: () => {
      if (!active) return;

      const end = performance.now();

      setElapsed(Math.round(end - start));
    },
  });

  
  return () => {
    active = false;
    stop();
  };

}, [iceServers]);


  const sorted = [...candidates].sort(
    (a, b) => b.priority - a.priority
  );

  return (

    <div style={{ padding: "24px" }}>

      <h1>ICE Candidate Panel</h1>



      <select
        value={configName}
        onChange={(e) => setConfigName(e.target.value)}
      >

        {Object.keys(CONFIGS).map((name) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}

      </select>
      <p>
        Gathering State: <strong>{gatherState}</strong>
      </p>
      <p>
        Gathering Time:{" "}
        {elapsed !== null ? `${elapsed} ms` : "Gathering..."}
      </p> 
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginTop: "20px",
        }}
      >
        <thead>
          <tr>
            <th>Type</th>
            <th>Protocol</th>
            <th>Address : Port</th>
            <th>Priority</th>
            <th>Foundation</th>
          </tr>
        </thead>

        <tbody>
          {sorted.map((c) => (
            <tr
              key={c.candidate}

              style={{
                background: COLORS[c.type] ?? "white",
              }}
            >
              <td>{c.type}</td>

              <td>{c.protocol}</td>

              <td>
                {c.address}:{c.port}
              </td>

              <td>{c.priority}</td>

              <td>{c.foundation}</td>

            </tr>

          ))}

          {sorted.length === 0 && (

            <tr>
              <td colSpan={5}>
                Waiting for candidates...
              </td>
            </tr>

          )}

        </tbody>
      </table>
    </div>
  );
}
