import { FileSystemState } from './services/fileSystem';
import { Toolbar } from './components/Toolbar/Toolbar';
import { Explorer } from './components/Explorer/Explorer';
import { Editor } from './components/Editor/EditorWindow';

// Initialize State
const state = new FileSystemState();

// Initialize Components
document.addEventListener('DOMContentLoaded', () => {
  const toolbarContainer = document.getElementById('toolbar-container');
  const explorerContainer = document.getElementById('explorer-container');
  const editorContainer = document.getElementById('editor-container'); // Actually we manage wrapper around it

  if (toolbarContainer && explorerContainer && editorContainer) {
    new Toolbar(toolbarContainer, state);
    new Explorer(explorerContainer, state);
    new Editor(document.getElementById('editor-container')!, state); // Pass the parent
  }
});