import { Button } from '@/common/components/ui/button';
import { Editor, EditorContainer } from '@/common/components/ui/editor';
import {
  Plate
} from '@udecode/plate/react';
import { handleDocxUpload, saveDocx } from './Docx';
import { useCreateEditor } from './useCreateEditor';


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
      <Plate editor={editor}>
        <EditorContainer className='selection:bg-blue-200 border-solid border-1 '>
          <Editor placeholder="Type..." />
        </EditorContainer>
      </Plate>
      <Button onClick={() => saveDocx(editor)}>
        Save
      </Button>
    </>
  )
}
