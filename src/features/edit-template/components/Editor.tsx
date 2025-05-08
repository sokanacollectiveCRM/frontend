import { Button } from '@/common/components/ui/button';
import { useCreateEditor } from '@/components/editor/use-create-editor';
import { Editor, EditorContainer } from '@/components/plate-ui/editor';
import { Plate } from '@udecode/plate/react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { handleDocxUpload, saveDocx } from './Docx';


export default function PlateEditorDemo() {
  const editor = useCreateEditor();

  return (
    <>
      <input
        type="file"
        accept=".docx"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleDocxUpload(file, editor)
        }}
      />
      <DndProvider backend={HTML5Backend}>
        <Plate editor={editor}>
          <EditorContainer className='selection:bg-blue-200'>
            <Editor />
          </EditorContainer>

        </Plate>
      </DndProvider>
      <Button onClick={() => saveDocx(editor)}>
        Save
      </Button>
    </>
  )
}
