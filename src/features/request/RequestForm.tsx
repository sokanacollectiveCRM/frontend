import { DatePicker } from "@/common/components/form/DatePicker";
import { Button } from "@/common/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/common/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/common/components/ui/form";
import { Input } from "@/common/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/common/components/ui/select";
import { Textarea } from "@/common/components/ui/textarea";
import { STATES } from "@/common/utils/50States";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from 'zod';

type RequestFormValues = {
  firstname: string;
  lastname: string;
  email: string;
  phone_number: string;
  pronouns: string;
  health_history: string;
  allergies: string;
  hospital: string;
  due_date: Date;
  baby_sex: string;
  children_expected: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  annual_income: string;
  service_needed: string;
  service_specifics: string;
};

const fullSchema = z.object({
  firstname: z.string().min(1),
  lastname: z.string().min(1),
  email: z.string().email(),
  phone_number: z.string().min(1),
  pronouns: z.string().min(1),
  health_history: z.string().min(1),
  allergies: z.string().min(1),
  hospital: z.string().min(1),
  due_date: z.date({ required_error: "Due date is required" }),
  baby_sex: z.string().min(1),
  children_expected: z.string().min(1),
  address: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  zip_code: z.string().min(1),
  annual_income: z.string().min(1),
  service_needed: z.string().min(1),
  service_specifics: z.string().min(1),
});

const stepFields: (keyof RequestFormValues)[][] = [
  ["firstname", "lastname", "email", "phone_number", "pronouns"],
  ["health_history", "allergies", "hospital", "due_date", "baby_sex", "children_expected"],
  ["address", "city", "state", "zip_code"],
  ["annual_income", "service_needed", "service_specifics"],
];

export default function RequestForm() {
  const [step, setStep] = useState<number>(0);
  const totalSteps = 4;

  const form = useForm<RequestFormValues>({
    resolver: zodResolver(fullSchema),
    defaultValues: {
      firstname: '',
      lastname: '',
      email: '',
      phone_number: '',
      pronouns: '',
      health_history: '',
      allergies: '',
      hospital: '',
      due_date: new Date(),
      baby_sex: '',
      children_expected: '1',
      address: '',
      city: '',
      state: '',
      zip_code: '',
      annual_income: '',
      service_needed: '',
      service_specifics: '',
    }
  });

  const { handleSubmit, control, reset } = form;

  const onSubmit = async (formData: RequestFormValues) => {
    const valid = await form.trigger(stepFields[step]);

    if (!valid) {
      toast.error("Please complete all required fields before continuing.");
      return;
    }

    if (step < totalSteps - 1) {
      setStep(step + 1);
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_APP_BACKEND_URL}/requestService/requestSubmission`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const responseData = await response.json();

      if (!response.ok || responseData.error) {
        throw new Error(responseData.error || "Server returned an error.");
      }
      toast.success("Request Form Submitted");
      reset();
      setStep(0);
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Submission failed");
    }
  };

  const handleNextStep = async () => {
    const valid = await form.trigger(stepFields[step]);
    if (!valid) {
      toast.error("Please complete all required fields before continuing.");
      return;
    }

    if (step < totalSteps - 1) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <div key={index} className="flex items-center">
            <div
              className={cn(
                "w-4 h-4 rounded-full transition-all duration-300 ease-in-out",
                index <= step ? "bg-primary" : "bg-primary/30",
                index < step && "bg-primary"
              )}
            />
            {index < totalSteps - 1 && (
              <div
                className={cn(
                  "w-8 h-0.5",
                  index < step ? "bg-primary" : "bg-primary/30"
                )}
              />
            )}
          </div>
        ))}
      </div>
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Sokana Service Request Form</CardTitle>
          <CardDescription>Step {step + 1} of {totalSteps}</CardDescription>
        </CardHeader>
        <CardContent>
          {step === 0 && (
            <Form {...form}>
              <form onSubmit={step === totalSteps - 1 ? handleSubmit(onSubmit) : (e) => { e.preventDefault(); handleNextStep(); }}>
                <FormField
                  control={control}
                  name="firstname"
                  render={({ field }) => (
                    <FormItem>
                      <div className="mb-5 font-semibold text-lg underline">Personal Info</div>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="" autoComplete="off" />
                      </FormControl>
                      <FormDescription></FormDescription>
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="lastname"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="" autoComplete="off" />
                      </FormControl>
                      <FormDescription></FormDescription>
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="" autoComplete="off" />
                      </FormControl>
                      <FormDescription></FormDescription>
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="phone_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="" autoComplete="off" />
                      </FormControl>
                      <FormDescription></FormDescription>
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="pronouns"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pronouns</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Select Pronouns" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="She/Her">She/Her</SelectItem>
                          <SelectItem value="They/Them">They/Them</SelectItem>
                          <SelectItem value="He/Him">He/Him</SelectItem>
                          <SelectItem value="Ze/Hir/Zir">Ze/Hir/Zir</SelectItem>
                          <SelectItem value="None">None</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription></FormDescription>
                    </FormItem>
                  )}
                />
                <div className="flex justify-between">
                  <Button
                    type="button"
                    className="font-medium"
                    size="sm"
                    onClick={handleBack}
                    disabled={step === 0}
                  >
                    Back
                  </Button>
                  <Button type="submit" size="sm" className="font-medium">
                    {Number(step) === 3 ? 'Submit' : 'Next'}
                  </Button>
                </div>
              </form>
            </Form>
          )}

          {step === 1 && (
            <Form {...form}>
              <form onSubmit={step === totalSteps - 1 ? handleSubmit(onSubmit) : (e) => { e.preventDefault(); handleNextStep(); }}>
                <FormField
                  control={control}
                  name="health_history"
                  render={({ field }) => (
                    <FormItem>
                      <div className="mb-5 font-semibold text-lg underline">Health Info</div>
                      <FormLabel>Health Issues</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="" className="resize-none" rows={5} />
                      </FormControl>
                      <FormDescription></FormDescription>
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="allergies"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Allergies</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Please List any Allergies" autoComplete="off" />
                      </FormControl>
                      <FormDescription></FormDescription>
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="hospital"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hospital</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Name of Hospital" autoComplete="off" />
                      </FormControl>
                      <FormDescription></FormDescription>
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="due_date"
                  render={({ field }) => (
                    <DatePicker
                      dateFormat="MM-dd-yyyy"
                      field={field}
                      label="Baby's Due/Birth Date"
                      placeholder="Select due date"
                    />
                  )}
                />
                <FormField
                  control={control}
                  name="baby_sex"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Baby's Sex</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Select Baby's Sex" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription></FormDescription>
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="children_expected"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of Babies</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue="1">
                        <SelectTrigger className="w-[180px]">
                          <SelectValue defaultValue="1" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1</SelectItem>
                          <SelectItem value="2">2</SelectItem>
                          <SelectItem value="3">3</SelectItem>
                          <SelectItem value="4">4</SelectItem>
                          <SelectItem value="5">5</SelectItem>
                          <SelectItem value="6">6</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription></FormDescription>
                    </FormItem>
                  )}
                />
                <div className="flex justify-between">
                  <Button
                    type="button"
                    className="font-medium"
                    size="sm"
                    onClick={handleBack}
                    disabled={Number(step) === 0}
                  >
                    Back
                  </Button>
                  <Button type="submit" size="sm" className="font-medium">
                    {Number(step) === 3 ? 'Submit' : 'Next'}
                  </Button>
                </div>
              </form>
            </Form>
          )}
          {step === 2 && (
            <Form {...form}>
              <form onSubmit={step === totalSteps - 1 ? handleSubmit(onSubmit) : (e) => { e.preventDefault(); handleNextStep(); }}>
                <FormField
                  control={control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <div className="mb-5 font-semibold text-lg underline">Home Details</div>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter Your Address" />
                      </FormControl>
                      <FormDescription></FormDescription>
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter Your City" />
                      </FormControl>
                      <FormDescription></FormDescription>
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="None" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {STATES.map(state => (
                            <SelectItem key={state.value} value={state.value}>
                              {state.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription></FormDescription>
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="zip_code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Zip Code</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter Your Zip Code" maxLength={5} inputMode="numeric" />
                      </FormControl>
                      <FormDescription></FormDescription>
                    </FormItem>
                  )}
                />
                <div className="flex justify-between">
                  <Button
                    type="button"
                    className="font-medium"
                    size="sm"
                    onClick={handleBack}
                    disabled={Number(step) === 0}
                  >
                    Back
                  </Button>
                  <Button type="submit" size="sm" className="font-medium">
                    {Number(step) === 3 ? 'Submit' : 'Next'}
                  </Button>
                </div>
              </form>
            </Form>
          )}

          {step === 3 && (
            <Form {...form}>
              <form onSubmit={step === totalSteps - 1 ? handleSubmit(onSubmit) : (e) => { e.preventDefault(); handleNextStep(); }}>
                <FormField
                  control={control}
                  name="annual_income"
                  render={({ field }) => (
                    <FormItem>
                      <div className="mb-5 font-semibold text-lg underline">Income Info</div>
                      <FormLabel>Annual Income</FormLabel>
                      <FormControl>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <SelectTrigger className="w-[180px]">
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
                      <FormDescription></FormDescription>
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="service_needed"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>What Service Are you Interested In?</FormLabel>
                      <FormControl>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <SelectTrigger className="w-[180px]">
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
                      <FormDescription></FormDescription>
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="service_specifics"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel> Service Specifics</FormLabel>
                      <FormDescription>What does doula support look like for you? Be specific. How can a labor doula help? For postpartum do you want daytime, overnights and for how many weeks. If you selected Other for the previous question, please elaborate here.</FormDescription>
                      <FormControl>
                        <Textarea {...field} placeholder="Please be detailed..." autoComplete="off" />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <div className="flex justify-between">
                  <Button
                    type="button"
                    className="font-medium"
                    size="sm"
                    onClick={handleBack}
                    disabled={Number(step) === 0}
                  >
                    Back
                  </Button>
                  <Button type="submit" size="sm" className="font-medium">
                    {step === 3 ? 'Submit' : 'Next'}
                  </Button>
                </div>
              </form>
            </Form>
          )}

        </CardContent>
      </Card>
    </div>
  );
}