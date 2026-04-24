import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';

import { ProjectsIndexRoute } from '@/routes/projects/index';
import { NewProjectRoute } from '@/routes/projects/new';
import { ProjectRootRedirect } from '@/routes/projects/[id]/index';
import { DashboardLayout } from '@/routes/projects/[id]/layout';
import { OverviewRoute } from '@/routes/projects/[id]/overview';
import { SectionRoute } from '@/routes/projects/[id]/section/[sectionId]';
import { AuxiliaryRoute } from '@/routes/projects/[id]/auxiliary';
import { SettingsRoute } from '@/routes/projects/[id]/settings';
import { QuoteRoute } from '@/routes/projects/[id]/quote';
import { ChangesRoute } from '@/routes/projects/[id]/changes';
import { ApprovalRoute } from '@/routes/projects/[id]/approval';
import { SuppliersRoute } from '@/routes/projects/[id]/suppliers';
import { CatalogRoute } from '@/routes/catalog/index';
import { NotFoundRoute } from '@/routes/notFound';
import { ToastHost } from '@/components/layout/ToastHost';
import { GlobalSearch } from '@/components/GlobalSearch';
import { FirstRunSplash, useFirstRunSplash } from '@/components/layout/FirstRunSplash';

import { useStore } from '@/store';
import { useUndoKeybindings } from '@/hooks/useUndoKeybindings';
import { useCmdK } from '@/hooks/useCmdK';
import { useEffect } from 'react';

// Importing @/store triggers seedIfNeeded at module-load, so by the time
// components mount the store is already populated.

export default function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}

function AppShell() {
  useUndoKeybindings();
  const { open: searchOpen, setOpen: setSearchOpen } = useCmdK();
  const splashVisible = useFirstRunSplash();
  const pushToast = useStore((s) => s.pushToast);

  // Greet the user with a "seed data loaded" toast the first time after
  // the splash auto-dismisses.
  useEffect(() => {
    if (splashVisible) return;
    const FLAG = 'murch-vision:welcome-toast-shown';
    try {
      if (localStorage.getItem(FLAG) === '1') return;
      localStorage.setItem(FLAG, '1');
    } catch {
      return;
    }
    window.setTimeout(() => {
      pushToast({
        kind: 'info',
        text: 'Демо өгөгдөл ачаалагдлаа — эхний төслөөр туршиж үзнэ үү',
      });
    }, 400);
  }, [splashVisible, pushToast]);

  return (
    <>
      <FirstRunSplash visible={splashVisible} />
      <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
      <Routes>
        <Route path="/" element={<Navigate to="/projects" replace />} />
        <Route path="/projects" element={<ProjectsIndexRoute />} />
        <Route path="/projects/new" element={<NewProjectRoute />} />

        {/* Exact /projects/:id → redirect to last tab (no chrome) */}
        <Route path="/projects/:id" element={<ProjectRootRedirect />} />

        {/* /projects/:id/quote is a standalone page (no dashboard chrome) */}
        <Route path="/projects/:id/quote" element={<QuoteRoute />} />

        {/* /projects/:id/changes is standalone (its own header, no tab chrome) */}
        <Route path="/projects/:id/changes" element={<ChangesRoute />} />

        {/* /projects/:id/approval is standalone (engineer workflow) */}
        <Route path="/projects/:id/approval" element={<ApprovalRoute />} />

        {/* /projects/:id/suppliers — project-scoped price comparison */}
        <Route path="/projects/:id/suppliers" element={<SuppliersRoute />} />

        {/* /catalog — global supplier catalog */}
        <Route path="/catalog" element={<CatalogRoute />} />

        {/* /projects/:id/<tab> → dashboard chrome + tab outlet */}
        <Route element={<DashboardLayout />}>
          <Route path="/projects/:id/overview" element={<OverviewRoute />} />
          <Route path="/projects/:id/auxiliary" element={<AuxiliaryRoute />} />
          <Route path="/projects/:id/settings" element={<SettingsRoute />} />
          <Route path="/projects/:id/section/:sectionId" element={<SectionRoute />} />
        </Route>

        <Route path="*" element={<NotFoundRoute />} />
      </Routes>
      <ToastHost />
    </>
  );
}
