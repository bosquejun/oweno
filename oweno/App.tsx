
import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import RootLayout from './app/layout';
import Dashboard from './app/page';
import GroupsList from './app/groups/page';
import GroupDetail from './app/groups/[id]/page';
import FriendsList from './app/friends/page';
import ExpenseHistory from './app/groups/[id]/history/page';
import LandingPage from './pages/LandingPage';
import { useUIStore } from './store/useUIStore';

const App: React.FC = () => {
  const { isAuthenticated } = useUIStore();

  return (
    <Router>
      <Routes>
        {isAuthenticated ? (
          /* Protected Routes */
          <Route path="/*" element={
            <RootLayout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/groups" element={<GroupsList />} />
                <Route path="/groups/:id" element={<GroupDetail />} />
                <Route path="/groups/:id/history" element={<ExpenseHistory />} />
                <Route path="/friends" element={<FriendsList />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </RootLayout>
          } />
        ) : (
          /* Public Routes */
          <>
            <Route path="/" element={<LandingPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        )}
      </Routes>
    </Router>
  );
};

export default App;
