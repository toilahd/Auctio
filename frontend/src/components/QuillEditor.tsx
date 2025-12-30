import { useEffect, useRef, forwardRef, useLayoutEffect } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';

interface QuillEditorProps {
  defaultValue?: string;
  onTextChange?: (html: string) => void;
  placeholder?: string;
  readOnly?: boolean;
}

const QuillEditor = forwardRef<Quill, QuillEditorProps>(
  ({ defaultValue, onTextChange, placeholder, readOnly }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const defaultValueRef = useRef(defaultValue);
    const onTextChangeRef = useRef(onTextChange);

    useLayoutEffect(() => {
      onTextChangeRef.current = onTextChange;
    });

    useEffect(() => {
      const container = containerRef.current;
      if (!container) return;

      const editorContainer = container.appendChild(
        container.ownerDocument.createElement('div')
      );

      const quill = new Quill(editorContainer, {
        theme: 'snow',
        modules: {
          toolbar: [
            ['bold', 'italic', 'underline', 'strike'],
            [{ list: 'ordered' }, { list: 'bullet' }],
            [{ align: [] }],
            ['link'],
            [{ color: [] }],
            ['clean'],
          ],
        },
        placeholder: placeholder || 'Enter description...',
        readOnly,
      });

      if (ref && typeof ref === 'object') {
        ref.current = quill;
      }

      if (defaultValueRef.current) {
        quill.root.innerHTML = defaultValueRef.current;
      }

      quill.on(Quill.events.TEXT_CHANGE, () => {
        onTextChangeRef.current?.(quill.root.innerHTML);
      });

      return () => {
        if (ref && typeof ref === 'object') {
          ref.current = null;
        }
        container.innerHTML = '';
      };
    }, [ref, placeholder, readOnly]);

    return <div ref={containerRef}></div>;
  }
);

QuillEditor.displayName = 'QuillEditor';

export default QuillEditor;
