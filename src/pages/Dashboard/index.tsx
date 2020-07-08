import React, { useCallback, useEffect, useState } from 'react';
import { Form } from '@unform/web';
import { API, graphqlOperation } from 'aws-amplify';
import Observable from 'zen-observable';
import { FaSpinner } from 'react-icons/fa';
import {
  Container,
  LeftSide,
  RightSide,
  ChimeList,
  Avatar,
  Content,
} from './styles';
import Input from '../../components/Input/index';
import Button from '../../components/Button';
import { createPost } from '../../graphql/mutations';
import { onCreatePost } from '../../graphql/subscriptions';
import { listPostsSortedByTimestamp } from '../../graphql/queries';
import { ListPostsSortedByTimestampQuery } from '../../API';
import profilePhoto from '../../assets/img/profile.jpg';
import { useAuth } from '../../hooks/AuthContext';

interface IPost {
  content: string;
  createdAt: string;
  id: string;
  owner: string | null;
  timestamp: number;
  type: string;
  updatedAt: string;
}

const Dashboard: React.FC = () => {
  const [nextToken, setNextToken] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { user, setUserState } = useAuth();
  const [chimes, setChimes] = useState<IPost[]>([] as IPost[]);

  useEffect(() => {
    let unsubscribe;
    async function handleGetPosts(type: string, nextToken = null) {
      console.log('ABC');
      const res = (await API.graphql(
        graphqlOperation(listPostsSortedByTimestamp, {
          type: 'post',
          sortDirection: 'DESC',
          limit: 20, // default = 10
          nextToken,
        }),
      )) as { data: ListPostsSortedByTimestampQuery };
      // dispatch({ type, posts: res.data.listPostsSortedByTimestamp.items });
      if (res.data?.listPostsSortedByTimestamp?.nextToken)
        setNextToken(res.data?.listPostsSortedByTimestamp?.nextToken);

      if (res.data?.listPostsSortedByTimestamp?.items) {
        setChimes(res.data?.listPostsSortedByTimestamp?.items as IPost[]);
      }
      setIsLoading(false);
    }
    handleGetPosts('post');
    console.log('ABCDE');
    const subscription = API.graphql(graphqlOperation(onCreatePost));
    if (subscription instanceof Observable) {
      const sub = subscription.subscribe({
        next: (payload) => {
          try {
            console.log(payload);
            setChimes((prevState) => [
              payload.value.data.onCreatePost,
              ...prevState,
            ]);
          } catch (e) {
            console.log(e);
          }
        },
      });
      unsubscribe = () => {
        sub.unsubscribe();
      };
    }

    return unsubscribe;
  }, []);

  const handleSendPost = useCallback(async (data: { post: string }) => {
    const res = (await API.graphql(
      graphqlOperation(createPost, {
        input: {
          type: 'post',
          content: data.post,
          timestamp: Date.now(),
        },
      }),
    )) as {
      data: {
        createPost: IPost;
      };
    };

    setIsLoading(false);
  }, []);

  // const handleGetAdditionalPosts = () => {
  //   if (nextToken === null) return; // Reached the last page
  //   handleGetPosts('teste', nextToken);
  // };
  return (
    <Container>
      <LeftSide>
        <Form onSubmit={handleSendPost}>
          <Input name="post" placeholder="Post" />
          <Button type="submit">Chime</Button>
        </Form>
      </LeftSide>
      <RightSide isLoading>
        {isLoading ? (
          <FaSpinner color="#FFF" size={14} />
        ) : (
            <ChimeList>
              {chimes.map((chime) => (
                <li key={chime.id}>
                  <Avatar>
                    <img src={user.profileURL || profilePhoto} alt="Profile" />
                  </Avatar>
                  <Content>
                    <strong>{user.name || user.email}</strong>
                    <span>{chime.content}</span>
                    <span>{chime.timestamp}</span>
                  </Content>
                </li>
              ))}
            </ChimeList>
          )}
      </RightSide>
    </Container>
  );
};

export default Dashboard;
