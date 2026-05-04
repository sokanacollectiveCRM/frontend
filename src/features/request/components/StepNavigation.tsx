import React from 'react';
import { STEP_CONFIG } from '../stepConfig';
import { useRequestFormContext } from '../contexts/RequestFormContext';
import styles from './StepNavigation.module.scss';

interface StepNavigationProps {
  currentStep: number;
  isDesktop?: boolean;
}

export const StepNavigation: React.FC<StepNavigationProps> = ({ 
  currentStep, 
  isDesktop = false 
}) => {
  const { jumpToStep, isStepValid } = useRequestFormContext();

  const getStepStatus = (stepIndex: number): 'completed' | 'current' | 'upcoming' | 'invalid' => {
    if (stepIndex < currentStep) {
      return isStepValid(stepIndex) ? 'completed' : 'invalid';
    } else if (stepIndex === currentStep) {
      return 'current';
    } else {
      return 'upcoming';
    }
  };

  /** Back: always allowed. Forward: only if all prior steps currently validate (full check on click). */
  const canNavigateToStep = (stepIndex: number): boolean => {
    if (stepIndex === currentStep) {
      return true;
    }
    if (stepIndex < currentStep) {
      return true;
    }
    for (let i = 0; i < stepIndex; i++) {
      if (!isStepValid(i)) {
        return false;
      }
    }
    return true;
  };

  const handleStepClick = (targetStep: number) => {
    void jumpToStep(targetStep);
  };

  if (isDesktop) {
    return (
      <nav className={styles.desktopNavigation} aria-label="Form step navigation">
        <div
          className={styles.stepsContainer}
          style={{
            gridTemplateColumns: `repeat(${STEP_CONFIG.length}, minmax(0, 1fr))`,
          }}
        >
          {STEP_CONFIG.map((step) => {
            const status = getStepStatus(step.id);
            const canNavigate = canNavigateToStep(step.id);

            return (
              <div key={step.id} className={styles.stepItem}>
                <button
                  type="button"
                  onClick={() => handleStepClick(step.id)}
                  disabled={!canNavigate}
                  className={`${styles.stepButton} ${styles[`step-${status}`]}`}
                  aria-current={status === 'current' ? 'step' : undefined}
                  aria-label={`${step.title}, step ${step.id + 1} of ${STEP_CONFIG.length}${status === 'current' ? ' (current)' : ''}${status === 'completed' ? ' (completed)' : ''}${!canNavigate && status === 'upcoming' ? ' (locked)' : ''}`}
                  title={
                    canNavigate
                      ? `Go to ${step.title}`
                      : `${step.title}${!canNavigate ? ' (locked)' : ''}`
                  }
                >
                  <span className={styles.stepNumber}>{step.id + 1}</span>
                  <span className={styles.stepTitle}>{step.title}</span>
                </button>
              </div>
            );
          })}
        </div>
      </nav>
    );
  }

  // Mobile/Tablet Navigation - Horizontal scrollable
  return (
    <nav className={styles.mobileNavigation} aria-label="Form step navigation">
      <div className={styles.mobileStepsContainer}>
        {STEP_CONFIG.map((step) => {
          const status = getStepStatus(step.id);
          const canNavigate = canNavigateToStep(step.id);
          
          return (
            <button
              key={step.id}
              type="button"
              onClick={() => handleStepClick(step.id)}
              disabled={!canNavigate}
              className={`${styles.mobileStepButton} ${styles[`step-${status}`]}`}
              aria-current={status === 'current' ? 'step' : undefined}
              aria-label={`${step.title}, step ${step.id + 1} of ${STEP_CONFIG.length}${status === 'current' ? ' (current)' : ''}${status === 'completed' ? ' (completed)' : ''}${!canNavigate && status === 'upcoming' ? ' (locked)' : ''}`}
              title={`${step.title}${!canNavigate ? ' (locked)' : ''}`}
            >
              <span className={styles.mobileStepNumber}>{step.id + 1}</span>
              <span className={styles.mobileStepTitle}>{step.shortTitle}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};