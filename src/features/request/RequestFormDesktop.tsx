import { Form } from '@/common/components/ui/form';
import { useState } from 'react';
import { toast } from 'sonner';
import styles from './RequestForm.module.scss';
import { Step1Personal } from './Step1Personal';
import { Step2Home } from './Step2Health';
import {
  Step10ClientDemographics,
  Step3FamilyMembers,
  Step4Referral,
  Step5HealthHistory,
  Step6PregnancyBaby,
  Step7PastPregnancies,
  Step8ServicesInterested,
  Step9Payment,
} from './Step3Home';
import { useRequestForm } from './useRequestForm';

export default function RequestFormDesktop() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const onSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/requestService/requestSubmission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const responseData = await response.json();
      if (!response.ok || responseData.error) {
        throw new Error(responseData.error || 'Server returned an error.');
      }
      toast.success('Request Form Submitted Successfully!');
      setSubmitted(true);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };
  const { form, step, totalSteps, handleNextStep, handleBack } = useRequestForm(onSubmit);
  const progress = ((step + 1) / totalSteps) * 100;

  if (isSubmitting) {
    return <div className={styles.requestForm}>Submitting...</div>;
  }
  if (submitted) {
    return <div className={styles.requestForm}>Thank you for your submission!</div>;
  }

  return (
    <div className={styles.requestForm}>
      <div style={{ width: '100%', height: 8, background: '#e0e0e0', borderRadius: 4, margin: '24px 0 32px 0', overflow: 'hidden' }}>
        <div style={{ width: `${progress}%`, height: '100%', background: '#00bcd4', transition: 'width 0.3s cubic-bezier(.4,0,.2,1)' }} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2.5rem' }}>
        <img src='/logo.jpeg' alt='Sokana Collective Logo' style={{ width: 180, height: 'auto', margin: '0 auto 1.5rem auto', display: 'block' }} />
        <h1 style={{ fontWeight: 700, fontSize: '2.2rem', margin: 0, textAlign: 'center' }}>Request for Service Form</h1>
        <div style={{ color: '#666', fontSize: '1.15rem', margin: '1.2rem 0 0 0', textAlign: 'center', maxWidth: 700 }}>
          Please complete this form as thoroughly as possible so we can match you with a doula according to your needs.
        </div>
      </div>
      <Form {...form}>
        {step === 0 && (
          <Step1Personal
            form={form}
            handleBack={handleBack}
            handleNextStep={handleNextStep}
            step={step}
            totalSteps={totalSteps}
            desktop
          />
        )}
        {step === 1 && (
          <Step2Home
            form={form}
            handleBack={handleBack}
            handleNextStep={handleNextStep}
            step={step}
            totalSteps={totalSteps}
            desktop
          />
        )}
        {step === 2 && (
          <Step3FamilyMembers
            form={form}
            handleBack={handleBack}
            handleNextStep={handleNextStep}
            step={step}
            totalSteps={totalSteps}
            desktop
          />
        )}
        {step === 3 && (
          <Step4Referral
            form={form}
            handleBack={handleBack}
            handleNextStep={handleNextStep}
            step={step}
            totalSteps={totalSteps}
            desktop
          />
        )}
        {step === 4 && (
          <Step5HealthHistory
            form={form}
            handleBack={handleBack}
            handleNextStep={handleNextStep}
            step={step}
            totalSteps={totalSteps}
            desktop
          />
        )}
        {step === 5 && (
          <Step6PregnancyBaby
            form={form}
            handleBack={handleBack}
            handleNextStep={handleNextStep}
            step={step}
            totalSteps={totalSteps}
            desktop
          />
        )}
        {step === 6 && (
          <Step7PastPregnancies
            form={form}
            handleBack={handleBack}
            handleNextStep={handleNextStep}
            step={step}
            totalSteps={totalSteps}
            desktop
          />
        )}
        {step === 7 && (
          <Step8ServicesInterested
            form={form}
            handleBack={handleBack}
            handleNextStep={handleNextStep}
            step={step}
            totalSteps={totalSteps}
            desktop
          />
        )}
        {step === 8 && (
          <Step9Payment
            form={form}
            handleBack={handleBack}
            handleNextStep={handleNextStep}
            step={step}
            totalSteps={totalSteps}
            desktop
          />
        )}
        {step === 9 && (
          <Step10ClientDemographics
            form={form}
            handleBack={handleBack}
            handleNextStep={handleNextStep}
            step={step}
            totalSteps={totalSteps}
            desktop
          />
        )}
      </Form>
    </div>
  );
} 