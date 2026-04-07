import { useState, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationService } from "../services/notificationService";

type DeleteDialogState =
  | { open: false }
  | { open: true; mode: "all-read" }
  | { open: true; mode: "selected"; ids: number[] };

const CLOSED: DeleteDialogState = { open: false };

interface UseNotificationActionsOptions {
  onSuccess?: (deleted: number) => void;
}

/**
 * Centralizes selection state + mutation logic shared across all 3 notification pages.
 * Provides:
 *  - Selection mode toggle
 *  - Per-item toggle / select-all / clear
 *  - Confirmation dialog state
 *  - mark-all-read, delete-all-read, delete-selected mutations
 */
export function useNotificationActions(
  allIds: number[],
  options?: UseNotificationActionsOptions
) {
  const queryClient = useQueryClient();
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [dialogState, setDialogState] = useState<DeleteDialogState>(CLOSED);

  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["notifications", "feed"] });
    queryClient.invalidateQueries({ queryKey: ["user", "notifications"] });
  }, [queryClient]);

  // ── Mutations ────────────────────────────────────────────────────

  const markAllMutation = useMutation({
    mutationFn: () => notificationService.markAllRead(),
    onSuccess: invalidate,
  });

  const markReadMutation = useMutation({
    mutationFn: (id: number) => notificationService.markRead(id),
    onSuccess: invalidate,
  });

  const deleteAllReadMutation = useMutation({
    mutationFn: () => notificationService.deleteAllRead(),
    onSuccess: (result) => {
      invalidate();
      setDialogState(CLOSED);
      options?.onSuccess?.(result.deleted);
    },
  });

  const deleteByIdsMutation = useMutation({
    mutationFn: (ids: number[]) => notificationService.deleteByIds(ids),
    onSuccess: (result) => {
      invalidate();
      setDialogState(CLOSED);
      setSelectedIds(new Set());
      options?.onSuccess?.(result.deleted);
    },
  });

  // ── Selection helpers ────────────────────────────────────────────

  const toggleItem = useCallback((id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelectedIds(new Set(allIds));
  }, [allIds]);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const exitSelectionMode = useCallback(() => {
    setSelectionMode(false);
    setSelectedIds(new Set());
  }, []);

  const enterSelectionMode = useCallback(() => {
    setSelectionMode(true);
    setSelectedIds(new Set());
  }, []);

  // ── Dialog triggers ──────────────────────────────────────────────

  const openDeleteAllReadDialog = useCallback(() => {
    setDialogState({ open: true, mode: "all-read" });
  }, []);

  const openDeleteSelectedDialog = useCallback(() => {
    if (selectedIds.size === 0) return;
    setDialogState({ open: true, mode: "selected", ids: [...selectedIds] });
  }, [selectedIds]);

  const closeDialog = useCallback(() => setDialogState(CLOSED), []);

  const confirmDelete = useCallback(() => {
    if (!dialogState.open) return;
    if (dialogState.mode === "all-read") {
      deleteAllReadMutation.mutate();
    } else {
      deleteByIdsMutation.mutate(dialogState.ids);
    }
  }, [dialogState, deleteAllReadMutation, deleteByIdsMutation]);

  // ── Derived ──────────────────────────────────────────────────────

  const isAllSelected = allIds.length > 0 && selectedIds.size === allIds.length;
  const isSomeSelected = selectedIds.size > 0;
  const isDeletePending =
    deleteAllReadMutation.isPending || deleteByIdsMutation.isPending;

  return {
    // Selection state
    selectionMode,
    selectedIds,
    isAllSelected,
    isSomeSelected,
    // Selection actions
    enterSelectionMode,
    exitSelectionMode,
    toggleItem,
    selectAll,
    clearSelection,
    // Dialog state
    dialogState,
    closeDialog,
    confirmDelete,
    // Dialog triggers
    openDeleteAllReadDialog,
    openDeleteSelectedDialog,
    // Mutations
    markAllMutation,
    markReadMutation,
    isDeletePending,
  };
}
