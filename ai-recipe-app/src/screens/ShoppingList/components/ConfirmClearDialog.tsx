import { AppDialog } from '@/components/ui/app-dialog';

export type ClearConfirmKind = 'all' | 'done' | null;

type Props = {
  kind: ClearConfirmKind;
  checkedCount: number;
  onClose: () => void;
  onConfirm: () => void;
};

/** Clear confirm — shared AppDialog styling. */
export function ConfirmClearDialog({ kind, checkedCount, onClose, onConfirm }: Props) {
  const isAll = kind === 'all';

  return (
    <AppDialog
      visible={kind !== null}
      title={isAll ? 'Clear all items?' : `Clear ${checkedCount} done?`}
      message={
        isAll
          ? 'This removes every item from your shopping list.'
          : 'Checked items will be removed from your list.'
      }
      cancelLabel="Cancel"
      confirmLabel={isAll ? 'Clear all' : 'Clear done'}
      tone="danger"
      onCancel={onClose}
      onConfirm={onConfirm}
    />
  );
}
