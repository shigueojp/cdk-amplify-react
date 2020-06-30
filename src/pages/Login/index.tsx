import React, { useState, useEffect } from 'react';
import {
  AmplifyAuthenticator,
  AmplifySignOut,
  withAuthenticator,
} from '@aws-amplify/ui-react';
import { AuthState, onAuthUIStateChange } from '@aws-amplify/ui-components';
import { Auth } from 'aws-amplify';
import { Link } from 'react-router-dom';
import { Form } from '@unform/web';
import { Container } from './styles';
import Input from '../../components/Input/index';
import Button from '../../components/Button/index';

const Login: React.FC = () => {
  async function SignIn(data: { email: string; password: string }) {
    try {
      const user = await Auth.signIn(data.email, data.password);
      console.log(user);
    } catch (error) {
      console.log('error confirming sign up', error);
    }
  }
  return (
    <Container>
      <Form onSubmit={SignIn}>
        <Input name="email" type="email" placeholder="Email" />
        <Input name="password" type="password" placeholder="Password" />
        <Button type="submit">Login</Button>
        <Link to="/register">Sign Up</Link>
      </Form>
    </Container>
  );
};

export default Login;
