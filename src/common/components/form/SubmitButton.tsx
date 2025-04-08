
import PropTypes from 'prop-types';

// import { StyledButton } from './styles';
import { Button } from '@/common/components/ui/button';

SubmitButton.propTypes = {
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func.isRequired,
};

export default function SubmitButton({ children, onClick }) {
  return (
    <Button type='submit' onClick={onClick}>
      {children}
    </Button>
  );
}

