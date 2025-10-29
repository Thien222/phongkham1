import { Routes, Route } from 'react-router-dom';
import { DashboardPage } from './screens/DashboardPage';
import { ReceptionPage } from './screens/ReceptionPage';
import { RefractionPage } from './screens/RefractionPage';
import { ExaminationPage } from './screens/ExaminationPage';
import { InvoicesPage } from './screens/InvoicesPage';
import { InventoryPage } from './screens/InventoryPage';
import { ReportsPage } from './screens/ReportsPage';
import { IncidentsPage } from './screens/IncidentsPage';
import { SettingsPage } from './screens/SettingsPage';
import { ProtectedRoute } from './components/ProtectedRoute';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/reception" element={<ReceptionPage />} />
      <Route path="/refraction" element={<RefractionPage />} />
      <Route path="/examination" element={<ExaminationPage />} />
      <Route path="/invoices" element={<InvoicesPage />} />
      <Route path="/inventory" element={<ProtectedRoute requireAdmin><InventoryPage /></ProtectedRoute>} />
      <Route path="/reports" element={<ProtectedRoute requireAdmin><ReportsPage /></ProtectedRoute>} />
      <Route path="/incidents" element={<IncidentsPage />} />
      <Route path="/settings" element={<ProtectedRoute requireAdmin><SettingsPage /></ProtectedRoute>} />
    </Routes>
  );
}


