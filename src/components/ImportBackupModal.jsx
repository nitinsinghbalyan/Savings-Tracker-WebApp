import { useId, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { importBackup, parseBackup, summarizeBackup } from '../lib/backup'
import ModalShell from './ModalShell'

export default function ImportBackupModal({ open, onClose, onImported, hasExistingGoals }) {
  const titleId = useId()
  const fileInputRef = useRef(null)
  const [mode, setMode] = useState('merge')
  const [parsedBackup, setParsedBackup] = useState(null)
  const [parseError, setParseError] = useState(null)
  const [importError, setImportError] = useState(null)
  const [importing, setImporting] = useState(false)

  if (!open) return null

  const summary = parsedBackup ? summarizeBackup(parsedBackup) : null

  const resetSelection = () => {
    setParsedBackup(null)
    setParseError(null)
    setImportError(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleClose = () => {
    if (importing) return
    resetSelection()
    setMode('merge')
    onClose()
  }

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    setParseError(null)
    setImportError(null)

    try {
      const text = await file.text()
      setParsedBackup(parseBackup(text))
    } catch (err) {
      setParsedBackup(null)
      setParseError(err instanceof Error ? err.message : 'Could not read backup file')
    }
  }

  const handleImport = async () => {
    if (!parsedBackup) return

    setImporting(true)
    setImportError(null)

    try {
      const result = await importBackup(parsedBackup, { mode })
      onImported(result)
      handleClose()
    } catch (err) {
      setImportError(err instanceof Error ? err.message : 'Import failed')
    } finally {
      setImporting(false)
    }
  }

  return (
    <ModalShell open={open} onClose={handleClose} closeDisabled={importing}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        data-modal-panel
        className="modal-panel max-h-[min(92dvh,100dvh)] max-w-md rounded-t-2xl shadow-2xl lg:rounded-2xl"
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 sm:px-6">
          <h2 id={titleId} className="text-lg font-semibold text-slate-900">
            Import backup
          </h2>
          <button
            type="button"
            onClick={handleClose}
            disabled={importing}
            aria-label="Close"
            className="btn-icon"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div data-modal-scroll className="modal-scroll space-y-4 px-4 py-4 sm:px-6">
          <p className="text-sm text-slate-600">
            Choose a JSON backup exported from Savings Tracker. Imports goals and finance data to
            your account.
          </p>

          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json,.json"
              onChange={handleFileChange}
              disabled={importing}
              className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-brand-50 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-brand-700 hover:file:bg-brand-100"
            />
          </div>

          {parseError && (
            <p role="alert" className="alert-error">
              {parseError}
            </p>
          )}

          {summary && (
            <p className="rounded-xl bg-slate-50 px-3 py-2.5 text-sm text-slate-700">
              Found{' '}
              <span className="font-semibold">{summary.goalCount}</span> goals,{' '}
              <span className="font-semibold">{summary.contributionCount}</span> contributions
              {(summary.accountCount > 0 || summary.transactionCount > 0) && (
                <>
                  , <span className="font-semibold">{summary.accountCount}</span> accounts, and{' '}
                  <span className="font-semibold">{summary.transactionCount}</span> transactions
                </>
              )}
              .
            </p>
          )}

          {hasExistingGoals && (
            <fieldset className="space-y-2">
              <legend className="text-sm font-medium text-slate-700">Import mode</legend>
              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 px-3 py-2.5">
                <input
                  type="radio"
                  name="import-mode"
                  value="merge"
                  checked={mode === 'merge'}
                  onChange={() => setMode('merge')}
                  disabled={importing}
                  className="mt-1"
                />
                <span>
                  <span className="block text-sm font-medium text-slate-900">Merge</span>
                  <span className="block text-sm text-slate-500">
                    Keep existing goals and add imported ones.
                  </span>
                </span>
              </label>
              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-rose-200 bg-rose-50/50 px-3 py-2.5">
                <input
                  type="radio"
                  name="import-mode"
                  value="replace"
                  checked={mode === 'replace'}
                  onChange={() => setMode('replace')}
                  disabled={importing}
                  className="mt-1"
                />
                <span>
                  <span className="block text-sm font-medium text-slate-900">Replace all</span>
                  <span className="block text-sm text-slate-500">
                    Delete current goals, accounts, and transactions, then import.
                  </span>
                </span>
              </label>
            </fieldset>
          )}

          {importError && (
            <p role="alert" className="alert-error">
              {importError}
            </p>
          )}

          <div className="flex flex-col gap-3 safe-bottom sm:flex-row-reverse">
            <button
              type="button"
              onClick={handleImport}
              disabled={!parsedBackup || importing}
              className="btn-primary w-full sm:flex-1"
            >
              {importing ? 'Importing…' : 'Import'}
            </button>
            <button
              type="button"
              onClick={handleClose}
              disabled={importing}
              className="btn-secondary w-full sm:flex-1"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </ModalShell>
  )
}
