import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import AppRouter from './router/route';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppRouter />
        <StatusBar style="light" />
      </AuthProvider>
    </ThemeProvider>
  );
}
