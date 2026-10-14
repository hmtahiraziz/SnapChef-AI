import { StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { ScreenContainer } from '@/components/screen-container';
import { AppDialog } from '@/components/ui/app-dialog';

import { AddItemBar } from './components/AddItemBar';
import { ClearAllButton } from './components/ClearAllButton';
import { ConfirmClearDialog } from './components/ConfirmClearDialog';
import { EditItemModal } from './components/EditItemModal';
import { ShoppingEmptyState } from './components/EmptyState';
import { GroupChips } from './components/GroupChips';
import { GroupSection } from './components/GroupSection';
import { ItemMenuSheet } from './components/ItemMenuSheet';
import { LoadingSkeleton } from './components/LoadingSkeleton';
import { ProgressHeader } from './components/ProgressHeader';
import { ShoppingItemCard } from './components/ShoppingItemCard';
import { SLSpacing } from './theme';
import { useBreakpoint } from './useBreakpoint';
import { useShoppingListScreen } from './useShoppingListScreen';

/** Layout only — ScreenContainer keeps pinned header + tab inset. */
export default function ShoppingListScreen() {
  const bp = useBreakpoint();
  const {
    isLoading,
    totalCount,
    checkedCount,
    progress,
    draft,
    setDraft,
    sortMode,
    setSortMode,
    search,
    setSearch,
    showSearch,
    toggleSearch,
    editTarget,
    setEditTarget,
    menuTarget,
    setMenuTarget,
    clearConfirm,
    collapsedGroups,
    toggleGroup,
    groups,
    handleAdd,
    handleShare,
    handleCopy,
    copiedOpen,
    closeCopied,
    deleteTargetId,
    requestDelete,
    closeDeleteConfirm,
    confirmDelete,
    handleClearAll,
    handleClearChecked,
    closeClearConfirm,
    confirmClear,
    toggleItem,
    updateItem,
  } = useShoppingListScreen();

  const columnFlex = 1 / bp.columns;

  return (
    <GestureHandlerRootView style={styles.flex}>
      <ScreenContainer
        scroll
        gradient
        header={
          <ProgressHeader
            checkedCount={checkedCount}
            totalCount={totalCount}
            progress={progress}
            showSearch={showSearch}
            search={search}
            onSearchChange={setSearch}
            onToggleSearch={toggleSearch}
            onCopy={() => void handleCopy()}
            onShare={() => void handleShare()}
          />
        }>
        <View
          style={[
            styles.content,
            { maxWidth: bp.contentMaxWidth, alignSelf: 'center', width: '100%' },
          ]}>
          {bp.compactToolbar ? (
            <View style={styles.toolbarRow}>
              <AddItemBar
                value={draft}
                onChange={setDraft}
                onSubmit={() => void handleAdd()}
                style={styles.toolbarAdd}
              />
              {totalCount > 1 ? (
                <GroupChips value={sortMode} onChange={setSortMode} scrollable={false} />
              ) : null}
            </View>
          ) : (
            <>
              <AddItemBar value={draft} onChange={setDraft} onSubmit={() => void handleAdd()} />
              {totalCount > 1 ? (
                <GroupChips value={sortMode} onChange={setSortMode} scrollable />
              ) : null}
            </>
          )}

          {isLoading ? <LoadingSkeleton /> : null}
          {!isLoading && totalCount === 0 ? <ShoppingEmptyState /> : null}

          {!isLoading &&
            groups.map((group) => {
              const collapsed = collapsedGroups.has(group.key);
              return (
                <GroupSection
                  key={`${group.key}-${bp.columns}`}
                  title={group.title}
                  emoji={group.emoji}
                  color={group.color}
                  count={group.items.length}
                  collapsed={collapsed}
                  allChecked={group.items.every((i) => i.checked)}
                  onToggle={() => toggleGroup(group.key)}>
                  <View style={[styles.grid, bp.columns > 1 && styles.gridMulti]}>
                    {group.items.map((item) => (
                      <ShoppingItemCard
                        key={item.id}
                        item={item}
                        showSource={sortMode !== 'recipe'}
                        columnFlex={columnFlex}
                        onToggle={(id) => void toggleItem(id)}
                        onMenu={setMenuTarget}
                        onEdit={setEditTarget}
                        onDelete={requestDelete}
                      />
                    ))}
                  </View>
                </GroupSection>
              );
            })}

          {totalCount > 0 ? (
            <ClearAllButton
              checkedCount={checkedCount}
              onClearChecked={handleClearChecked}
              onClearAll={handleClearAll}
            />
          ) : null}
        </View>
      </ScreenContainer>

      <EditItemModal
        item={editTarget}
        visible={editTarget !== null}
        onClose={() => setEditTarget(null)}
        onSave={(qty, unit, name) => {
          if (editTarget) {
            void updateItem(editTarget.id, {
              name: name.trim(),
              quantity: qty.trim() || undefined,
              unit: unit.trim() || undefined,
            });
          }
          setEditTarget(null);
        }}
      />

      <ItemMenuSheet
        item={menuTarget}
        onClose={() => setMenuTarget(null)}
        onEdit={setEditTarget}
        onDelete={requestDelete}
      />

      <ConfirmClearDialog
        kind={clearConfirm}
        checkedCount={checkedCount}
        onClose={closeClearConfirm}
        onConfirm={confirmClear}
      />

      <AppDialog
        visible={copiedOpen}
        title="Copied!"
        message="Unchecked items copied to clipboard."
        confirmOnly
        confirmLabel="OK"
        onConfirm={closeCopied}
      />

      <AppDialog
        visible={deleteTargetId !== null}
        title="Delete item?"
        message="This removes the item from your shopping list."
        cancelLabel="Cancel"
        confirmLabel="Delete"
        tone="danger"
        onCancel={closeDeleteConfirm}
        onConfirm={confirmDelete}
      />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { gap: SLSpacing.md },
  toolbarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: SLSpacing.sm,
  },
  toolbarAdd: { flexGrow: 1, flexBasis: 280, minWidth: 200 },
  grid: { width: '100%', gap: SLSpacing.sm },
  gridMulti: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 0,
  },
});
