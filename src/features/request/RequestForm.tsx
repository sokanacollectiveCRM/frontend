import { Form } from '@/common/components/ui/form';
import { useState } from 'react';
import { toast } from 'sonner';
import styles from './RequestForm.module.scss';
import { Step1Personal } from './Step1Personal';
import { Step2Home } from './Step2Health';
import { Step10ClientDemographics, Step3FamilyMembers, Step4Referral, Step5HealthHistory, Step6PregnancyBaby, Step7PastPregnancies, Step8ServicesInterested, Step9Payment } from './Step3Home';
import { RequestFormValues, useRequestForm } from './useRequestForm';

export default function RequestForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const onSubmit = async (formData: RequestFormValues) => {
    // Map number_of_babies string to integer
    const babyCountMap: Record<string, number> = {
      'Singleton': 1,
      'Twins': 2,
      'Triplets': 3,
      'Quadruplets': 4,
      // Add more as needed
    };
    const payload = {
      ...formData,
      number_of_babies: typeof formData.number_of_babies === 'string'
        ? babyCountMap[formData.number_of_babies] || 1
        : formData.number_of_babies,
    };
    setIsSubmitting(true);
    try {
      const response = await fetch(`${process.env.VITE_APP_BACKEND_URL}/requestService/requestSubmission`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();

      if (!response.ok || responseData.error) {
        throw new Error(responseData.error || "Server returned an error.");
      }
      toast.success('Request Form Submitted Successfully!');
      setSubmitted(true);
    } catch (error) {
      console.error('Request submission error:', error);
      toast.error(error instanceof Error ? error.message : "Submission failed");
    } finally {
      setIsSubmitting(false);
    }
  };
  const { form, step, setStep, totalSteps, handleNextStep, handleBack } = useRequestForm(onSubmit);
  const { control } = form;

  // Progress bar calculation
  const progress = ((step + 1) / totalSteps) * 100;

  if (isSubmitting) {
    return (
      <div className={styles.requestForm} style={{ minHeight: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div className={styles.spinner} style={{ margin: '0 auto 24px auto', width: 48, height: 48, border: '6px solid #e0e0e0', borderTop: '6px solid #00bcd4', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <div style={{ fontSize: 20, fontWeight: 500, color: '#00bcd4' }}>Submitting your request...</div>
        </div>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className={styles.requestForm} style={{ minHeight: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: '#f6fffa', border: '1px solid #b2dfdb', borderRadius: 8, padding: '32px 24px', maxWidth: 500, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ color: '#009688', fontWeight: 700, fontSize: '1.7rem', marginBottom: 16 }}>Thank you for contacting Sokana Collective!</h2>
          <p style={{ color: '#333', fontSize: 17, marginBottom: 16 }}>
            We are excited to get to know you and find out how we can support you. We have received your request for service and have started working on your match. We will be in touch soon with a doula introduction. In the meantime if you have any questions please let us know.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.requestForm}>
      {/* Progress Bar */}
      <div style={{ width: '100%', height: 8, background: '#e0e0e0', borderRadius: 4, margin: '24px 0 32px 0', overflow: 'hidden' }}>
        <div style={{ width: `${progress}%`, height: '100%', background: '#00bcd4', transition: 'width 0.3s cubic-bezier(.4,0,.2,1)' }} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2.5rem' }}>
        <img src="/logo.jpeg" alt="Sokana Collective Logo" style={{ width: 180, height: 'auto', margin: '0 auto 1.5rem auto', display: 'block' }} />
        <h1 style={{ fontWeight: 700, fontSize: '2.2rem', margin: 0, textAlign: 'center' }}>Request for Service Form</h1>
        <div style={{ color: '#666', fontSize: '1.15rem', margin: '1.2rem 0 0 0', textAlign: 'center', maxWidth: 700 }}>
          Please complete this form as thoroughly as possible so we can match you with a doula according to your needs.
        </div>
      </div>
      <Form {...form}>
        {step === 0 && <Step1Personal form={form} control={control} handleBack={handleBack} handleNextStep={handleNextStep} step={step} totalSteps={totalSteps} />}
        {step === 1 && <Step2Home form={form} control={control} handleBack={handleBack} handleNextStep={handleNextStep} step={step} totalSteps={totalSteps} />}
        {step === 2 && <Step3FamilyMembers form={form} control={control} handleBack={handleBack} handleNextStep={handleNextStep} step={step} totalSteps={totalSteps} />}
        {step === 3 && <Step4Referral form={form} control={control} handleBack={handleBack} handleNextStep={handleNextStep} step={step} totalSteps={totalSteps} />}
        {step === 4 && <Step5HealthHistory form={form} control={control} handleBack={handleBack} handleNextStep={handleNextStep} step={step} totalSteps={totalSteps} />}
        {step === 5 && <Step6PregnancyBaby form={form} control={control} handleBack={handleBack} handleNextStep={handleNextStep} step={step} totalSteps={totalSteps} />}
        {step === 6 && <Step7PastPregnancies form={form} control={control} handleBack={handleBack} handleNextStep={handleNextStep} step={step} totalSteps={totalSteps} />}
        {step === 7 && <Step8ServicesInterested form={form} control={control} handleBack={handleBack} handleNextStep={handleNextStep} step={step} totalSteps={totalSteps} />}
        {step === 8 && <Step9Payment form={form} control={control} handleBack={handleBack} handleNextStep={handleNextStep} step={step} totalSteps={totalSteps} />}
        {step === 9 && <Step10ClientDemographics form={form} control={control} handleBack={handleBack} handleNextStep={handleNextStep} step={step} totalSteps={totalSteps} />}
      </Form>
    </div>
  );
}