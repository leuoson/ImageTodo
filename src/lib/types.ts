export interface Todo {
  id: string
  text: string
  completed: boolean
  createdAt: number
  // 图像相关字段
  hasImage?: boolean
  imagePath?: string
  imageProcessingMethod?: 'ocr' | 'ai'
  originalImageText?: string
  aiFailed?: boolean // AI处理失败标记
}

