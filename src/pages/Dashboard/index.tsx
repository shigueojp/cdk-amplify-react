import React, { useCallback, useEffect, useState } from 'react';
import { Form } from '@unform/web';
import { API, graphqlOperation } from 'aws-amplify';
import Observable from 'zen-observable';
import { FaSpinner } from 'react-icons/fa';
import { formatDistanceToNow, fromUnixTime } from 'date-fns';
import {
  Container,
  LeftSide,
  RightSide,
  ChimeList,
  Avatar,
  Content,
  HeaderContent,
  Teste,
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
  timeFormatted: string;
}

const Dashboard: React.FC = () => {
  const [nextToken, setNextToken] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const [chimes, setChimes] = useState<IPost[]>([] as IPost[]);

  const calcTimestampDiff = (timestamp: any) => {
    const result2 = fromUnixTime(timestamp / 1000);
    const result = formatDistanceToNow(result2, {
      includeSeconds: true,
    });

    return result;
  };

  useEffect(() => {
    let unsubscribe;
    async function handleGetPosts(type: string, nextToken = null) {
      const res = (await API.graphql(
        graphqlOperation(listPostsSortedByTimestamp, {
          type: 'post',
          sortDirection: 'DESC',
          limit: 20, // default = 10
          nextToken,
        }),
      )) as { data: ListPostsSortedByTimestampQuery };
      if (res.data?.listPostsSortedByTimestamp?.nextToken)
        setNextToken(res.data?.listPostsSortedByTimestamp?.nextToken);

      if (res.data?.listPostsSortedByTimestamp?.items) {
        const chimesFormatted = res.data.listPostsSortedByTimestamp.items.map(
          (item) => {
            return {
              ...item,
              timeFormatted: calcTimestampDiff(item?.timestamp as number),
            };
          },
        );
        setChimes(chimesFormatted as IPost[]);
      }
      setIsLoading(false);
    }
    handleGetPosts('post');
    const subscription = API.graphql(graphqlOperation(onCreatePost));
    if (subscription instanceof Observable) {
      const sub = subscription.subscribe({
        next: (payload) => {
          try {
            const chime = {
              ...payload.value.data.onCreatePost,
              timeFormatted: calcTimestampDiff(
                payload.value.data.onCreatePost.timestamp as number,
              ),
            };
            setChimes((prevState) => [chime, ...prevState]);
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
  }, []);

  // const handleGetAdditionalPosts = () => {
  //   if (nextToken === null) return; // Reached the last page
  //   handleGetPosts('teste', nextToken);
  // };
  return (
    <Container>
      <LeftSide>
        <Form onSubmit={handleSendPost}>
          <Input name="post" placeholder="Enter your post" />
          <Button type="submit">Tweet</Button>
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
                  <Teste>
                    <HeaderContent>
                      <strong>{user.name || user.email}</strong>
                      <span>{`${chime.timeFormatted} ago`}</span>
                    </HeaderContent>
                    <Content>
                      <span>{chime.content}</span>
                    </Content>
                  </Teste>
                </li>
              ))}
            </ChimeList>
          )}
      </RightSide>
    </Container>
  );
};

export default Dashboard;
