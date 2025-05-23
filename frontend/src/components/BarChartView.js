import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import './BarChart.css';

function Dashboard() {
  const [modelData, setModelData] = useState([]);
  const [teamLeaderData, setTeamLeaderData] = useState([]);
  const [pieData, setPieData] = useState([]);
  const [lineChartData, setLineChartData] = useState([]);
  const [sourceData, setSourceData] = useState([]);
  const [testDriveData, setTestDriveData] = useState([]);
  const [customerTypeData, setCustomerTypeData] = useState([]);
  const [walkinData, setWalkinData] = useState([]);
  const [salesStageData, setSalesStageData] = useState([]);

  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/green_form');
      const json = await res.json();

      const parseDate = (str) => {
        if (!str) return null;
        const cleaned = str.replace(/-/g, '/');
        const parts = cleaned.split('/');
        if (parts.length !== 3) return null;
        const [day, month, year] = parts;
        return new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
      };

      const filteredData = json.filter(row => {
        const rowDate = parseDate(row['stage_1_date']);
        const from = fromDate ? new Date(fromDate) : null;
        const to = toDate ? new Date(toDate) : null;

        if (!rowDate) return false;
        if (from && rowDate < from) return false;
        if (to && rowDate > to) return false;
        return true;
      });

      const excludedModels = ['Nexon EV', 'Nexon EV 2.0', 'Tiago EV', 'Tigor EV'];

      const modelCounts = {};
      const teamLeaderCounts = {};
      const teamLeaderModelMap = {};
      const lineChartCounts = {};
      const sourceCounts = {};
      const testDriveCounts = { Given: 0, Declined: 0, "Not Given": 0, "": 0 };
      const customerTypeMap = {};
      const walkinCounts = {};
      const salesStageCounts = { Lost: 0, Live: 0 };

      filteredData.forEach(row => {
  const rowDate = parseDate(row['stage_1_date']);
  const model = row['parent_product_line']?.trim();
  const teamLeader = row['tl_name'] || 'Unassigned';

  // Exclude EV models and Sai Kiran's data
  const excludedModels = ['Nexon EV', 'Nexon EV 2.0', 'Tiago EV', 'Tigor EV'];
  if (excludedModels.includes(model) || teamLeader === 'Sai Kiran') return;

  const rawSource = row['source_of_contact']?.trim();
  const testDriveVal = row['td_required']?.trim();
  const customerType = row['lead_classification']?.trim();
  const stage = row['sales_stage']?.trim();
  const month = rowDate ? rowDate.getMonth() : 0;

  modelCounts[model] = (modelCounts[model] || 0) + 1;
  teamLeaderCounts[teamLeader] = (teamLeaderCounts[teamLeader] || 0) + 1;

  if (!teamLeaderModelMap[teamLeader]) teamLeaderModelMap[teamLeader] = {};
  teamLeaderModelMap[teamLeader][model] = (teamLeaderModelMap[teamLeader][model] || 0) + 1;

    let sourceKey = null;
    if (["Showroom Walk-in", "Showroom Walkin"].includes(rawSource)) {sourceKey = "Showroom Walkin";} 
    else if (["Cold Calling", "Call to Dealer"].includes(rawSource)) {sourceKey = "Telein";} 
    else if (rawSource === "Events") {sourceKey = "Event";} 
    else if (["External Leads-Web", "External Leads-Dealer Website"].includes(rawSource)) {sourceKey = "External";} 
    else if (["Referral", "Workshop", "Anubhav","DMA/DSA/Financier"].includes(rawSource)) {sourceKey = "Reference";} 
    else if (["Digital Lead-Dealer", "Web-Booking", "Digital-WhatsApp"].includes(rawSource)) {sourceKey = "Digital";}

    // Only count if sourceKey is valid
    if (sourceKey) {
      sourceCounts[sourceKey] = (sourceCounts[sourceKey] || 0) + 1;
    }
    
  if (testDriveVal?.toLowerCase() === "declined") {
    testDriveCounts["Declined"] += 1;
  } else if (testDriveVal?.toLowerCase() === "given") {
    testDriveCounts["Given"] += 1;
  } else if (!testDriveVal || testDriveVal.trim() === "") {
    testDriveCounts[""] += 1;
  } else {
    testDriveCounts["Not Given"] += 1;
  }

  if (customerType) {
    if (!customerTypeMap[teamLeader]) customerTypeMap[teamLeader] = {};
    customerTypeMap[teamLeader][customerType] = (customerTypeMap[teamLeader][customerType] || 0) + 1;
  }

  if (["Showroom Walk-in", "Showroom Walkin"].includes(rawSource)) {
    walkinCounts[teamLeader] = (walkinCounts[teamLeader] || 0) + 1;
  }

  if (stage === "07 Closed Lost") salesStageCounts["Lost"] += 1;
  else if (["02 Open Green Form", "02a Pink Form"].includes(stage)) salesStageCounts["Live"] += 1;
});

      const modelOrder = ['Tiago', 'Tigor', 'Altroz', 'Punch', 'Nexon','Harrier','Curvv','Safari 2.0'];

      const modelFormatted = Object.entries(modelCounts)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => {
          const indexA = modelOrder.indexOf(a.name);
          const indexB = modelOrder.indexOf(b.name);
          return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
        });

      const teamLeaderFormatted = Object.entries(teamLeaderCounts).map(([name, value]) => ({ name, value }));
      const pieFormatted = Object.entries(teamLeaderModelMap).map(([leader, models]) => ({
        teamLeader: leader,
        data: Object.entries(models).map(([model, value]) => ({ name: model, value }))
      }));
      const lineFormatted = Object.entries(lineChartCounts).map(([month, count]) => ({
        name: `Month ${parseInt(month) + 1}`,
        count
      }));
      const sourceFormatted = Object.entries(sourceCounts).map(([name, value]) => ({ name, value }));
      const testDriveFormatted = Object.entries(testDriveCounts).map(([name, value]) => ({ name, value }));
      const customerTypeFormatted = Object.entries(customerTypeMap).map(([teamLeader, types]) => ({
        teamLeader,
        data: Object.entries(types).map(([name, value]) => ({ name, value }))
      }));
      const walkinFormatted = Object.entries(walkinCounts).map(([name, value]) => ({ name, value }));
      const salesStageFormatted = Object.entries(salesStageCounts).map(([name, value]) => ({ name, value }));

      setModelData(modelFormatted);
      setTeamLeaderData(teamLeaderFormatted);
      setPieData(pieFormatted);
      setLineChartData(lineFormatted);
      setSourceData(sourceFormatted);
      setTestDriveData(testDriveFormatted);
      setCustomerTypeData(customerTypeFormatted);
      setWalkinData(walkinFormatted);
      setSalesStageData(salesStageFormatted);

    } catch (err) {
      console.error('Error fetching:', err);
    }
  };

const liveCount = salesStageData.find(item => item.name === 'Live')?.value || 0;
const lostCount = salesStageData.find(item => item.name === 'Lost')?.value || 0;


const total = liveCount + lostCount;
const livePercent = total ? (liveCount / total) * 100 : 0;
const lostPercent = total ? (lostCount / total) * 100 : 0;

const teamLeaderMap = {
  "ESR_500B640": "SHIVACHANDRA RATNAPURKAR",
  "PVM_300B640": "VIJAYKUMAR MALIPATIL",
  "PMA1_300B640": "MD NAYYER ANSARI",
  "PSS1_300B640": "SURAJ SARDA",
  "PPT_300B640": "PRAVIN TALVAR"
};



  return (
    <div>
      <div className="date-filter-container">
        <div className="date-filter">
          <label>
            From:
            <input className="date-filter" type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
          </label>
          <label>
            To:
            <input className="date-filter" type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
          </label>
          <button onClick={fetchData}>Apply Filter</button>
          {(fromDate || toDate) && (
            <div className="date-filter-display">
              Showing data from <span>{fromDate ? new Date(fromDate).toLocaleDateString('en-GB') : 'Start'}</span> to <span>{toDate ? new Date(toDate).toLocaleDateString('en-GB') : 'End'}</span>
            </div>
          )}
        </div>
      </div>

      <div className="chart-grid">
        <div className="chart-item">
          <h2>Model-wise Count</h2>
          <ResponsiveContainer width="100%" height={modelData.length * 40 || 300}>
            <BarChart data={modelData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" allowDecimals={false} />
              <YAxis dataKey="name" type="category" width={75} />
              <Tooltip />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-item">
          <h2>Source-wise Count</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={sourceData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {sourceData.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28FE7', '#FF66C4'][index % 6]} 
                  />

                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-item">
          <h2>Test Drive Status</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={testDriveData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-item-full">
          <h2>Customer Type by Team Leader</h2>
          <div className="grid-box-row">
            {customerTypeData.map((entry, idx) => (
              <div key={idx} className="grid-box-card">
                <h4>{teamLeaderMap[entry.teamLeader] || entry.teamLeader}</h4>
                {entry.data.map(type => (
                  <p key={type.name}><strong>{type.name}:</strong> {type.value}</p>
                ))}
              </div>
            ))}
          </div>
        </div>


<div className="chart-item-full">
  <h2>Showroom Walk-in by Team Leader</h2>
  <div className="grid-box-row">
    {walkinData.map((entry, idx) => (
      <div key={idx} className="grid-box-card">
        <h4>{teamLeaderMap[entry.name] || entry.name}</h4>
        <p><strong>Count:</strong> {entry.value}</p>
      </div>
    ))}
  </div>
</div>

       <div className="meter-container">
        <h3>Live</h3>
        <div className="meter-bar">
          <div className="meter-live" style={{ width: `${livePercent}%` }}></div>
          <div className="meter-empty" style={{ width: `${100 - livePercent}%` }}></div>
        </div>
        <p>{liveCount} out of {total}</p>
      </div>

      <div className="meter-container">
        <h3>Lost</h3>
        <div className="meter-bar">
          <div className="meter-lost" style={{ width: `${lostPercent}%` }}></div>
          <div className="meter-empty" style={{ width: `${100 - lostPercent}%` }}></div>
        </div>
        <p>{lostCount} out of {total}</p>
      </div>

      </div>
    </div>
  );
}

export default Dashboard;
