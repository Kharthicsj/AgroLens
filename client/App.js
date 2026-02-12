import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import AppRouter from './router/route';
import './locales/i18n'; // Initialize i18n

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <AppRouter />
          <StatusBar style="light" />
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
