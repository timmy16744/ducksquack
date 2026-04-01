import React from 'react';
import { ThemeProvider, useTheme } from './themes/ThemeContext';
import DevSettingsPanel from './themes/DevSettingsPanel';

function ThemeShell() {
  const { theme, devMode } = useTheme();
  const Shell = theme.Shell;

  return (
    <>
      <Shell />
      {devMode && <DevSettingsPanel />}
    </>
  );
}

function App() {
  return (
    <ThemeProvider>
      <ThemeShell />
    </ThemeProvider>
  );
}

export default App;
