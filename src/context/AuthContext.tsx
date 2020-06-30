import React, { createContext, useCallback, useState } from 'react';
import { Auth, API, graphqlOperation, Storage } from 'aws-amplify';
import { GetUserQuery } from '../API';
import { getUser } from '../graphql/queries';
import { createUser } from '../graphql/mutations';

interface IUserContext {
  user: IUser;
  signIn(): Promise<void>;
  setUserState: React.Dispatch<React.SetStateAction<IUser>>;
}

export interface IUser {
  id: string;
  name?: string;
  email: string;
  profilePhoto?: { bucket: string; region: string; key: string };
  profileURL?: string;
}

export const AuthContext = createContext<IUserContext>({} as IUserContext);

export const AuthProvider: React.FC = ({ children }) => {
  const [userState, setUserState] = useState<IUser>(() => {
    console.log('B');
    const user = localStorage.getItem('@AuthUser');

    if (user) {
      return JSON.parse(user);
    }

    return {} as IUser;
  });

  const signIn = useCallback(async () => {
    const { attributes } = await Auth.currentUserInfo();

    // Retorna o usuário cadastrado no DynamoDB
    const res = (await API.graphql(
      graphqlOperation(getUser, {
        id: attributes.sub,
      }),
    )) as {
      data: GetUserQuery;
    };

    let userProfile: IUser = {
      id: attributes.sub,
      email: attributes.email,
    };

    console.log(userProfile);
    // Se User existe no Dynamo
    if (res.data.getUser) {
      userProfile = {
        ...userProfile,
        name: res.data.getUser.name,
        profilePhoto: res.data.getUser.profilePhoto,
      } as IUser;

      // Tiver foto de perfil
      if (res.data.getUser.profilePhoto) {
        const profileURL = await Storage.get(res.data.getUser.profilePhoto.key);

        userProfile = {
          ...userProfile,
          profileURL: profileURL.toString(),
        };
      }
    } else {
      // Criar usuario no DynamoDB
      try {
        console.log('AOPSKDPOASDKP');
        const abc = await API.graphql(
          graphqlOperation(createUser, {
            input: userProfile,
          }),
        );
      } catch (e) {
        console.error(e);
      }
    }

    localStorage.setItem('@AuthUser', JSON.stringify(userProfile));
    setUserState(userProfile);
    console.log(userProfile);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user: userState,
        signIn,
        setUserState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
