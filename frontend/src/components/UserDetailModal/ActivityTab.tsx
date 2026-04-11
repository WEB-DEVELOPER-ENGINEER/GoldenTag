import React from 'react';
import { AdminActionLog } from './types';

interface ActivityTabProps {
  logs: AdminActionLog[];
}

export const ActivityTab: React.FC<ActivityTabProps> = ({ logs }) => {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Admin Activity Log</h3>
        {logs.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No admin actions recorded</p>
          </div>
        ) : (
          <div className="space-y-2">
            {logs.map((log, index) => (
              <div key={index} className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {log.action.replace(/_/g, ' ')}
                  </p>
                  <p className="text-xs text-gray-500">
                    Admin ID: {log.adminId}
                  </p>
                </div>
                <p className="text-xs text-gray-500">
                  {new Date(log.timestamp).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
