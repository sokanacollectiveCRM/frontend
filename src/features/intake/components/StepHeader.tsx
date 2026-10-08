import React from 'react';
import { getStepTitle } from '../stepConfig';
import styles from './StepHeader.module.scss';

interface StepHeaderProps {
  currentStep: number;
  totalSteps: number;
  showProgressText?: boolean;
}

export const StepHeader: React.FC<StepHeaderProps> = ({ 
  currentStep, 
  totalSteps, 
  showProgressText = true 
}) => {
  const stepTitle = getStepTitle(currentStep);
  
  return (
    <div className={styles.stepHeader}>
      <div className={styles.stepTitleContainer}>
        <h2 className={styles.stepTitle}>{stepTitle}</h2>
        {showProgressText && (
          <span className={styles.stepProgress}>
            Step {currentStep + 1} of {totalSteps}
          </span>
        )}
      </div>
    </div>
  );
};