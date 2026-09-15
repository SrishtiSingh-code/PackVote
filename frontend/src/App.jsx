import { Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing.jsx';
import CreateTrip from './pages/CreateTrip.jsx';
import JoinTrip from './pages/JoinTrip.jsx';
import TripRoomPage from './pages/TripRoomPage.jsx';
import PreferencesPage from './pages/PreferencesPage.jsx';
import ResultPage from './pages/ResultPage.jsx';
import HelpChat from './components/HelpChat.jsx';

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/create" element={<CreateTrip />} />
        <Route path="/join" element={<JoinTrip />} />
        <Route path="/trip/:code" element={<TripRoomPage />} />
        <Route path="/trip/:code/preferences" element={<PreferencesPage />} />
        <Route path="/trip/:code/result" element={<ResultPage />} />
      </Routes>
      <HelpChat />
    </>
  );
}
