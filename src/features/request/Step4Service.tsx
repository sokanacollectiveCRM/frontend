import { Button } from '@/common/components/ui/button';
import { FormControl, FormDescription, FormField, FormItem, FormLabel } from '@/common/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/common/components/ui/select';
import { Textarea } from '@/common/components/ui/textarea';
import styles from './RequestForm.module.scss';

export function Step4Service({ form, control, handleBack, handleNextStep, step, totalSteps }: any) {
  return (
    <form onSubmit={e => { e.preventDefault(); handleNextStep(); }}>
      <div className={styles['form-section-title']}>Income & Service Info</div>
      <FormField control={control} name="annual_income" render={({ field }) => (
        <FormItem>
          <FormLabel>Annual Income</FormLabel>
          <FormControl>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="$0-$24,999">$0 - $24,999: Labor - $150 | Postpartum $150 for up to 30hrs of care</SelectItem>
                <SelectItem value="$25,000-$44,999">$25,000 - $44,999: Labor - $300 | Postpartum $12/hr daytime and $15/hr for overnight </SelectItem>
                <SelectItem value="$45,000-$64,999">$45,000 - $64,999: Labor - $700 | Postpartum $17/hr daytime and $20/hr for overnight</SelectItem>
                <SelectItem value="$65,000-$84,999">$65,000 - $84,999: Labor - $1,000 | Postpartum $27/hr daytime and $30/hr for overnight</SelectItem>
                <SelectItem value="$85,000-$99,999">$85,000 - $99,999: Labor - $1,350 | Postpartum $34/hr daytime and $37/hr for overnight</SelectItem>
                <SelectItem value="100k and above">$100,000 and above: Labor - $1,500 | Postpartum $37/hr daytime and $40/hr for overnight</SelectItem>
              </SelectContent>
            </Select>
          </FormControl>
        </FormItem>
      )} />
      <FormField control={control} name="service_needed" render={({ field }) => (
        <FormItem>
          <FormLabel>What Service Are you Interested In?</FormLabel>
          <FormControl>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Labor Support">Labor Support</SelectItem>
                <SelectItem value="1st Night Care">1st Night Care</SelectItem>
                <SelectItem value="Postpartum Support">Postpartum Support</SelectItem>
                <SelectItem value="Lactation Support">Lactation Support</SelectItem>
                <SelectItem value="Perinatal Support">Perinatal Support</SelectItem>
                <SelectItem value="Abortion Support">Abortion Support</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </FormControl>
        </FormItem>
      )} />
      <FormField control={control} name="service_specifics" render={({ field }) => (
        <FormItem>
          <FormLabel>Service Specifics</FormLabel>
          <FormDescription>What does doula support look like for you? Be specific. How can a labor doula help? For postpartum do you want daytime, overnights and for how many weeks. If you selected Other for the previous question, please elaborate here.</FormDescription>
          <FormControl><Textarea {...field} autoComplete="off" /></FormControl>
        </FormItem>
      )} />
      <div className={styles['button-row']}>
        <Button type="button" onClick={handleBack} disabled={step === 0}>Back</Button>
        <Button type="submit" disabled={!form.formState.isValid || form.formState.isSubmitting}>{step === totalSteps - 1 ? 'Submit' : 'Next'}</Button>
      </div>
    </form>
  );
} 