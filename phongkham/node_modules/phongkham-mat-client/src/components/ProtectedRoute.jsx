import { useAuth } from '../contexts/AuthContext';
import { Spin } from 'antd';

export function ProtectedRoute({ children, requireAdmin = false }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  // Nếu cần admin nhưng không phải admin (hoặc chưa login) -> 403
  if (requireAdmin && (!user || user.role !== 'admin')) {
    return (
      <div style={{ padding: '50px', textAlign: 'center' }}>
        <h1>🔒 Cần đăng nhập Admin</h1>
        <p>Trang này chỉ dành cho Admin. Vui lòng đăng nhập bằng tài khoản Admin để truy cập.</p>
      </div>
    );
  }

  // Cho phép truy cập (không cần login nếu không requireAdmin)
  return children;
}

