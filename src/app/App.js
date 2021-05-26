import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from 'react-router-dom';

import Navbar from '../features/layout/Navbar';
import Landing from '../features/layout/Landing';
import Register from '../features/user/Register';
import Login from '../features/user/Login';
import PrivateRoute from '../features/user/PrivateRoute';
import Dashboard from '../features/dashboard/Dashboard';
import FamilyTree from '../features/familyTree/FamilyTree';
import TodoList from '../features/todos/TodoList';

const router = (
    <Router>
      <Navbar />
      <Switch>
        <Route exact path="/login" component={Login} />
        <Route exact path="/register" component={Register} />
        <Route exact path="/" component={Landing} />
        <PrivateRoute
          exact
          path={[
            '/todo/:filter(active|completed)?',
            '/todo/:id(\\d+)/:action(edit)?',
          ]}
        >
          <TodoList />
        </PrivateRoute>
        <PrivateRoute exact path="/dashboard" component={Dashboard} />
        <PrivateRoute exact path="/family-tree" component={FamilyTree} />
        <Redirect to="/" />
      </Switch>
    </Router>
);

export default function App() {
  return router;
}
