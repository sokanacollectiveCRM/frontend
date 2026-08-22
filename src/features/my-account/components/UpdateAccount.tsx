import { Button } from '@/common/components/ui/button';
import { logFailure } from '@/utils/safeLog';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/common/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/common/components/ui/form';
import { Input } from '@/common/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/common/components/ui/select';
import { Separator } from '@/common/components/ui/separator';
import { LoadingOverlay } from '@/common/components/loading/LoadingOverlay';
import { useUser } from '@/common/hooks/user/useUser';
import { STATES } from '@/common/utils/50States';
import saveUser from '@/common/utils/saveUser';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import styled from 'styled-components';
import { toast } from 'sonner';

const TwoInputs = styled.div`
  display: flex;
  flex-direction: row;
  gap: 10px;
`;

interface AccountFormValues {
  firstname?: string;
  lastname?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
}

/** Accepts stored "IL" or "Illinois" and returns the Select option code. */
function normalizeStateCode(raw?: string | null): string {
  const trimmed = (raw || '').trim();
  if (!trimmed) return '';
  const byCode = STATES.find(
    (s) => s.value.toLowerCase() === trimmed.toLowerCase()
  );
  if (byCode) return byCode.value;
  const byLabel = STATES.find(
    (s) => s.label.toLowerCase() === trimmed.toLowerCase()
  );
  return byLabel?.value || '';
}

export const Account = () => {
  const { user, isLoading, checkAuth, setUser } = useUser();

  const accountForm = useForm<AccountFormValues>({
    defaultValues: {
      firstname: '',
      lastname: '',
      email: '',
      address: '',
      city: '',
      state: '',
    },
  });

  useEffect(() => {
    if (!user) return;
    accountForm.reset({
      firstname: user.firstname || '',
      lastname: user.lastname || '',
      email: user.email || '',
      address: user.address || '',
      city: user.city || '',
      state: normalizeStateCode(user.state),
    });
  }, [user, accountForm]);

  const submitAccountForm = async (values: AccountFormValues) => {
    if (!user?.id) return;

    const userFormData = new FormData();
    userFormData.append('id', user.id);
    userFormData.append('firstname', values.firstname ?? ''); // This just ensures that the value is '' if not filled in
    userFormData.append('lastname', values.lastname ?? '');
    userFormData.append('email', values.email ?? '');
    userFormData.append('address', values.address ?? '');
    userFormData.append('city', values.city ?? '');
    userFormData.append(
      'state',
      normalizeStateCode(values.state) || values.state || ''
    );

    try {
      const savedUser = await saveUser(userFormData);
      toast.success('Changes saved');
      setUser((prev) => (prev ? { ...prev, ...savedUser } : savedUser));
      await checkAuth({ silent: true });
      accountForm.reset(values);
    } catch (err) {
      logFailure('my-account', 'user_not_saved_successfully');
      toast.error(
        err instanceof Error ? err.message : 'Could not save changes.'
      );
    }
  };

  return (
    <div>
      <LoadingOverlay isLoading={isLoading} />
      <Card className='min-h-96 py-5'>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>Update your personal details</CardDescription>
        </CardHeader>
        <CardContent className='flex flex-col flex-1'>
          <Separator />
          <Form {...accountForm}>
            <form
              onSubmit={accountForm.handleSubmit(submitAccountForm)}
              className='flex flex-col flex-1 py-5 space-y-4'
            >
              <TwoInputs>
                <FormField
                  control={accountForm.control}
                  name='firstname'
                  render={({ field }) => (
                    <FormItem className='flex-1'>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder={user?.firstname || ''} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={accountForm.control}
                  name='lastname'
                  render={({ field }) => (
                    <FormItem className='flex-1'>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder={user?.lastname || ''} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TwoInputs>
              <FormField
                control={accountForm.control}
                name='email'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder={user?.email || ''} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <TwoInputs>
                <FormField
                  control={accountForm.control}
                  name='address'
                  render={({ field }) => (
                    <FormItem className='flex-1'>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input placeholder={user?.address || ''} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={accountForm.control}
                  name='city'
                  render={({ field }) => (
                    <FormItem className='flex-1'>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder={user?.city || ''} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TwoInputs>
              <FormField
                control={accountForm.control}
                name='state'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || undefined}
                    >
                      <FormControl>
                        <SelectTrigger className='w-[180px]'>
                          <SelectValue placeholder='Select state' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {STATES.map((state) => (
                          <SelectItem
                            key={state.value}
                            value={state.value}
                            className='cursor-pointer'
                          >
                            {state.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type='submit' className='cursor-pointer mt-10'>
                {isLoading ? (
                  <Loader2 className='h-4 w-4 animate-spin mx-auto' />
                ) : (
                  'Save Changes'
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};
