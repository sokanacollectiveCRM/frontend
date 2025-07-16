'use client'

import { PasswordInput } from '@/common/components/form/PasswordInput'
import { SelectDropdown } from '@/common/components/form/SelectDropdown'
import { Button } from '@/common/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/common/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/common/components/ui/form'
import { Input } from '@/common/components/ui/input'
import updateClient from '@/common/utils/updateClient'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { userTypes } from '../data/data'
import { User } from '../data/schema'

const formSchema = z
  .object({
    firstName: z.string().min(1, { message: 'First Name is required.' }),
    lastName: z.string().min(1, { message: 'Last Name is required.' }),
    phoneNumber: z.string().min(1, { message: 'Phone number is required.' }),
    email: z
      .string()
      .min(1, { message: 'Email is required.' })
      .email({ message: 'Email is invalid.' }),
    role: z.string().min(1, { message: 'Role is required.' }),
    password: z.string().optional(),
    confirmPassword: z.string().optional(),
    isEdit: z.boolean(),
  })
  .superRefine(({ isEdit, password, confirmPassword }, ctx) => {
    // Only validate password for new users or when password is being changed
    if (!isEdit) {
      if (!password || password === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Password is required.',
          path: ['password'],
        })
      } else if (password.length < 8) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Password must be at least 8 characters long.',
          path: ['password'],
        })
      } else if (!password.match(/[a-z]/)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Password must contain at least one lowercase letter.',
          path: ['password'],
        })
      } else if (!password.match(/\d/)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Password must contain at least one number.',
          path: ['password'],
        })
      } else if (password !== confirmPassword) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Passwords don't match.",
          path: ['confirmPassword'],
        })
      }
    } else if (password && password.trim() !== '') {
      // For edit mode, only validate if password is being changed
      if (password.length < 8) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Password must be at least 8 characters long.',
          path: ['password'],
        })
      } else if (!password.match(/[a-z]/)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Password must contain at least one lowercase letter.',
          path: ['password'],
        })
      } else if (!password.match(/\d/)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Password must contain at least one number.',
          path: ['password'],
        })
      } else if (password !== confirmPassword) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Passwords don't match.",
          path: ['confirmPassword'],
        })
      }
    }
  })
type UserForm = z.infer<typeof formSchema>

interface Props {
  currentRow?: User
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdateSuccess?: () => void
}

export function UsersActionDialog({ currentRow, open, onOpenChange, onUpdateSuccess }: Props) {
  const isEdit = !!currentRow
  const form = useForm<UserForm>({
    resolver: zodResolver(formSchema),
    defaultValues: isEdit
      ? {
        firstName: currentRow?.firstname || '',
        lastName: currentRow?.lastname || '',
        email: currentRow?.email || '',
        phoneNumber: currentRow?.phoneNumber || '',
        role: currentRow?.role || '',
        password: '',
        confirmPassword: '',
        isEdit,
      }
      : {
        firstName: '',
        lastName: '',
        email: '',
        role: '',
        phoneNumber: '',
        password: '',
        confirmPassword: '',
        isEdit,
      },
  })

  const onSubmit = async (values: UserForm) => {
    if (!currentRow?.id) {
      toast.error('No client selected for update');
      return;
    }

    try {
      // Prepare update data, excluding unchanged fields
      const updateData: any = {};
      const changedFields: string[] = [];

      // Check which fields have changed
      if (values.firstName !== currentRow.firstname) {
        updateData.firstname = values.firstName;
        changedFields.push('firstname');
      }
      if (values.lastName !== currentRow.lastname) {
        updateData.lastname = values.lastName;
        changedFields.push('lastname');
      }
      if (values.email !== currentRow.email) {
        updateData.email = values.email;
        changedFields.push('email');
      }
      if (values.phoneNumber !== currentRow.phoneNumber) {
        updateData.phone_number = values.phoneNumber; // Use database field name
        changedFields.push('phone_number');
      }
      if (values.role !== currentRow.role) {
        updateData.role = values.role;
        changedFields.push('role');
      }
      if (values.password && values.password.trim()) {
        updateData.password = values.password;
        changedFields.push('password');
      }

      // Only update if there are changes
      if (changedFields.length === 0) {
        toast('No changes detected - No fields were modified');
        return;
      }

      // Debug: Log the client data to see what ID we're using
      console.log('🔍 DEBUG: Client data being updated:', currentRow);
      console.log('🔍 DEBUG: Client ID being used:', currentRow.id);
      console.log('🔍 DEBUG: Phone number field:', currentRow.phoneNumber);
      console.log('🔍 DEBUG: All client fields:', Object.keys(currentRow));
      console.log('🔍 DEBUG: Update data being sent:', updateData);

      // Call the API to update the client
      const result = await updateClient(currentRow.id, updateData);

      if (result.success) {
        toast.success(`Client Record Updated Successfully: The following updates have been made - ${changedFields.join(', ')}`);
        form.reset();
        onOpenChange(false);

        // Refresh the client list to show updated data
        if (onUpdateSuccess) {
          onUpdateSuccess();
        }
      } else {
        toast.error(result.error || 'Update failed - An unexpected error occurred');
      }
    } catch (error) {
      console.error('Error updating client:', error);
      toast.error('Update failed - An unexpected error occurred');
    }
  }

  const isPasswordTouched = !!form.formState.dirtyFields.password

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        form.reset()
        onOpenChange(state)
      }}
    >
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader className='text-left'>
          <DialogTitle>{isEdit ? 'Edit User' : 'Add New User'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Update the user here. ' : 'Create new user here. '}
            Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <div className='-mr-4 h-[26.25rem] w-full overflow-y-auto py-1 pr-4'>
          <Form {...form}>
            <form
              id='user-form'
              onSubmit={form.handleSubmit(onSubmit)}
              className='space-y-4 p-0.5'
            >
              <FormField
                control={form.control}
                name='firstName'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center gap-x-4 gap-y-1 space-y-0'>
                    <FormLabel className='col-span-2 text-right'>
                      First Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='John'
                        className='col-span-4'
                        autoComplete='off'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='lastName'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center gap-x-4 gap-y-1 space-y-0'>
                    <FormLabel className='col-span-2 text-right'>
                      Last Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Doe'
                        className='col-span-4'
                        autoComplete='off'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              {!isEdit && (
                <>
                  <FormField
                    control={form.control}
                    name='password'
                    render={({ field }) => (
                      <FormItem className='grid grid-cols-6 items-center gap-x-4 gap-y-1 space-y-0'>
                        <FormLabel className='col-span-2 text-right'>
                          Password
                        </FormLabel>
                        <FormControl>
                          <PasswordInput
                            placeholder='e.g., S3cur3P@ssw0rd'
                            className='col-span-4'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className='col-span-4 col-start-3' />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='confirmPassword'
                    render={({ field }) => (
                      <FormItem className='grid grid-cols-6 items-center gap-x-4 gap-y-1 space-y-0'>
                        <FormLabel className='col-span-2 text-right'>
                          Confirm Password
                        </FormLabel>
                        <FormControl>
                          <PasswordInput
                            disabled={!isPasswordTouched}
                            placeholder='e.g., S3cur3P@ssw0rd'
                            className='col-span-4'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className='col-span-4 col-start-3' />
                      </FormItem>
                    )}
                  />
                </>
              )}
              <FormField
                control={form.control}
                name='email'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center gap-x-4 gap-y-1 space-y-0'>
                    <FormLabel className='col-span-2 text-right'>
                      Email
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='john.doe@gmail.com'
                        className='col-span-4'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='phoneNumber'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center gap-x-4 gap-y-1 space-y-0'>
                    <FormLabel className='col-span-2 text-right'>
                      Phone Number
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='+123456789'
                        className='col-span-4'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='role'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center gap-x-4 gap-y-1 space-y-0'>
                    <FormLabel className='col-span-2 text-right'>
                      Role
                    </FormLabel>
                    <SelectDropdown
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                      placeholder='Select a role'
                      className='col-span-4'
                      items={userTypes.map(({ label, value }: { label: string, value: string }) => ({
                        label,
                        value,
                      }))}
                    />
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>
        <DialogFooter>
          <Button type='submit' form='user-form'>
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 