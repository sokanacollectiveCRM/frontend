import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  text-align: center;
  background-color: #f9fafb;
  padding: 2rem;
`;

const Heading = styled.h1`
  font-size: 4rem;
  font-weight: bold;
  color: #111827;
  margin-bottom: 1rem;
`;

const Description = styled.p`
  font-size: 1.25rem;
  color: #6b7280;
  margin-bottom: 2rem;
`;

const HomeButton = styled.button`
  background-color: #3b82f6;
  color: white;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #2563eb;
  }
`;

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <Container>
      <Heading>404 - Page Not Found</Heading>
      <Description>
        Oops! The page you’re looking for doesn’t exist or has been moved.
      </Description>
      <HomeButton onClick={() => navigate('/')}>Go Home</HomeButton>
    </Container>
  );
}