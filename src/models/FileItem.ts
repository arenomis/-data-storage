import { IFileItem } from './types.js'

let fileIdCounter = 1

export class FileItem implements IFileItem {
  id: string
  name: string
  type: string
  size: number
  content: string | null
  description: string
  createdAt: number

  constructor(opts: {
    name: string
    type?: string
    size?: number
    content?: string | null
    description?: string
  }) {
    this.id = `file_${fileIdCounter++}`
    this.name = opts.name
    this.type = opts.type ?? ''
    this.size = opts.size ?? 0
    this.content = opts.content ?? null
    this.description = opts.description ?? 'Нет описания'
    this.createdAt = Date.now()
  }

  // For persistence: allow setting the next id counter
  static setCounter(next: number) {
    fileIdCounter = next
  }
}
