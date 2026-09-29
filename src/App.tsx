import { lazy } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { GenesisSection } from '@/lib/genesis';

const HomePage = lazy(() => import('@/pages/HomePage'));

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <GenesisSection name="Home">
              <HomePage />
            </GenesisSection>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
