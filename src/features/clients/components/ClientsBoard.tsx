import { LoadingOverlay } from '@/common/components/loading/LoadingOverlay'
import { useClients } from '@/common/hooks/clients/useClients'
import { Main } from '@/common/layouts/Main'
import { Template } from '@/common/types/template'
import { ClientsTable } from '@/features/clients/components/ClientsTable'
import { DraggableTemplate } from '@/features/clients/components/DraggableTemplate'
import { columns } from '@/features/clients/components/users-columns'
import { Client, clientListSchema } from '@/features/clients/data/schema'
import { DndContext, DragOverlay } from '@dnd-kit/core'
import { useEffect, useState } from 'react'
import { useClientsTable } from '../contexts/ClientsContext'
import { useTemplatesContext } from '../contexts/TemplatesContext'

export default function ClientsBoard() {
  const { clients, getClients, isLoading } = useClients();
  const { getTemplates } = useTemplatesContext();
  const [clientsList, setClientsList] = useState<Client[]>([]);
  const [draggedTemplate, setDraggedTemplate] = useState<Template | null>(null);
  const { setOpen, setDialogTemplate, setCurrentRow } = useClientsTable();

  useEffect(() => { getClients(); }, []);
  useEffect(() => { getTemplates() }, []);

  useEffect(() => {
    if (clients.length === 0) return;
    try {
      console.log(clients);
      const parsed = clientListSchema.parse(clients);
      setClientsList(parsed);
    } catch (err) {
      setClientsList([]);
      console.log(err);
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
      setOpen('new-contract');
    }
  };

  return (

    <div>
      <LoadingOverlay isLoading={isLoading} />
      <div className='-mx-4 flex-1 overflow-auto py-1 lg:flex-row lg:space-x-12 lg:space-y-0'>
        <DndContext
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}>
          <Main>
            <ClientsTable data={clientsList} columns={columns} draggedTemplate={draggedTemplate} />
          </Main>
          <DragOverlay>
            {draggedTemplate ? (
              <DraggableTemplate template={draggedTemplate} />
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
}