import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Onboarding from './pages/Onboarding';
import Login from './pages/Login';
import Home from './pages/Home';
import CreateEvent from './pages/CreateEvent';
import QRInvite from './pages/QRInvite';
import Friends from './pages/Friends';
import ScanReceipt from './pages/ScanReceipt';
import ClaimItems from './pages/ClaimItems';
import ConfirmPay from './pages/ConfirmPay';
import SuccessReceipt from './pages/SuccessReceipt';
import History from './pages/History';
import Profile from './pages/Profile';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Onboarding />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/create" element={<CreateEvent />} />
        <Route path="/invite/:eventId" element={<QRInvite />} />
        <Route path="/friends" element={<Friends />} />
        <Route path="/scan/:eventId" element={<ScanReceipt />} />
        <Route path="/claim/:eventId" element={<ClaimItems />} />
        <Route path="/confirm/:eventId" element={<ConfirmPay />} />
        <Route path="/receipt/:eventId" element={<SuccessReceipt />} />
        <Route path="/history" element={<History />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </BrowserRouter>
  );
}
