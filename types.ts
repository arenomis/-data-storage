export enum EntityType {
  FOLDER = 'FOLDER',
  FILE = 'FILE'
}

export interface IFileExtension {
  id: number;
  type: string;
  icon: string;
}

export interface IFolder {
  id: string;
  name: string;
  parentId: string | null;
  description?: string;
}

export interface IFile {
  id: string;
  name: string;
  description: string;
  typeId: number; // References IFileExtension
  folderId: string;
  content: string;
}

export interface ISelectedItem {
  id: string;
  type: EntityType;
}

export type FileSystemItem = IFolder | IFile;

export interface IFileSystemState {
  folders: IFolder[];
  files: IFile[];
  extensions: IFileExtension[];
  selectedItem: ISelectedItem | null;
  expandedFolderIds: Set<string>;
}