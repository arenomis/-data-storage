import { IFolderItem } from './types.js'
import { FileItem } from './FileItem.js'

let folderIdCounter = 1

export class FolderItem implements IFolderItem {
  id: string
  name: string
  folders: FolderItem[]
  files: FileItem[]
  loaded: boolean

  constructor(opts: { name?: string } = {}) {
    this.id = `folder_${folderIdCounter++}`
    this.name = opts.name ?? 'Новая папка'
    this.folders = []
    this.files = []
    this.loaded = false
  }

  // For persistence: allow setting the next id counter
  static setCounter(next: number) {
    folderIdCounter = next
  }
}
