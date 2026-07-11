const EDITOR_UNLOCKED_KEY = "cwc_editor_unlocked";

export function isEditorUnlocked(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(EDITOR_UNLOCKED_KEY) === "1";
}

export function setEditorUnlocked(): void {
  if (typeof window !== "undefined") sessionStorage.setItem(EDITOR_UNLOCKED_KEY, "1");
}
