import Dashboard from './components/Dashboard';
import { usePreventDevTools } from './hooks/usePreventDevTools';

function App() {
  usePreventDevTools(); // 보안 기능 활성화 (우클릭 및 개발자 도구 차단)
  return <Dashboard />;
}

export default App;


