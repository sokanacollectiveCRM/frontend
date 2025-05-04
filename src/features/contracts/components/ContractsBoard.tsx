import { ClientCard } from '@/features/contracts/components/ClientCard';
import { ContractTemplateCard } from '@/features/contracts/components/ContractTemplateCard';
import { useUsers } from "@/features/contracts/context/users-context";
import { ContractTemplate, UserSummary } from '@/features/contracts/data/schema';
import { DndContext } from '@dnd-kit/core';

const mockTemplates: ContractTemplate[] = [
  { id: '1', title: 'Retainer Agreement'},
  { id: '2', title: 'Design Services'},
]

type ContractsBoardProps = {
  userList: UserSummary[],
}

export function ContractsBoard({ userList }: ContractsBoardProps) {
  const { setOpen } = useUsers();

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (!active || !over) return;
    if (active.data.current?.type === 'template' && over.data?.current?.type === 'client') {
      setOpen('add');
    }
  }

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className='flex w-full justify-center px-6'>
        <div className='w-[40%] space-y-4'>
          <h3 className='text-lg font-semibold'>Templates</h3>
          {mockTemplates.map(template => (
            <ContractTemplateCard key={template.id} template={template} />
          ))}
        </div>

        <div className='w-[80px]' />

        <div className='w-[40%] space-y-4'>
          <h3 className='text-lg font-semibold'>Clients</h3>
          {userList.map((client: UserSummary) => (
            <ClientCard key={client.id} client={client} />
          ))}
        </div>
      </div>
    </DndContext>
  )
}