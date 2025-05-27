import React, { useEffect, useState } from 'react';
import './Dashboard.css';

function Dashboard() {
  const [data, setData] = useState([]);
  const [tooltip, setTooltip] = useState({ visible: false, content: '', x: 0, y: 0 });

  const columns = [
    { label: "ID", key: "sales_team" },
    { label: "First Name", key: "first_name" },
    { label: "Last Name", key: "last_name" },
    { label: "Mobile Number", key: "mobile_number" },
    { label: "City", key: "city" },
    { label: "Opportunity ID", key: "opportunity_name" },
    { label: "Customer Type", key: "customer_type" },
    { label: "PPL", key: "parent_product_line" },
    { label: "Product Line", key: "product_line" },
    { label: "Colour", key: "colour" },
    { label: "Test Drive", key: "td_required" },
    { label: "Status", key: "status" },
    { label: "Source Contact", key: "source_of_contact" },
    { label: "Team Leader", key: "tl_name" }
  ];

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch('https://gulbargadashboard.onrender.com');
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  const showTooltip = (event, content) => {
    event.stopPropagation();
    setTooltip({
      visible: true,
      content,
      x: event.clientX,
      y: event.clientY - 20,
    });
  };

  const hideTooltip = () => {
    setTooltip({ visible: false, content: '', x: 0, y: 0 });
  };

  // Hide tooltip on mouse move
  useEffect(() => {
    const handleMouseMove = () => {
      if (tooltip.visible) hideTooltip();
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [tooltip.visible]);

  return (
    <div className="dashboard">
      <h1>Dump Data</h1>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              {columns.map(({ label }, i) => (
                <th key={i}>{label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i}>
                {columns.map(({ key }, j) => (
                  <td
                    key={j}
                    onClick={(e) => showTooltip(e, row[key])}
                  >
                    {row[key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {tooltip.visible && (
        <div
          className="tooltip"
          style={{
            position: 'fixed',
            top: `${tooltip.y}px`,
            left: `${tooltip.x}px`,
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            color: '#fff',
            padding: '6px 10px',
            borderRadius: '4px',
            zIndex: 1000,
            whiteSpace: 'pre-wrap',
            maxWidth: '300px',
          }}
        >
          {tooltip.content}
        </div>
      )}
    </div>
  );
}

export default Dashboard;
