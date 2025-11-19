import { IFile, IFileExtension, IFolder } from './types';

export const MOCK_EXTENSIONS: IFileExtension[] = [
  { id: 1, type: 'cs', icon: 'code' },
  { id: 2, type: 'xaml', icon: 'layout' },
  { id: 3, type: 'txt', icon: 'file-text' },
  { id: 4, type: 'json', icon: 'braces' },
  { id: 5, type: 'js', icon: 'javascript' },
  { id: 6, type: 'config', icon: 'settings' }
];

export const INITIAL_FOLDERS: IFolder[] = [
  { id: 'project_1', name: 'Проект_1', parentId: null },
  { id: 'bin', name: 'bin', parentId: 'project_1' },
  { id: 'debug', name: 'Debug', parentId: 'bin' },
  { id: 'resources', name: 'Resources', parentId: 'project_1' },
];

export const INITIAL_FILES: IFile[] = [
  { 
    id: 'app-xaml', 
    name: 'App.xaml', 
    description: 'Файл определения приложения', 
    typeId: 2, 
    folderId: 'project_1', 
    content: '<Application x:Class="TestApp.App" />' 
  },
  { 
    id: 'mainwindow-xaml', 
    name: 'MainWindow.xaml', 
    description: 'Разметка главного окна', 
    typeId: 2, 
    folderId: 'project_1', 
    content: '<Window x:Class="TestApp.MainWindow">\n    <Grid>\n        <TextBlock Text="Hello" />\n    </Grid>\n</Window>' 
  },
  { 
    id: 'mainwindow-cs', 
    name: 'MainWindow.cs', 
    description: 'Логика главного окна', 
    typeId: 1, 
    folderId: 'project_1', 
    content: 'using System.Windows;\n\nnamespace TestApp {\n    public partial class MainWindow : Window {\n        public MainWindow() {\n            InitializeComponent();\n        }\n    }\n}' 
  },
  { 
    id: 'packages-config', 
    name: 'packages.config', 
    description: 'Конфигурация пакетов', 
    typeId: 6, 
    folderId: 'project_1', 
    content: '<?xml version="1.0" encoding="utf-8"?>\n<packages>\n</packages>' 
  },
];