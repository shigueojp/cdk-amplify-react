import { Switch, Route } from 'react-router-dom';
import React from 'react';
import {
  AmplifyAuthenticator,
  AmplifyForgotPassword,
  AmplifySignUp,
  AmplifySignIn,
} from '@aws-amplify/ui-react';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import SignUp from './pages/SignUp/index';
import AuthComponent from './components/HoC/Authentication';

const Routes: React.FC = () => {
  return (
    <AuthComponent>
      <Switch>
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/profile" component={Profile} />
        <Route path="/register" component={SignUp} />
        <Route exact component={Dashboard} />
      </Switch>
    </AuthComponent>
  );
};

export default Routes;
