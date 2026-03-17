import { Routes, Route, Navigate } from 'react-router-dom';
import { Show } from "@clerk/react";
import Onboarding from './pages/Onboarding';
import Login from './pages/Login';
import Home from './pages/Home';
import Friends from './pages/Friends';
import CreateEvent from './pages/CreateEvent';
import QRInvite from './pages/QRInvite';
import ScanReceipt from './pages/ScanReceipt';
import ClaimItems from './pages/ClaimItems';
import SuccessReceipt from './pages/SuccessReceipt';
import ConfirmPay from './pages/ConfirmPay';
import Profile from './pages/Profile';
import History from './pages/History';

export default function App() {
  return (
    <>
      <Show when="signed-out">
        <Routes>
          <Route path="/" element={<Onboarding />} />
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Show>

      <Show when="signed-in">
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<Home />} />
          <Route path="/friends" element={<Friends />} />
          <Route path="/create" element={<CreateEvent />} />
          <Route path="/invite/:id" element={<QRInvite />} />
          <Route path="/scan/:id" element={<ScanReceipt />} />
          <Route path="/claim/:id" element={<ClaimItems />} />
          <Route path="/confirm/:id" element={<ConfirmPay />} />
          <Route path="/receipt/:id" element={<SuccessReceipt />} />
          <Route path="/history" element={<History />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </Show>
    </>
  );
}
