import React, { useState, useEffect } from 'react'

const Icons = {
  warning: <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  x: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round"/></svg>,
}

export default function DeleteConfirmModal({ isOpen, brandName, onConfirm, onCancel }) {
  const [confirmText, setConfirmText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState('')

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setConfirmText('')
      setIsDeleting(false)
      setError('')
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleConfirm = async () => {
    if (confirmText !== 'DELETE') {
      setError('Please type DELETE to confirm')
      return
    }

    setIsDeleting(true)
    setError('')
    
    try {
      await onConfirm()
    } catch (e) {
      console.error('Delete failed:', e)
      setError(e.message || 'Failed to delete brand. Please try again.')
      setIsDeleting(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && confirmText === 'DELETE') {
      handleConfirm()
    } else if (e.key === 'Escape') {
      onCancel()
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-[#0c0c0e] rounded-2xl border border-white/[0.08] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
          <h2 className="text-lg font-semibold text-white">Delete Brand</h2>
          <button 
            onClick={onCancel}
            disabled={isDeleting}
            className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/[0.05] transition disabled:opacity-50"
          >
            {Icons.x}
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Warning icon */}
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
              {Icons.warning}
            </div>
          </div>

          {/* Warning text */}
          <div className="text-center mb-6">
            <h3 className="text-[16px] font-medium text-white mb-2">
              Are you sure you want to delete "{brandName}"?
            </h3>
            <p className="text-[14px] text-white/50 leading-relaxed">
              This action <span className="text-red-400 font-medium">cannot be undone</span>. 
              All tracking data, test results, and settings associated with this brand will be permanently deleted.
            </p>
          </div>

          {/* Confirmation input */}
          <div className="mb-4">
            <label className="block text-[13px] text-white/60 mb-2">
              Type <span className="text-red-400 font-mono font-bold">DELETE</span> to confirm:
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
              onKeyDown={handleKeyDown}
              disabled={isDeleting}
              placeholder="DELETE"
              className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white text-[14px] placeholder-white/20 focus:outline-none focus:border-red-500/50 disabled:opacity-50 font-mono tracking-wider"
              autoFocus
            />
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-[13px]">
              {error}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              disabled={isDeleting}
              className="flex-1 px-4 py-3 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white/60 text-[14px] font-medium hover:bg-white/[0.08] transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={confirmText !== 'DELETE' || isDeleting}
              className={`flex-1 px-4 py-3 rounded-xl text-[14px] font-medium transition flex items-center justify-center gap-2 ${
                confirmText === 'DELETE' && !isDeleting
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'bg-red-500/20 text-red-400/50 cursor-not-allowed'
              }`}
            >
              {isDeleting ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  <span>Deleting...</span>
                </>
              ) : (
                'Delete Brand'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
