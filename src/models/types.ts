export interface IFileItem {
  id: string
  name: string
  type: string
  size: number
  content: string | null
  description: string
  createdAt: number
}

export interface IFolderItem {
  id: string
  name: string
  folders: IFolderItem[]
  files: IFileItem[]
  loaded: boolean
}

export interface ISearchResult {
  type: 'folder' | 'file'
  item: IFileItem | IFolderItem
  path: string
}
