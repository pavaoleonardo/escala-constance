import React from 'react';
import { ScheduleAlert } from '../lib/types';

interface AlertsPanelProps {
  alerts: ScheduleAlert[];
  minimized: boolean;
  onToggleMinimize: () => void;
  showWarnings: boolean;
}

export const AlertsPanel: React.FC<AlertsPanelProps> = ({
  alerts,
  minimized,
  onToggleMinimize,
  showWarnings,
}) => {
  // Hide panel completely if warnings are not active or there are no alerts
  if (!showWarnings || alerts.length === 0) {
    return null;
  }

  return (
    <div
      className={`alerts-console card ${alerts.length > 0 ? 'has-alerts' : 'no-alerts-state'} ${
        minimized ? 'minimized' : ''
      }`}
      id="alerts-console"
    >
      <div className="console-header">
        <div className="title-with-badge">
          <span className="warning-icon">🚨</span>
          <h2>Avisos de Inconsistências e CLT</h2>
          <span className="badge badge-danger" id="alerts-count">
            {alerts.length}
          </span>
        </div>
        <button
          className="btn-text-action"
          id="btn-toggle-alerts"
          onClick={onToggleMinimize}
          type="button"
        >
          {minimized ? 'Expandir' : 'Minimizar'}
        </button>
      </div>
      <div className="alerts-list-container" id="alerts-list">
        {alerts.map((alert, index) => (
          <div
            key={index}
            className={`alert-item alert-item-${alert.type}`}
            dangerouslySetInnerHTML={{ __html: alert.message }}
          />
        ))}
      </div>
    </div>
  );
};
