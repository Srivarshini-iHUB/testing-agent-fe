import { ThemeProvider } from './contexts/ThemeContext';
import AppRouter from './components/AppRouter';

function App() {
  return (
    <ThemeProvider>
      <AppRouter />
    </ThemeProvider>
  );
}

export default App;
