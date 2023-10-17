import { Redirect, Route } from 'react-router-dom';
import { useAuthContext } from '../contexts/authContext';

export function PrivateRoute({ render, exact, path }) {
  const { authorizing, user } = useAuthContext();

  if (!authorizing && !user) return <Redirect to="/register" replace />;

  return <Route path={path} exact={exact} render={render} />;
}
