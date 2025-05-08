import { deserializeHtml } from '@udecode/plate';
import {
  BorderStyle,
  convertInchesToTwip,
  Document,
  HeadingLevel,
  IImageOptions,
  ImageRun,
  IParagraphOptions,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType
} from 'docx';
import { saveAs } from 'file-saver';
import mammoth from 'mammoth';
import { Transforms } from 'slate';

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
  const content = editor.children;
  const documentElements: (Paragraph | Table)[] = [];

  for (const node of content) {
    try {
      const element = await processNode(node);
      if (element) {
        if (Array.isArray(element)) {
          documentElements.push(...element);
        } else {
          documentElements.push(element);
        }
      }
    } catch (error) {
      console.error("Error processing node:", error);
      // Add fallback paragraph for error cases
      documentElements.push(new Paragraph({ 
        text: `[Error processing content: ${error}]` 
      }));
    }
  }

  const doc = new Document({
    sections: [{ children: documentElements }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(new File([blob], 'editor-document.docx'));
}

/**
 * Process a node and its children to convert to docx elements
 */
async function processNode(node: any): Promise<(Paragraph | Table | (Paragraph | Table)[]) | null> {
  if (!node) return null;

  // Check if it's an image
  if (node.children[0].type === "img") {
    return createImage(node);
  }

  // Handle different node types
  switch (node.type) {
    case 'p':
    case 'paragraph':
      return createParagraph(node);
      
    case 'h1':
      return createHeading(node, HeadingLevel.HEADING_1);
      
    case 'h2':
      return createHeading(node, HeadingLevel.HEADING_2);
      
    case 'h3':
      return createHeading(node, HeadingLevel.HEADING_3);
      
    case 'h4':
      return createHeading(node, HeadingLevel.HEADING_4);
      
    case 'h5':
      return createHeading(node, HeadingLevel.HEADING_5);
      
    case 'h6':
      return createHeading(node, HeadingLevel.HEADING_6);
      
    case 'blockquote':
      return createBlockquote(node);
      
    case 'ul':
      return createList(node, false);
      
    case 'ol':
      return createList(node, true);
      
    case 'li':
      return createListItem(node);
      
    case 'table':
      return createTable(node);
      
    default:
      // For unknown elements, process as paragraph
      if (node.children && Array.isArray(node.children)) {
        return createParagraph(node);
      }
      return null;
  }
}

/**
 * Create text runs from node children
 */
function createTextRuns(node: any): TextRun[] {
  if (!node.children) return [];
  
  const textRuns: TextRun[] = [];
  
  // Process children for text formatting
  for (const child of node.children) {
    if (typeof child === 'string') {
      // Plain string child
      textRuns.push(new TextRun({ text: child }));
      continue;
    }
    
    if (!child.text && (!child.children || child.children.length === 0)) {
      continue;
    }
    
    // Text with formatting
    const textOptions: any = {
      text: child.text || '',
      bold: child.bold || false,
      italics: child.italic || false,
      underline: child.underline || false,
      strike: child.strikethrough || false,
      superScript: child.superscript || false,
      subScript: child.subscript || false,
    };
    
    // Handle font family
    if (child.fontFamily) {
      textOptions.font = child.fontFamily;
    }
    
    // Handle font size (convert from em/px to points)
    if (child.fontSize) {
      // Simplified conversion (ideally would be more precise)
      if (typeof child.fontSize === 'string') {
        if (child.fontSize.includes('px')) {
          const pxSize = parseFloat(child.fontSize);
          textOptions.size = Math.round(pxSize * 0.75); // px to points
        } else if (child.fontSize.includes('em')) {
          const emSize = parseFloat(child.fontSize);
          textOptions.size = Math.round(emSize * 12); // em to points, assuming 1em = 12pt
        } else if (child.fontSize.includes('pt')) {
          textOptions.size = parseFloat(child.fontSize);
        } else {
          // Handle named sizes
          switch(child.fontSize) {
            case 'small': textOptions.size = 9; break;
            case 'medium': textOptions.size = 14; break;
            case 'large': textOptions.size = 18; break;
            case 'x-large': textOptions.size = 24; break;
            default: textOptions.size = 12; // Default size
          }
        }
      } else if (typeof child.fontSize === 'number') {
        textOptions.size = child.fontSize;
      }
    }
    
    // Handle text color
    if (child.color) {
      textOptions.color = child.color.replace('#', '');
    }
    
    // Handle background color/highlight
    if (child.backgroundColor) {
      textOptions.highlight = child.backgroundColor.replace('#', '');
    }
    
    // Create the text run
    textRuns.push(new TextRun(textOptions));
  }
  
  return textRuns;
}

/**
 * Create paragraph
 */
function createParagraph(node: any): Paragraph {
  const textRuns = createTextRuns(node);
  
  // Process alignment
  let alignment: IParagraphOptions['alignment'] = undefined;
  if (node.align) {
    switch (node.align) {
      case 'LEFT': alignment = 'left'; break;
      case 'center': alignment = 'center'; break;
      case 'right': alignment = 'right'; break;
      case 'justify': alignment = 'both'; break;
    }
  }
  
  const paragraphOptions: IParagraphOptions = {
    children: textRuns,
    alignment,
    spacing: {
      after: 200,
      line: 276,
      lineRule: 'auto',
    }
  };
  
  return new Paragraph(paragraphOptions);
}

/**
 * Create heading
 */
function createHeading(node: any, level: typeof HeadingLevel[keyof typeof HeadingLevel]): Paragraph {
  const textRuns = createTextRuns(node);
  
  const paragraphOptions: IParagraphOptions = {
    children: textRuns,
    heading: level,
  };
  
  return new Paragraph(paragraphOptions);
}

/**
 * Create blockquote
 */
function createBlockquote(node: any): Paragraph {
  const textRuns = createTextRuns(node);
  
  const paragraphOptions: IParagraphOptions = {
    children: textRuns,
    border: {
      left: {
        color: "888888",
        size: 4,
        style: BorderStyle.SINGLE,
      }
    },
    indent: { left: convertInchesToTwip(0.5) }
  };
  
  return new Paragraph(paragraphOptions);
}

/**
 * Create list
 */
function createList(node: any, isOrdered: boolean): Paragraph[] {
  if (!node.children) return [];
  const paragraphs: Paragraph[] = [];
  
  // Process each list item
  for (let i = 0; i < node.children.length; i++) {
    const listItem = node.children[i];
    if (listItem.type !== 'li') continue;
    
    // Get list item paragraphs
    const itemParagraphs = createListItem(listItem);
    if (!itemParagraphs || (Array.isArray(itemParagraphs) && itemParagraphs.length === 0)) continue;
    
    // Format first paragraph as list item
    if (Array.isArray(itemParagraphs) && itemParagraphs.length > 0) {
      const firstParagraph = itemParagraphs[0];
      const runs = (firstParagraph as any).options?.children || [];
      
      // Create a new paragraph with list formatting
      const listParagraphOptions: IParagraphOptions = {
        children: runs,
        ...(isOrdered 
          ? { numbering: { reference: "ordered-list", level: 0 } } 
          : { bullet: { level: 0 } })
      };
      
      paragraphs.push(new Paragraph(listParagraphOptions));
      
      // Add the rest of the paragraphs (if any) with indentation
      if (itemParagraphs.length > 1) {
        for (let j = 1; j < itemParagraphs.length; j++) {
          const paragraph = itemParagraphs[j];
          const nestedParagraphOptions: IParagraphOptions = {
            children: (paragraph as any).options?.children,
            indent: { left: convertInchesToTwip(0.5) }
          };
          paragraphs.push(new Paragraph(nestedParagraphOptions));
        }
      }
    } else if (!Array.isArray(itemParagraphs)) {
      // Single paragraph case
      const runs = (itemParagraphs as any).options?.children || [];
      const listParagraphOptions: IParagraphOptions = {
        children: runs,
        ...(isOrdered 
          ? { numbering: { reference: "ordered-list", level: 0 } } 
          : { bullet: { level: 0 } })
      };
      
      paragraphs.push(new Paragraph(listParagraphOptions));
    }
  }
  
  return paragraphs;
}

/**
 * Create list item
 */
function createListItem(node: any): Paragraph | Paragraph[] | null {
  if (!node.children) return null;
  
  const paragraphs: Paragraph[] = [];
  
  // Process each child in the list item
  for (const child of node.children) {
    const result = processNode(child);
    if (result) {
      if (Array.isArray(result)) {
        for (const item of result) {
          if (item instanceof Paragraph) {
            paragraphs.push(item);
          }
        }
      } else if (result instanceof Paragraph) {
        paragraphs.push(result);
      }
    }
  }
  
  // If no paragraphs, create one from the node's text
  if (paragraphs.length === 0) {
    const textRuns = createTextRuns(node);
    if (textRuns.length > 0) {
      paragraphs.push(new Paragraph({ children: textRuns }));
    }
  }
  
  return paragraphs.length === 1 ? paragraphs[0] : paragraphs.length > 1 ? paragraphs : null;
}

async function createImage(node: any): Promise<Paragraph> {
  const img = node.children[0]

  if (!img.url) {
    return new Paragraph({ children: [new TextRun("[Missing image URL]")] });
  }

  try {
    // Handle base64-encoded images
    let arrayBuffer: ArrayBuffer;
    let width = 200;
    let height = 200;

    if (img.url.startsWith('data:image')) {
      const response = await fetch(img.url);
      const blob = await response.blob();
      arrayBuffer = await blob.arrayBuffer();

      const { width: naturalWidth, height: naturalHeight } = await getImageDimensionsFromDataUrl(img.url);

      console.log("width: ", naturalWidth, "height: ", naturalHeight)
      width = naturalWidth;
      height = naturalHeight;
    } else {
      const response = await fetch(img.url);
      const blob = await response.blob();
      arrayBuffer = await blob.arrayBuffer();
      // Optional: could use a placeholder width/height or skip
    }

    const imageOptions = {
      data: arrayBuffer,
      transformation: {
        width,
        height,
      },
    } as IImageOptions;
    
    const imageRun = new ImageRun(imageOptions);

    return new Paragraph({
      children: [imageRun],
      alignment: 'center',
    });

  } catch (err) {
    console.error("Image load failed:", err);
    return new Paragraph({
      children: [new TextRun(`[Image failed to load]`)],
    });
  }
}

export async function getImageDimensionsFromDataUrl(dataUrl: string): Promise<{ width: number, height: number }> {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => {
      resolve({ width: image.width, height: image.height });
    };

    image.onerror = (e) => {
      reject(new Error('Failed to load image from data URL'));
    };

    image.src = dataUrl;
  });
}

/**
 * Create table
 */
function createTable(node: any): Table {
  if (!node.children || node.children.length === 0) {
    return new Table({
      rows: [
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ text: "[Empty table]" })]
            })
          ]
        })
      ],
      width: {
        size: 100,
        type: WidthType.PERCENTAGE,
      },
    });
  }
  
  const rows: TableRow[] = [];
  
  // Process table rows
  for (const rowNode of node.children) {
    if (rowNode.type !== 'tr' && rowNode.type !== 'tableRow') continue;
    
    const cells: TableCell[] = [];
    
    // Process cells in this row
    for (const cellNode of rowNode.children || []) {
      if (cellNode.type !== 'td' && cellNode.type !== 'th' && cellNode.type !== 'tableCell') continue;
      
      // Process cell content
      const cellParagraphs: Paragraph[] = [];
      
      // Process each content node in the cell
      for (const contentNode of cellNode.children || []) {
        const result = processNode(contentNode);
        if (result) {
          if (Array.isArray(result)) {
            for (const item of result) {
              if (item instanceof Paragraph) {
                cellParagraphs.push(item);
              } else if (item instanceof Table) {
                // Nested tables - wrap in paragraph
                cellParagraphs.push(new Paragraph({ 
                  text: "[Nested table - not supported]" 
                }));
              }
            }
          } else if (result instanceof Paragraph) {
            cellParagraphs.push(result);
          } else if (result instanceof Table) {
            // Nested tables - wrap in paragraph
            cellParagraphs.push(new Paragraph({ 
              text: "[Nested table - not supported]" 
            }));
          }
        }
      }
      
      // If no content, add empty paragraph
      if (cellParagraphs.length === 0) {
        cellParagraphs.push(new Paragraph({}));
      }
      
      // Create table cell
      cells.push(new TableCell({
        children: cellParagraphs,
        shading: cellNode.type === 'th' ? { color: "EEEEEE" } : undefined,
      }));
    }
    
    // Add row
    if (cells.length > 0) {
      rows.push(new TableRow({ children: cells }));
    }
  }
  
  // Create table
  if (rows.length === 0) {
    rows.push(new TableRow({
      children: [
        new TableCell({
          children: [new Paragraph({ text: "[Empty table]" })]
        })
      ]
    }));
  }
  
  return new Table({
    rows,
    width: {
      size: 100,
      type: WidthType.PERCENTAGE,
    },
  });
}