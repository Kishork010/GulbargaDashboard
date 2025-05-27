import React, { useEffect, useState } from 'react';
import './gulbarga.css';

function ShivachandraEV() {
  const [data, setData] = useState([]);
  const [sourceData, setSourceData] = useState({});
  const [statusCounts, setStatusCounts] = useState({ Live: 0, Lost: 0 });
  const [lobData, setLobData] = useState({ counts: {}, colors: {} });
  const [modelLiveData, setModelLiveData] = useState({});
  const [tlData, setTlData] = useState([]);


  const includedEVModels = ['Nexon EV', 'Nexon EV 2.0', 'Tiago EV', 'Tigor EV'];
  const modelOrder = ['Tiago EV', 'Tigor EV', 'Nexon EV', 'Nexon EV 2.0'];

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch('https://gulbargadashboard.onrender.com');
      const json = await res.json();

      const tlData = json.filter(row => row['tl_name']?.trim() === 'ESR_500B640');
      setTlData(tlData); // <-- Add this line

      const allTotal = tlData.length;
      const allHot = tlData.filter(r => r['lead_classification']?.trim().toLowerCase() === 'hot').length;
      const allWarm = tlData.filter(r => r['lead_classification']?.trim().toLowerCase() === 'warm').length;
      const allCold = tlData.filter(r => r['lead_classification']?.trim().toLowerCase() === 'cold').length;

      const showroomWalkin = tlData.filter(r =>
        ["Showroom Walk-in", "Showroom Walkin"].includes(r['source_of_contact']?.trim())
      );
      const showroomTotal = showroomWalkin.length;
      const showroomHot = showroomWalkin.filter(r => r['lead_classification']?.trim().toLowerCase() === 'hot').length;

      setData([
        { label: 'Total Leads (All)', count: allTotal },
        { label: 'Hot (All)', count: allHot },
        { label: 'Warm (All)', count: allWarm },
        { label: 'Cold (All)', count: allCold },
        { label: 'Total (Walk-in)', count: showroomTotal },
        { label: 'Hot (Walk-in)', count: showroomHot },
      ]);

      const sourceGroups = {
        "Showroom Walkin": ["Showroom Walk-in", "Showroom Walkin"],
        "Telein": ["Cold Calling", "Call to Dealer"],
        "Event": ["Events"],
        "External": ["External Leads-Web", "External Leads-Dealer Website"],
        "Reference": ["Referral", "Workshop", "Anubhav", "DMA/DSA/Financier"],
        "Digital": ["Digital Lead-Dealer", "Web-Booking", "Digital-WhatsApp"],
      };

      const initialCounts = {
        "Showroom Walkin": 0,
        "Telein": 0,
        "Event": 0,
        "External": 0,
        "Reference": 0,
        "Digital": 0,
      };

      const sourceCounts = { ...initialCounts };

      tlData.forEach(row => {
        const rawSource = row['source_of_contact']?.trim();
        for (const [key, values] of Object.entries(sourceGroups)) {
          if (values.includes(rawSource)) {
            sourceCounts[key] += 1;
            break;
          }
        }
      });

      const colorShades = {
        "Showroom Walkin": "#1976d2",
        "Telein": "#ff9800",
        "Event": "#9c27b0",
        "External": "#009688",
        "Reference": "#4caf50",
        "Digital": "#e91e63",
      };

      setSourceData({ counts: sourceCounts, colors: colorShades });

      const liveStages = ["02 Open Green Form", "02a Pink Form"];
      const lostStage = "07 Closed Lost";
      const counts = { Live: 0, Lost: 0 };

      tlData.forEach(row => {
        const stage = row['sales_stage']?.trim();
        if (stage === lostStage) {
          counts.Lost += 1;
        } else if (liveStages.includes(stage)) {
          counts.Live += 1;
        }
      });

      setStatusCounts(counts);

      const liveData = tlData.filter(row => liveStages.includes(row['sales_stage']?.trim()));

      const lobCounts = { Cars: 0, UVs: 0, EVBU: 0 };
      liveData.forEach(row => {
        const lob = row['lob']?.trim();
        if (lob && lobCounts.hasOwnProperty(lob)) {
          lobCounts[lob]++;
        }
      });

      const baseColors = {
        Cars: "#2196f3",
        UVs: "#4caf50",
        EVBU: "#ff9800",
      };

      const lobFillColors = {};
      Object.entries(lobCounts).forEach(([lob, count]) => {
        lobFillColors[lob] = count === 0 ? "#ccc" : (baseColors[lob] || "#000");
      });

      setLobData({ counts: lobCounts, colors: lobFillColors });

      const modelCounts = {};
      liveData.forEach(row => {
        const model = row['parent_product_line']?.trim();
        if (model && includedEVModels.includes(model)) {
          modelCounts[model] = (modelCounts[model] || 0) + 1;
        }
      });

      setModelLiveData(modelCounts);

    } catch (err) {
      console.error('Error fetching TL data:', err);
    }
  };

  const total = statusCounts.Live + statusCounts.Lost;
  const livePercent = total ? (statusCounts.Live / total) * 100 : 0;
  const lostPercent = total ? (statusCounts.Lost / total) * 100 : 0;


const currentMonthData = tlData
  .filter(row => {
    const dateStr = row['stage_1_date'];
    if (!dateStr) return false;

    const parts = dateStr.split('/');
    if (parts.length !== 3) return false;

    const [day, month, year] = parts;
    if (!day || !month || !year) return false;

    const date = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
    if (isNaN(date)) return false;

    const today = new Date();
    return date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
  })
  .sort((a, b) => {
    // Parse dates for sorting
    const parseDate = (row) => {
      const [d, m, y] = row['stage_1_date'].split('/');
      return new Date(`${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`);
    };
    return parseDate(b) - parseDate(a); // Descending order
  });


  return (
    <div className="gulbarga-container">
      <h2>EV SHIVACHANDRA RATNAPURKAR(ESR_500B640)</h2>

      <div className="box-row">
        {data.map((item, index) => (
          <div key={index} className="summary-box">
            <div className="count">{item.count}</div>
            <div className="label">{item.label}</div>
          </div>
        ))}
      </div>

      {sourceData && (
        <div className="source-row">
          {Object.entries(sourceData?.counts ?? {}).map(([key, count]) => {
            const max = Math.max(...Object.values(sourceData.counts));
            const percent = max ? (count / max) * 100 : 0;
            const fillColor = sourceData.colors[key] || "#ccc";
            const bgStyle = {
              background: `conic-gradient(${fillColor} ${percent}%, #ccc ${percent}% 100%)`
            };

            return (
              <div key={key} className="doughnut-chart" style={bgStyle}>
                <div className="chart-content">
                  <div className="chart-count">{count}</div>
                  <div className="chart-label">{key}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="status-capsules">
        <div className="capsule-progress-container">
          <div className="capsule-bar">
            <div
              className="capsule-fill"
              style={{ width: `${livePercent}%`, backgroundColor: "#4caf50" }}
            />
          </div>
          <div className="capsule-label">Live</div>
          <div className="capsule-label">{statusCounts.Live}</div>
        </div>

        <div className="capsule-progress-container">
          <div className="capsule-bar">
            <div
              className="capsule-fill"
              style={{ width: `${lostPercent}%`, backgroundColor: "#f44336" }}
            />
          </div>
          <div className="capsule-label">Lost</div>
          <div className="capsule-label">{statusCounts.Lost}</div>
        </div>
      </div>

      {lobData?.counts && (
        <div className="status-capsules">
          {Object.entries(lobData.counts).map(([lob, count]) => {
            const total = Object.values(lobData.counts).reduce((a, b) => a + b, 0);
            const percent = total ? (count / total) * 100 : 0;
            const bgColor = lobData.colors?.[lob] || "#ccc";

            return (
              <div key={lob} className="capsule-progress-container">
                <div className="capsule-bar">
                  <div
                    className="capsule-fill"
                    style={{ width: `${percent}%`, backgroundColor: bgColor }}
                  />
                </div>
                <div className="capsule-label">{lob}</div>
                <div className="capsule-label">{count}</div>
              </div>
            );
          })}
        </div>
      )}

      
      <div className="model-live-section" style={{ display: 'flex', flexDirection: 'column', gap: '30px', marginTop: '40px' }}>
        <div className="model-live-section" style={{ marginTop: '40px' }}>
          <h3 style={{ marginBottom: '20px' }}>Live Leads by Model</h3>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '40px', justifyContent: 'space-between' }}>
            {/* === BAR GRAPH === */}
            <div style={{ flex: 1, minWidth: '300px' }}>
              {Object.keys(modelLiveData).length === 0 && <p>No live leads found.</p>}

              {(() => {
                const maxCount = Math.max(...Object.values(modelLiveData));
                return modelOrder
                  .filter(model => modelLiveData[model])
                  .map(model => {
                    const count = modelLiveData[model];
                    const widthPercent = maxCount ? (count / maxCount) * 100 : 0;

                    return (
                      <div key={model} style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ minWidth: '100px', fontWeight: '500' }}>{model}</div>
                        <div style={{ flex: 1, background: '#e0e0e0', height: '24px', borderRadius: '6px', overflow: 'hidden' }}>
                          <div
                            style={{
                              width: `${widthPercent}%`,
                              height: '100%',
                              backgroundColor: '#1976d2',
                              transition: 'width 0.4s',
                            }}
                          />
                        </div>
                        <div style={{ minWidth: '30px', textAlign: 'right', fontWeight: '500' }}>{count}</div>
                      </div>
                    );
                  });
              })()}
            </div>

            {/* === MODEL % BOXES === */}
            <div
              className="model-counts-boxes"
              style={{
                display: 'grid',
                gap: '16px',
                gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                flex: 1,
                minWidth: '250px',
                maxWidth: '400px',
              }}
            >
              {(() => {
                const totalModelLeads = Object.values(modelLiveData).reduce((a, b) => a + b, 0);
                return modelOrder
                  .filter(model => modelLiveData[model])
                  .map(model => {
                    const count = modelLiveData[model];
                    const percent = totalModelLeads ? ((count / totalModelLeads) * 100).toFixed(1) : 0;

                    return (
                      <div
                        key={model}
                        style={{
                          background: '#f5f5f5',
                          padding: '12px 18px',
                          borderRadius: '10px',
                          textAlign: 'center',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                        }}
                      >
                        <div style={{ fontWeight: 'bold', marginBottom: '6px', fontSize: '16px' }}>{model}</div>
                        <div style={{ fontSize: '14px', color: '#444' }}>{percent}%</div>
                      </div>
                    );
                  });
              })()}
            </div>
          </div>
        </div>
      </div>

  
    {/* === TABLE VIEW: Current Month's Leads === */}
<div style={{ marginTop: '60px' }}>
  <h3 style={{ marginBottom: '20px' }}>Current Month Leads (Detailed View)</h3>
  <div style={{ overflowX: 'auto' }}>
     <table className="min-w-full bg-white rounded shadow mt-4">
    <thead>
      <tr>
        <th className="py-2 px-4 border-b">Date</th>
        <th className="py-2 px-4 border-b">Customer Name</th>
        <th className="py-2 px-4 border-b">Mobile</th>
        <th className="py-2 px-4 border-b">Model</th>
        <th className="py-2 px-4 border-b">Booking Status</th>
        <th className="py-2 px-4 border-b">Source</th>
      </tr>
    </thead>
    <tbody> 
      {currentMonthData.map((row, index) => (
        <tr key={index}>
          <td className="py-2 px-4 border-b">{row['Stage 1 Date']}</td>
          <td className="py-2 px-4 border-b">{row['First Name']}</td>
          <td className="py-2 px-4 border-b">{row['Mobile #']}</td>
          <td className="py-2 px-4 border-b">{row['Parent Product Line']}</td>
          <td className="py-2 px-4 border-b">{row['Sales Stage']}</td>
          <td className="py-2 px-4 border-b">{row['Source of Contact']}</td>
        </tr>
      ))}
    </tbody>
  </table>
  </div>
</div>

    </div>
  );
}

export default ShivachandraEV;
