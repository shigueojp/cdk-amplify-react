import styled from 'styled-components';

export const Container = styled.div`
  input {
    width: 100%;
    border: 0;
    background-color: rgba(0, 0, 0, 0.1);
    color: #fff;
    border-radius: 5px;
    padding: 10px;
    margin-bottom: 10px;

    &::placeholder {
      color: rgba(255, 255, 255, 0.7);
    }
  }
`;
