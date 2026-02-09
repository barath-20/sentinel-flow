import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import AlertDetails from './pages/AlertDetails';

function App() {
    return (
        <Router>
            <Layout>
                <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/alert/:alertId" element={<AlertDetails />} />
                </Routes>
            </Layout>
        </Router>
    );
}

export default App;
