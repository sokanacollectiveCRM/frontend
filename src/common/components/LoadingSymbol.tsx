import styled, { keyframes } from 'styled-components';

const rotateSimple = keyframes`
  100% {transform: rotate(1turn)}
`;

const SimpleLoader = styled.div`
  width: 50px;
  aspect-ratio: 1;
  color: #000;
  border: 2px solid;
  display: grid;
  box-sizing: border-box;
  animation: ${rotateSimple} 4s infinite linear;

  &::before,
  &::after {
    content: "";
    grid-area: 1/1;
    margin: auto;
    width: 70.7%;
    aspect-ratio: 1;
    border: 2px solid;
    box-sizing: content-box;
    animation: inherit;
  }

  &::after {
    width: 50%;
    aspect-ratio: 1;
    border: 2px solid;
    animation-duration: 2s;
  }
`;

export const LoadingSymbol = () => {
  return <SimpleLoader />;
};

export default LoadingSymbol;