import React from 'react';

const Settings = ({ appConfig, setAppConfig }) => {
  const toggleAuth = () => {
    setAppConfig({
      ...appConfig,
      requireAuth: !appConfig.requireAuth,
    });
  };

  return (
    <div className="settings-panel">
      <div className="settings-option">
        <label className="toggle-switch">
          <input
            type="checkbox"
            checked={appConfig.requireAuth}
            onChange={toggleAuth}
          />
          <span className="toggle-slider"></span>
        </label>
        <span>Require Authentication</span>
      </div>

      <div className="settings-info">
        {appConfig.requireAuth
          ? 'Users must log in to access the app.'
          : 'Authentication is disabled. Anyone can access the app.'}
      </div>
    </div>
  );
};

export default Settings;
