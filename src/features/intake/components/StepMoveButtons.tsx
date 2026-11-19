import { Button } from '@/common/components/ui/button';
import styles from '../RequestForm.module.scss';

type StepMoveButtonsProps = {
  step: number;
  totalSteps: number;
  onBack: () => void;
  onNext: () => void;
  isSubmitting?: boolean;
  placement?: 'top' | 'bottom';
};

export function StepMoveButtons({
  step,
  totalSteps,
  onBack,
  onNext,
  isSubmitting = false,
  placement = 'bottom',
}: StepMoveButtonsProps) {
  const rowClass =
    placement === 'top'
      ? `${styles['step-buttons-row']} ${styles['step-buttons-row-top']}`
      : styles['step-buttons-row'];

  return (
    <div className={rowClass}>
      <Button type='button' onClick={onBack} disabled={step === 0 || isSubmitting}>
        Back
      </Button>
      <Button type='button' onClick={onNext} disabled={isSubmitting}>
        {step === totalSteps - 1 ? 'Submit' : 'Next'}
      </Button>
    </div>
  );
}
