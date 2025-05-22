import { useUsers } from '@/common/contexts/UsersContext'
import { useClients } from '@/common/hooks/clients/useClients'
import { Main } from '@/common/layouts/Main'
import { ClientsTable } from '@/features/clients/components/ClientsTable'
import { UsersDialogs } from '@/features/clients/components/dialog/UsersDialogs'
import { DraggableTemplate } from '@/features/clients/components/DraggableTemplate'
import { columns } from '@/features/clients/components/users-columns'
import { ContractTemplate, userListSchema, UserSummary } from '@/features/clients/data/schema'
import { DndContext, DragOverlay } from '@dnd-kit/core'
import { useEffect, useState } from 'react'

export default function ClientsBoard() {
  const { clients, getClients } = useClients();
  const [userList, setUserList] = useState<UserSummary[]>([]);
  const [draggedTemplate, setDraggedTemplate] = useState<ContractTemplate | null>(null);
  const { setOpen, setDialogTemplate, setCurrentRow } = useUsers();

  useEffect(() => { getClients(); }, []);
  useEffect(() => {
    if (clients.length === 0) return;
    try {
      const parsed = userListSchema.parse(clients);
      setUserList(parsed);
    } catch (err) {
      setUserList([]);
    }
  }, [clients]);

  const handleDragStart = (event: any) => {
    if (event.active.data.current?.type === 'template') {
      setDraggedTemplate(event.active.data.current.template);
    }
  }

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    setDraggedTemplate(null);

    if (!active || !over) return;
  
    if (draggedTemplate && over.data?.current?.type === 'user') {
      setDialogTemplate(draggedTemplate);
      setCurrentRow(over.data.current.user);
      setOpen('add');
    }
  };

  return (
    <div className='-mx-4 flex-1 overflow-auto py-1 lg:flex-row lg:space-x-12 lg:space-y-0'>

      <DndContext 
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}>
        <Main>
        
          <ClientsTable data={userList} columns={columns} draggedTemplate={draggedTemplate}/>
          <UsersDialogs />
        </Main>

        <DragOverlay>
          {draggedTemplate ? (
              <DraggableTemplate template={draggedTemplate}/>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}