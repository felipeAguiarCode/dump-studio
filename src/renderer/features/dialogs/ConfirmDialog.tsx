import { useUiStore } from '../../stores/uiStore'
import { useT } from '@renderer/i18n'
import { Modal } from '../../components/ui/Modal'
import { Button } from '../../components/ui/Button'

export function ConfirmDialog(): JSX.Element | null {
  const t = useT()
  const confirm = useUiStore((s) => s.confirm)
  const close = useUiStore((s) => s.closeConfirm)
  if (!confirm) return null

  return (
    <Modal title={confirm.title ?? t('common.confirm')} onClose={close} width={360}>
      <p className="text-sm leading-relaxed text-noir-muted">{confirm.message}</p>
      <div className="mt-6 flex justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={close}>
          {t('common.cancel')}
        </Button>
        <Button
          variant={confirm.danger ? 'danger' : 'primary'}
          size="sm"
          onClick={() => {
            confirm.onConfirm()
            close()
          }}
        >
          {confirm.confirmLabel ?? t('common.confirm')}
        </Button>
      </div>
    </Modal>
  )
}
