// eslint-disable-next-line import/no-extraneous-dependencies
import { API, graphqlOperation, Auth } from 'aws-amplify';
import { IUser } from '../hooks/AuthContext';
import { updateUser } from '../graphql/mutations';

const EMPTY_USER = { items: [], nextToken: '' };

export const updateProfile = async (data: IUser) => {
  try {
    const user = await API.graphql(
      graphqlOperation(updateUser, { input: data }),
    );

    if (user) {
      return user;
    }
    return EMPTY_USER;
  } catch (err) {
    return EMPTY_USER;
  }
};

export const changeUserPassword = async (data: {
  name: string;
  email: string;
  password: string;
  oldPassword: string;
  confirmPassword: string;
}) => {
  try {
    const userCognito = await Auth.currentAuthenticatedUser();
    const response = await Auth.changePassword(
      userCognito,
      data.oldPassword,
      data.confirmPassword,
    );
    if (response) {
      return response;
    }

    return EMPTY_USER;
  } catch (err) {
    return EMPTY_USER;
  }
};
