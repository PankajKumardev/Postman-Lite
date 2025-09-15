import { useState, useRef, type KeyboardEvent } from 'react'
import { Button } from './ui/button'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { Badge } from './ui/badge'
import { Eye, EyeOff, Braces, Check, AlertCircle } from 'lucide-react'

interface JsonEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  rows?: number
}

export function JsonEditor({ value, onChange, placeholder, rows = 12 }: JsonEditorProps) {
  const [showPreview, setShowPreview] = useState(false)
  const [isValidJson, setIsValidJson] = useState(true)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-formatting for common JSON patterns
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const { selectionStart, selectionEnd } = textarea
    const currentValue = textarea.value

    // Handle auto-closing brackets and braces
    if (e.key === '{') {
      e.preventDefault()
      const newValue = 
        currentValue.slice(0, selectionStart) + 
        '{}' + 
        currentValue.slice(selectionEnd)
      
      onChange(newValue)
      // Set cursor between braces
      setTimeout(() => {
        textarea.setSelectionRange(selectionStart + 1, selectionStart + 1)
      }, 0)
      return
    }

    if (e.key === '[') {
      e.preventDefault()
      const newValue = 
        currentValue.slice(0, selectionStart) + 
        '[]' + 
        currentValue.slice(selectionEnd)
      
      onChange(newValue)
      // Set cursor between brackets
      setTimeout(() => {
        textarea.setSelectionRange(selectionStart + 1, selectionStart + 1)
      }, 0)
      return
    }

    if (e.key === '"') {
      e.preventDefault()
      const newValue = 
        currentValue.slice(0, selectionStart) + 
        '""' + 
        currentValue.slice(selectionEnd)
      
      onChange(newValue)
      // Set cursor between quotes
      setTimeout(() => {
        textarea.setSelectionRange(selectionStart + 1, selectionStart + 1)
      }, 0)
      return
    }

    // Handle Enter for better formatting
    if (e.key === 'Enter') {
      const beforeCursor = currentValue.slice(0, selectionStart)
      const afterCursor = currentValue.slice(selectionStart)
      
      // Check if we're inside braces or brackets
      const lastChar = beforeCursor.trim().slice(-1)
      const nextChar = afterCursor.trim().slice(0, 1)
      
      if ((lastChar === '{' && nextChar === '}') || (lastChar === '[' && nextChar === ']')) {
        e.preventDefault()
        const indent = getIndentation(beforeCursor)
        const newValue = 
          beforeCursor + 
          '\n' + indent + '  ' + 
          '\n' + indent + 
          afterCursor
        
        onChange(newValue)
        // Set cursor at the indented position
        setTimeout(() => {
          textarea.setSelectionRange(selectionStart + indent.length + 3, selectionStart + indent.length + 3)
        }, 0)
        return
      }
    }

    // Handle Tab for indentation
    if (e.key === 'Tab') {
      e.preventDefault()
      const newValue = 
        currentValue.slice(0, selectionStart) + 
        '  ' + 
        currentValue.slice(selectionEnd)
      
      onChange(newValue)
      // Move cursor after the inserted spaces
      setTimeout(() => {
        textarea.setSelectionRange(selectionStart + 2, selectionStart + 2)
      }, 0)
    }
  }

  // Get current line indentation
  const getIndentation = (text: string): string => {
    const lines = text.split('\n')
    const lastLine = lines[lines.length - 1]
    const match = lastLine.match(/^(\s*)/)
    return match ? match[1] : ''
  }

  // Validate and handle value changes
  const handleChange = (newValue: string) => {
    onChange(newValue)
    
    // Validate JSON
    if (newValue.trim()) {
      try {
        JSON.parse(newValue)
        setIsValidJson(true)
      } catch {
        setIsValidJson(false)
      }
    } else {
      setIsValidJson(true)
    }
  }

  // Format JSON
  const formatJson = () => {
    try {
      const parsed = JSON.parse(value)
      const formatted = JSON.stringify(parsed, null, 2)
      onChange(formatted)
      setIsValidJson(true)
    } catch {
      // If parsing fails, do nothing
    }
  }

  // Minify JSON
  const minifyJson = () => {
    try {
      const parsed = JSON.parse(value)
      const minified = JSON.stringify(parsed)
      onChange(minified)
      setIsValidJson(true)
    } catch {
      // If parsing fails, do nothing
    }
  }

  const renderPreview = () => {
    if (!value.trim()) return null

    try {
      const parsed = JSON.parse(value)
      return (
        <div className="border rounded-md p-3 bg-muted/30 max-h-96 overflow-auto">
          <pre className="text-xs font-mono whitespace-pre-wrap text-foreground">
            {JSON.stringify(parsed, null, 2)}
          </pre>
        </div>
      )
    } catch {
      return (
        <div className="border rounded-md p-3 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400">
          <div className="flex items-center gap-2 text-sm">
            <AlertCircle className="h-4 w-4" />
            Invalid JSON syntax
          </div>
        </div>
      )
    }
  }

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Badge variant={isValidJson ? "default" : "destructive"} className="text-xs">
              {isValidJson ? (
                <><Check className="h-3 w-3 mr-1" />Valid JSON</>
              ) : (
                <><AlertCircle className="h-3 w-3 mr-1" />Invalid JSON</>
              )}
            </Badge>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            onClick={formatJson}
            variant="outline"
            size="sm"
            disabled={!value.trim() || !isValidJson}
            className="h-8 px-2 text-xs"
          >
            <Braces className="h-3 w-3 mr-1" />
            Format
          </Button>
          
          <Button
            onClick={minifyJson}
            variant="outline"
            size="sm"
            disabled={!value.trim() || !isValidJson}
            className="h-8 px-2 text-xs"
          >
            Minify
          </Button>
          
          <Button
            onClick={() => setShowPreview(!showPreview)}
            variant="outline"
            size="sm"
            className="h-8 px-2 text-xs"
          >
            {showPreview ? (
              <>
                <EyeOff className="h-3 w-3 mr-1" />
                Hide Preview
              </>
            ) : (
              <>
                <Eye className="h-3 w-3 mr-1" />
                Preview
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Editor */}
      <div className="relative">
        <div className="relative">
          <Label htmlFor="json-editor" className="sr-only">JSON Editor</Label>
          <Textarea
            id="json-editor"
            ref={textareaRef}
            value={value}
            onChange={e => handleChange(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={rows}
            className={`font-mono text-sm resize-none ${!isValidJson && value.trim() ? 'border-red-300 dark:border-red-700' : ''}`}
            placeholder={placeholder}
            spellCheck={false}
          />
        </div>
      </div>

      {/* Preview */}
      {showPreview && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">Preview</span>
          </div>
          {renderPreview()}
        </div>
      )}
    </div>
  )
}