import { Navigate, useParams } from 'react-router-dom';
import { readLastTab } from '@/lib/tabMemory';

// Renders at /projects/:id — reads murch:project:<id>:lastTab from
// localStorage and redirects to that tab route. Defaults to 'overview'.
export function ProjectRootRedirect() {
  const { id } = useParams<{ id: string }>();
  if (!id) return <Navigate to="/projects" replace />;
  const lastTab = readLastTab(id);
  return <Navigate to={`/projects/${id}/${lastTab}`} replace />;
}
