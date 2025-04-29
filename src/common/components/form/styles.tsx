import styled from 'styled-components';

import { Button } from '@/common/components/ui/button';

export const InputContainer = styled.div``;

export const InputName = styled.h3`
  margin: 0;
  text-align: left;
  font-weight: normal;
  font-size: 1rem;
  margin-bottom: 4px;
`;
export const InputTitle = styled.span`
  margin-right: 2px;
`;
export const RedSpan = styled.span`
  color: red;
`;

export const StyledInput = styled.input`
  font-size: 1rem;
  padding: 8px;
  border: solid 2px var(--text);
  border-radius: 8px;
  width: 375px;
`;

export const PasswordContainer = styled.div`
  position: relative;
  width: fit-content;
`;

export const IconContainer = styled.div`
  position: absolute;
  right: 10px;
  top: 8px;
  background-color: var(--white);
  cursor: pointer;
`;

export const StyledButton = styled(Button)`
  font-size: 1.1rem;
  width: 200px;
  font-align: center;
  margin-top: 20px;
  margin-left: auto;
  margin-right: auto;
`;
