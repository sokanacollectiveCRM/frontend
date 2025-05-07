import { deserializeHtml } from '@udecode/plate'
import { Document, Packer, Paragraph, TextRun } from 'docx'
import { saveAs } from 'file-saver'
import mammoth from 'mammoth'
import { Transforms } from 'slate'

// Load DOCX and insert into Plate
export async function handleDocxUpload(file: File, editor: any) {
  const arrayBuffer = await file.arrayBuffer()
  const result = await mammoth.convertToHtml({ arrayBuffer })

  const html = result.value;
  
  // Place the parsed html into a DOM element
  const div = document.createElement('div');
  div.innerHTML = html;

  const nodes = deserializeHtml(editor, { element: div })
  Transforms.insertNodes(editor, nodes, { at: [0] })
}

// Export content to DOCX
export async function saveDocx(editor: any) {
  const content = editor.children

  const sections = content.map((node: any) => {
    if (node.type === 'p' || node.type === 'paragraph') {
      const children = (node.children || []).map((child: any) =>
        new TextRun({ text: child.text || '', bold: child.bold || false })
      )
      return new Paragraph({ children })
    }
    return null
  }).filter(Boolean)

  const doc = new Document({
    sections: [{ children: sections }],
  })

  const blob = await Packer.toBlob(doc)
  saveAs(new File([blob], 'editor-document.docx'))
}