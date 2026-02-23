import { useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import BenefitOptions from './entries/benefit-options';
import CardDashboard from './entries/card-dashboard';
import CreditCardFlow from './entries/credit-card-flow';
import IdentificationFlowEntry from './entries/identification-flow';
import RangeEarings from './entries/range-earings';
import { mockCards } from './mock/cards';

const APP_ROUTES = [
  { path: '/card-dashboard', label: 'Card dashboard', element: <CardDashboard /> },
  { path: '/benefit-options', label: 'Benefit options', element: <BenefitOptions /> },
  { path: '/range-earings', label: 'Range earings', element: <RangeEarings /> },
  { path: '/identification-flow', label: 'Identification flow', element: <IdentificationFlowEntry /> },
  { path: '/credit-card-flow', label: 'Credit card flow', element: <CreditCardFlow /> },
] as const;

function App() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const existingOpenAi = window.openai ?? {};
    const hasToolOutput = Boolean(existingOpenAi.toolOutput);

    window.openai = {
      ...existingOpenAi,
      toolOutput: hasToolOutput
        ? existingOpenAi.toolOutput
        : {
            cardList: mockCards,
          },
    };

    window.dispatchEvent(new Event('openai:set_globals'));
  }, []);

  return (
    <div className="min-h-screen px-4 py-6 sm:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <Routes>
          <Route path="/" element={<Navigate to="/card-dashboard" replace />} />
          {APP_ROUTES.map(route => (
            <Route key={route.path} path={route.path} element={route.element} />
          ))}
          <Route path="*" element={<Navigate to="/card-dashboard" replace />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
