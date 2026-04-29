import { Brain } from 'lucide-react'

interface ImageWithFallbackProps {
  src: string | null
  alt: string
  imgClassName?: string
  fallbackIconSize?: string
  noImageText?: string
}

export default function ImageWithFallback({
  src,
  alt,
  imgClassName = 'h-full w-full object-cover',
  fallbackIconSize = 'size-8',
  noImageText,
}: ImageWithFallbackProps) {
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt={alt} className={imgClassName} />
    )
  }

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-primary/8 to-secondary">
      <Brain className={`${fallbackIconSize} text-primary/20`} />
      {noImageText && <p className="text-xs text-muted-foreground">{noImageText}</p>}
    </div>
  )
}
