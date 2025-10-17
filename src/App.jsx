import { ThemeProvider } from './contexts/ThemeContext';
import AppRouter from './router/AppRouter';

function App() {
  return (
    <ThemeProvider>
      <AppRouter />
    </ThemeProvider>
  );
}

export default App;
