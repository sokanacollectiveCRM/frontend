import { Form } from '@/common/components/ui/form';
import { toast } from 'sonner';
import styles from './RequestForm.module.scss';
import { Step1Personal } from './Step1Personal';
import { Step2Home } from './Step2Health';
import { Step10ClientDemographics, Step3FamilyMembers, Step4Referral, Step5HealthHistory, Step6PregnancyBaby, Step7PastPregnancies, Step8ServicesInterested, Step9Payment } from './Step3Home';
import { RequestFormValues, useRequestForm } from './useRequestForm';

export default function RequestForm() {
  const onSubmit = async (formData: RequestFormValues) => {
    // TODO: API call here
    toast.success('Request Form Submitted');
  };
  const { form, step, setStep, totalSteps, handleNextStep, handleBack } = useRequestForm(onSubmit);
  const { control } = form;

  return (
    <div className={styles.requestForm}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2.5rem' }}>
        <img src="/public/logo.jpeg" alt="Sokana Collective Logo" style={{ width: 180, height: 'auto', margin: '0 auto 1.5rem auto', display: 'block' }} />
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
        {step === 6 && <Step7PastPregnancies handleBack={handleBack} handleNextStep={handleNextStep} step={step} totalSteps={totalSteps} />}
        {step === 7 && <Step8ServicesInterested handleBack={handleBack} handleNextStep={handleNextStep} step={step} totalSteps={totalSteps} />}
        {step === 8 && <Step9Payment handleBack={handleBack} handleNextStep={handleNextStep} step={step} totalSteps={totalSteps} />}
        {step === 9 && <Step10ClientDemographics handleBack={handleBack} handleNextStep={handleNextStep} step={step} totalSteps={totalSteps} />}
      </Form>
    </div>
  );
}