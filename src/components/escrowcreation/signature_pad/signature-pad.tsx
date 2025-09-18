import { useEffect, useRef, useState } from 'react'
import SignaturePad from 'signature_pad'
import { Button } from '@/components/ui/button'

interface SignaturePadProps {
  onSave: (signatureData: string) => void
  canvasId: string
}

export function SignaturePadComponent({ onSave, canvasId }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [signaturePad, setSignaturePad] = useState<SignaturePad | null>(null)
  const [isSigned, setIsSigned] = useState(false)

  useEffect(() => {
    if (canvasRef.current) {
      const pad = new SignaturePad(canvasRef.current, {
        backgroundColor: 'rgb(255, 255, 255)',
        penColor: 'rgb(0, 0, 0)',
      })
      setSignaturePad(pad)

      // Add event listener for drawing
      pad.addEventListener('endStroke', () => {
        setIsSigned(!pad.isEmpty())
      })

      // Handle window resize
      const handleResize = () => {
        const ratio = Math.max(window.devicePixelRatio || 1, 1)
        canvasRef.current!.width = canvasRef.current!.offsetWidth * ratio
        canvasRef.current!.height = canvasRef.current!.offsetHeight * ratio
        canvasRef.current!.getContext('2d')!.scale(ratio, ratio)
        pad.clear() // Clear the pad after resize
        setIsSigned(false)
      }

      window.addEventListener('resize', handleResize)
      handleResize() // Initial resize

      return () => {
        window.removeEventListener('resize', handleResize)
        pad.removeEventListener('endStroke', () => {})
      }
    }
  }, [])

  const handleClear = () => {
    if (signaturePad) {
      signaturePad.clear()
      setIsSigned(false)
    }
  }

  const handleSave = () => {
    if (signaturePad && !signaturePad.isEmpty()) {
      const signatureData = signaturePad.toDataURL()
      onSave(signatureData)
      setIsSigned(true)
    }
  }

  return (
    <div className="space-y-4">
      <canvas
        ref={canvasRef}
        id={canvasId}
        className="border border-zinc-200 rounded-md w-full h-48 bg-white"
      />
      <div className="flex gap-2">
        <Button
          type="button"
          variant="secondary"
          onClick={handleClear}
          className="flex-1"
        >
          Clear
        </Button>
        <Button
          type="button"
          onClick={handleSave}
          className="flex-1"
          disabled={!isSigned}
        >
          Save Signature
        </Button>
      </div>
    </div>
  )
} 