import { useClients } from '@/common/hooks/clients/useClients'
import { Main } from '@/common/layouts/Main'
import { ClientsTable } from '@/features/clients/components/ClientsTable'
import { UsersDialogs } from '@/features/clients/components/dialog/UsersDialogs'
import { DraggableTemplate } from '@/features/clients/components/TemplateSidebar'
import { columns } from '@/features/clients/components/users-columns'
import { useUsers } from '@/features/clients/context/users-context'
import { ContractTemplate, userListSchema, UserSummary } from '@/features/clients/data/schema'
import { DndContext, DragOverlay } from '@dnd-kit/core'
import { useEffect, useState } from 'react'

export default function ClientsBoard() {
  const { clients, getClients } = useClients();
  const [userList, setUserList] = useState<UserSummary[]>([]);
  const [sidebarVisible, setSidebarVisible] = useState<boolean>(true);
  const [draggedTemplate, setDraggedTemplate] = useState<ContractTemplate | null>(null);
  const { setOpen } = useUsers();

  useEffect(() => { getClients(); }, []);
  useEffect(() => {
    if (clients.length === 0) return;
    try {
      const parsed = userListSchema.parse(clients);
      setUserList(parsed);
    } catch (err) {
      console.error('Failed to parse client list with Zod:', err);
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
    
    if (active.data.current?.type === 'template' && over.data?.current?.type === 'user') {
      setOpen('add');
    }
  };

  return (
    <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0'>

      <DndContext 
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}>
        <Main>

          <ClientsTable data={userList} columns={columns} />
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