import React from 'react';
import { UserDetail, PopupForm } from './types';

interface PopupTabProps {
  user: UserDetail;
  popupForm: PopupForm;
  setPopupForm: (form: PopupForm) => void;
  setHasChanges: (value: boolean) => void;
}

export const PopupTab: React.FC<PopupTabProps> = ({
  user,
  popupForm,
  setPopupForm,
  setHasChanges,
}) => {
  if (!user?.profile) return null;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Popup Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center p-4 bg-gray-50 rounded-lg">
            <input
              type="checkbox"
              id="popupEnabled"
              checked={popupForm.isEnabled}
              onChange={(e) => {
                setPopupForm({ ...popupForm, isEnabled: e.target.checked });
                setHasChanges(true);
              }}
              className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="popupEnabled" className="ml-3 text-sm font-medium text-gray-700">
              Enable popup message
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
            <textarea
              value={popupForm.message}
              onChange={(e) => {
                setPopupForm({ ...popupForm, message: e.target.value });
                setHasChanges(true);
              }}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Duration (ms)</label>
            <input
              type="number"
              value={popupForm.duration}
              onChange={(e) => {
                setPopupForm({ ...popupForm, duration: parseInt(e.target.value) });
                setHasChanges(true);
              }}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Background Color</label>
              <input
                type="color"
                value={popupForm.backgroundColor}
                onChange={(e) => {
                  setPopupForm({ ...popupForm, backgroundColor: e.target.value });
                  setHasChanges(true);
                }}
                className="w-full h-12 border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Text Color</label>
              <input
                type="color"
                value={popupForm.textColor}
                onChange={(e) => {
                  setPopupForm({ ...popupForm, textColor: e.target.value });
                  setHasChanges(true);
                }}
                className="w-full h-12 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
