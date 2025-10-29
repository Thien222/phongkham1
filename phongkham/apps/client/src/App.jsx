import { Layout, theme } from 'antd';
import { AppSider } from './components/AppSider';
import { AppHeaderBar } from './components/AppHeaderBar';
import { AppRoutes } from './routes';

const { Content } = Layout;

export default function App() {
  const { token } = theme.useToken();
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <AppSider />
      <Layout>
        <AppHeaderBar />
        <Content style={{ margin: 16 }}>
          <div style={{ padding: 16, background: token.colorBgContainer, borderRadius: 8 }}>
            <AppRoutes />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}


