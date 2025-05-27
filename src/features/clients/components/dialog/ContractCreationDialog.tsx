import { Button } from '@/common/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/common/components/ui/dialog';
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
import { Textarea } from '@/common/components/ui/textarea';
import { createContract } from '@/common/utils/createContract';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { useTable } from '../../contexts/TableContext';
import { useTemplatesContext } from '../../contexts/TemplatesContext';
import { clientSchema } from '../../data/schema';
import { ClientDropdown } from '../ClientDropdown';

const formSchema = z.object({
  client: clientSchema,
  template: z.string().min(1, { message: "Template is required" }),
  note: z.string().optional(),
  fee: z.string().optional(),
  deposit: z.string().optional(),
});

type ContractForm = z.infer<typeof formSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: string) => void;
}

export function ContractCreationDialog({ open, onOpenChange }: Props) {
  const { dialogTemplate, currentRow } = useTable();
  const { templates } = useTemplatesContext();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const form = useForm<ContractForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      client: currentRow!,
      template: '',
      note: '',
      fee: '',
      deposit: '',
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        client: currentRow ?? undefined,
        template: dialogTemplate?.name ?? undefined,
        note: '',
        fee: dialogTemplate?.serviceFee.toString() ?? '',
        deposit: dialogTemplate?.depositFee.toString() ?? '',
      });
    }
  }, [open, currentRow, dialogTemplate]);

  const onSubmit = async (values: ContractForm) => {
    setIsLoading(true);
    form.reset();

    const fullTemplate = templates.find((t) => t.name === values.template);
    if (!fullTemplate) {
      toast.error('Selected template not found');
      return;
    }

    try {
      await createContract({
        templateId: fullTemplate.id,
        client: values.client,
        note: values.note,
        fee: values.fee,
        deposit: values.deposit
      });
      setIsLoading(false);
      onOpenChange('');
      toast.success(`Created ${fullTemplate.name} agreement with ${values.client.user.firstname} ${values.client.user.lastname}.`);
    }
    catch (err) {
      setIsLoading(false);
      toast.error(`Something went wrong. ${err instanceof Error ? err.message : ''}`)
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        form.reset();
        onOpenChange(state ? 'new-contract' : '');
      }}
    >
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader className='text-left mt-2'>
          <DialogTitle>Create New Contract</DialogTitle>
          <DialogDescription>
            Fill out the contract details. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <div className=' h-[26.25rem] w-full overflow-y-auto py-1 '>
          <Form {...form}>
            <form
              id='contract-form'
              onSubmit={form.handleSubmit(onSubmit)}
              className='space-y-4 p-0.5'
            >
              <FormField
                control={form.control}
                name='client'
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Client</FormLabel>
                    <FormControl>
                      <ClientDropdown
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="template"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Template</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a template" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className='z-[9999]'>
                        {templates.map((template) => (
                          <SelectItem key={template.id} value={template.name}>
                            {template.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='note'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Note</FormLabel>
                    <FormControl>
                      <Textarea placeholder='Any additional details...' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='fee'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fee</FormLabel>
                    <FormControl>
                      <Input placeholder={`Default - $${dialogTemplate?.serviceFee}`} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='deposit'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deposit</FormLabel>
                    <FormControl>
                      <Input placeholder={`Default - $${dialogTemplate?.depositFee}`} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>
        <DialogFooter>
          <Button type="submit" form='contract-form' className="w-full" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin mx-auto" />
            ) : (
              'Save Contract'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
