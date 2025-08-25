// src/components/StatCard.jsx
import { IconContext } from 'react-icons';

// Props: icon, title, value, e color
export default function StatCard({ icon, title, value, color = '#0d6efd' }) {
  // O IconContext.Provider nos permite estilizar o ícone facilmente
  return (
    <div className="stat-card" style={{ '--card-color': color }}>
      <div className="stat-card-icon">
        <IconContext.Provider value={{ color: 'white', size: '24px' }}>
          {icon}
        </IconContext.Provider>
      </div>
      <div className="stat-card-info">
        <span className="stat-card-value">{value}</span>
        <span className="stat-card-title">{title}</span>
      </div>
    </div>
  );
}