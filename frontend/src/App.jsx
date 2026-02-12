import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import AlertDetails from './pages/AlertDetails';
import Alerts from './pages/Alerts';
import Investigation from './pages/Investigation';
import Settings from './pages/Settings';
import GraphAnalytics from './pages/GraphAnalytics';

function App() {
    return (
        <Router>
            <Layout>
                <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/alerts" element={<Alerts />} />
                    <Route path="/investigation" element={<Investigation />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/network" element={<GraphAnalytics />} />
                    <Route path="/alert/:alertId" element={<AlertDetails />} />
                </Routes>
            </Layout>
        </Router>
    );
}

export default App;
