// Export all contexts and hooks
import { AuthProvider, useAuth } from './AuthContext';
import { DeviceProvider, useDevices } from './DeviceContext';
import { ThemeProvider, useTheme } from './ThemeContext';

// Combined provider for easy setup
export const AppProviders = ({ children }) => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <DeviceProvider>
          {children}
        </DeviceProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};