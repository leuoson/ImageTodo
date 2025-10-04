import * as Dialog from "@radix-ui/react-dialog"
import { X, ZoomIn, ZoomOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { convertFileSrc } from '@tauri-apps/api/core'
import type { Locale } from "@/lib/i18n"
import type { Todo } from "@/lib/types"

interface ImageViewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  todo: Todo | null
  locale: Locale
}

export function ImageViewDialog({
  open,
  onOpenChange,
  todo,
}: ImageViewDialogProps) {
  const [zoom, setZoom] = useState(1)
  
  if (!todo || !todo.imagePath) return null
  
  // 转换文件路径为可访问的URL
  const imageUrl = convertFileSrc(todo.imagePath)
  
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-[90vw] h-[90vh] bg-card rounded-lg shadow-lg overflow-hidden flex flex-col">
          {/* 头部 */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border/50">
            <Dialog.Title className="text-lg font-semibold">
              {todo.text}
            </Dialog.Title>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground min-w-[4rem] text-center">
                {Math.round(zoom * 100)}%
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setZoom(Math.min(3, zoom + 0.25))}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Dialog.Close asChild>
                <Button variant="ghost" size="icon">
                  <X className="h-4 w-4" />
                </Button>
              </Dialog.Close>
            </div>
          </div>
          
          {/* 图像显示区域 */}
          <div className="flex-1 overflow-auto p-6">
            <div className="flex justify-center items-center min-h-full">
              <img
                src={imageUrl}
                alt={todo.text}
                style={{ transform: `scale(${zoom})` }}
                className="max-w-full h-auto transition-transform"
              />
            </div>
          </div>
          
          {/* 底部信息 */}
          <div className="px-6 py-4 border-t border-border/50 bg-muted/30">
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-muted-foreground">处理方式: </span>
                <span className="font-medium">
                  {todo.imageProcessingMethod === 'ai' ? 'AI智能总结' : '仅OCR识别'}
                </span>
              </div>
              {todo.originalImageText && (
                <div>
                  <span className="text-muted-foreground">提取的文本: </span>
                  <p className="mt-1 text-foreground whitespace-pre-wrap">{todo.originalImageText}</p>
                </div>
              )}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

