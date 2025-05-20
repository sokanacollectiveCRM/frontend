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
import { toast } from '@/common/hooks/toast/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useClientsTable } from '../../contexts/ClientsContext';
import { useTemplatesContext } from '../../contexts/TemplatesContext';

const formSchema = z.object({
  client: z.string().min(1, { message: 'Client is required.' }),
  template: z.string().min(1, { message: 'Template is required.' }),
  note: z.string().optional(),
  fee: z.string().optional(),
  deposit: z.string().optional(),
});

type ContractForm = z.infer<typeof formSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ContractCreationDialog({ open, onOpenChange }: Props) {
  const { dialogTemplate, currentRow } = useClientsTable();
  const { templates } = useTemplatesContext();

  const form = useForm<ContractForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      client: '',
      template: '',
      note: '',
      fee: '',
      deposit: '',
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        client: currentRow ? `${currentRow.firstname} ${currentRow.lastname}` : '',
        template: dialogTemplate?.name ?? '',
        note: '',
        fee: '',
        deposit: '',
      })
    }
  }, [open, currentRow, dialogTemplate])

  const onSubmit = (values: ContractForm) => {
    form.reset();
    toast({
      title: 'New Contract Submitted',
      description: (
        <pre className='mt-2 w-[340px] rounded-md bg-slate-950 p-4'>
          <code className='text-white'>{JSON.stringify(values, null, 2)}</code>
        </pre>
      ),
    });
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        form.reset();
        onOpenChange(state);
      }}
    >
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader className='text-left'>
          <DialogTitle>Create New Contract</DialogTitle>
          <DialogDescription>
            Fill out the contract details. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <div className='-mr-4 h-[26.25rem] w-full overflow-y-auto py-1 pr-4'>
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
                  <FormItem>
                    <FormLabel>Client</FormLabel>
                    <FormControl>
                      <Input placeholder='Jane Smith' {...field} />
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
                      <Input placeholder={`Default - $3000`} {...field} />
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
                      <Input placeholder='Default - $1000' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>
        <DialogFooter>
          <Button type='submit' form='contract-form'>
            Save Contract
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
