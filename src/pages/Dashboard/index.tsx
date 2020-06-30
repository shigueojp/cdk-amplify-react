import React from 'react';
import { withAuthenticator } from '@aws-amplify/ui-react';
import { Auth } from 'aws-amplify';

const Dashboard: React.FC = () => {
  return <h1>Dashboard</h1>;
};

export default withAuthenticator(Dashboard);
