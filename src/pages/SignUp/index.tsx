import React, { useState, useEffect } from 'react';
import { Auth } from 'aws-amplify';
import { Link } from 'react-router-dom';
import { Form } from '@unform/web';
import { Container } from './styles';
import Input from '../../components/Input/index';
import Button from '../../components/Button/index';

const SignUpPage: React.FC = () => {
  const [user, setUser] = useState();
  async function SignUp(data: {
    email: string;
    password: string;
    confirmPassword: string;
  }) {
    if (data.confirmPassword !== data.password) {
      console.log('Password not equal');
      return;
    }
    try {
      const userCognito = await Auth.signUp(data.email, data.password);
      setUser(userCognito);
    } catch (error) {
      console.log('error confirming sign up', error);
    }
  }

  console.log(user);
  return !user ? (
    <Container>
      <Form onSubmit={SignUp}>
        <Input name="email" type="email" placeholder="Email" />
        <Input name="password" type="password" placeholder="Password" />
        <Input
          name="confirmPassword"
          type="password"
          placeholder="Confirm Password"
        />
        <Button type="submit">Sign Up</Button>
        <Link to="/">Back</Link>
      </Form>
    </Container>
  ) : (
      <Container>
        <Form onSubmit={SignUp}>
          <Input readOnly name="email" type="email" placeholder="Email" />
          <Input name="code" placeholder="Enter your code" />
          <Button type="submit">Confirm</Button>
          <Link to="/">Back</Link>
        </Form>
      </Container>
    );
};

export default SignUpPage;
