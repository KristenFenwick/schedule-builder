function normalizeDate(dateStr: string | undefined | null): string | null {
  // Guard against undefined/null/non-string
  if (!dateStr || typeof dateStr !== 'string') {
    return null;
  }
  // ... rest of function
}