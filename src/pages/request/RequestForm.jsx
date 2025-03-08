import React, { useContext, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { UserContext } from "@/common/contexts/UserContext";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"


export default function RequestForm() {
  const { user } = useContext(UserContext);
  const [step, setStep] = useState(0);
  const totalSteps = 4;

  const form = useForm();
  const { handleSubmit, control, reset } = form;




  const onSubmit = async (formData) => {
    if (step < totalSteps - 1) {
      setStep(step + 1);
    } else {
      console.log(formData);
      setStep(0);
      reset();
      toast.success("Request Form Submitted");
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
              <form onSubmit={handleSubmit(onSubmit)} className="grid gap-y-4">
                <FormField
                  control={control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <div className = "mb-5 font-semibold text-lg underline">Personal Info</div>
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
                  name="lastName"
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
                  name="phoneNumber"
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
                      <Select>
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
                    {step === 3 ? 'Submit' : 'Next'}
                  </Button>
                </div>
              </form>
            </Form>
          )}
  
          {step === 1 && (
            <Form {...form}>
              <form onSubmit={handleSubmit(onSubmit)} className="grid gap-y-4">
                <FormField
                  control={control}
                  name="healthIssues"
                  render={({ field }) => (
                    <FormItem>
                      <div className = "mb-5 font-semibold text-lg underline">Health Info</div>
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
                    {step === 3 ? 'Submit' : 'Next'}
                  </Button>
                </div>
              </form>
            </Form>
          )}
          {step === 2 && (
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-y-4">
            <FormField
              control={control}
              name="Address"
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
              name="City"
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
              name="State"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>State</FormLabel>
                  <FormControl>
                  <Select>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="None" />
                    </SelectTrigger>
                    <SelectContent>
  <SelectItem value="IL">IL</SelectItem>
  <SelectItem value="AL">AL</SelectItem>
  <SelectItem value="AK">AK</SelectItem>
  <SelectItem value="AZ">AZ</SelectItem>
  <SelectItem value="AR">AR</SelectItem>
  <SelectItem value="CA">CA</SelectItem>
  <SelectItem value="CO">CO</SelectItem>
  <SelectItem value="CT">CT</SelectItem>
  <SelectItem value="DE">DE</SelectItem>
  <SelectItem value="FL">FL</SelectItem>
  <SelectItem value="GA">GA</SelectItem>
  <SelectItem value="HI">HI</SelectItem>
  <SelectItem value="ID">ID</SelectItem>
  <SelectItem value="IN">IN</SelectItem>
  <SelectItem value="IA">IA</SelectItem>
  <SelectItem value="KS">KS</SelectItem>
  <SelectItem value="KY">KY</SelectItem>
  <SelectItem value="LA">LA</SelectItem>
  <SelectItem value="ME">ME</SelectItem>
  <SelectItem value="MD">MD</SelectItem>
  <SelectItem value="MA">MA</SelectItem>
  <SelectItem value="MI">MI</SelectItem>
  <SelectItem value="MN">MN</SelectItem>
  <SelectItem value="MS">MS</SelectItem>
  <SelectItem value="MO">MO</SelectItem>
  <SelectItem value="MT">MT</SelectItem>
  <SelectItem value="NE">NE</SelectItem>
  <SelectItem value="NV">NV</SelectItem>
  <SelectItem value="NH">NH</SelectItem>
  <SelectItem value="NJ">NJ</SelectItem>
  <SelectItem value="NM">NM</SelectItem>
  <SelectItem value="NY">NY</SelectItem>
  <SelectItem value="NC">NC</SelectItem>
  <SelectItem value="ND">ND</SelectItem>
  <SelectItem value="OH">OH</SelectItem>
  <SelectItem value="OK">OK</SelectItem>
  <SelectItem value="OR">OR</SelectItem>
  <SelectItem value="PA">PA</SelectItem>
  <SelectItem value="RI">RI</SelectItem>
  <SelectItem value="SC">SC</SelectItem>
  <SelectItem value="SD">SD</SelectItem>
  <SelectItem value="TN">TN</SelectItem>
  <SelectItem value="TX">TX</SelectItem>
  <SelectItem value="UT">UT</SelectItem>
  <SelectItem value="VT">VT</SelectItem>
  <SelectItem value="VA">VA</SelectItem>
  <SelectItem value="WA">WA</SelectItem>
  <SelectItem value="WV">WV</SelectItem>
  <SelectItem value="WI">WI</SelectItem>
  <SelectItem value="WY">WY</SelectItem>
</SelectContent>
                  </Select>
                  </FormControl>
                  <FormDescription></FormDescription>
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="Zip"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Zip Code</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter Your Zip Code" maxLength={5} inputMode = "numeric" />
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
                    disabled={step === 0}
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

{step === 3 && (
            <Form {...form}>
              <form onSubmit={handleSubmit(onSubmit)} className="grid gap-y-4">
                <FormField
                  control={control}
                  name="healthIssues"
                  render={({ field }) => (
                    <FormItem>
                      <div className = "mb-5 font-semibold text-lg underline">Income Info</div>
                      <FormLabel>Annual Income</FormLabel>
                      <FormControl>
                      <Select>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="25k">$0 - $24,999: Labor - $150 | Postpartum $150 for up to 30hrs of care</SelectItem>
                          <SelectItem value="45k">$25,000 - $44,999: Labor - $300 | Postpartum $12/hr daytime and $15/hr for overnight </SelectItem>
                          <SelectItem value="65k">$45,000 - $64,999: Labor - $700 | Postpartum $17/hr daytime and $20/hr for overnight</SelectItem>
                          <SelectItem value="85k">$65,000 - $84,999: Labor - $1,000 | Postpartum $27/hr daytime and $30/hr for overnight</SelectItem>
                          <SelectItem value="100k">$85,000 - $99,999: Labor - $1,350 | Postpartum $34/hr daytime and $37/hr for overnight</SelectItem>
                          <SelectItem value="over">$100,000 and above: Labor - $1,500 | Postpartum $37/hr daytime and $40/hr for overnight</SelectItem>
                        </SelectContent>
                      </Select>
                      </FormControl>
                      <FormDescription></FormDescription>
                    </FormItem>
                  )}
                />
                 <FormField
                  control={control}
                  name="serviceInterest"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>What Service Are you Interested In?</FormLabel>
                      <FormControl>
                      <Select>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Labor">Labor Support</SelectItem>
                          <SelectItem value="1st Night">1st Night Care</SelectItem>
                          <SelectItem value="Postpartum">Postpartum Support</SelectItem>
                          <SelectItem value="Lactation">Lactation Support</SelectItem>
                          <SelectItem value="Perinatal">Perinatal Support</SelectItem>
                          <SelectItem value="Abortion">Abortion Support</SelectItem>
                        </SelectContent>
                      </Select> 
                      </FormControl>
                      <FormDescription></FormDescription>
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="serviceInfo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel> Service Specifics</FormLabel>
                      <FormDescription>What does doula support look like for you? Be specific. How can a labor doula help? For postpartum do you want daytime, overnights and for how many weeks</FormDescription>
                      <FormControl>
                        <Textarea {...field} placeholder="Please be Detailed" autoComplete="off" />
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
                    disabled={step === 0}
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