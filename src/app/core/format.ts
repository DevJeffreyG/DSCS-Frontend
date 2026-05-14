export function formatTimestamp(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffSecs < 60) return `Hace ${diffSecs} segundo${diffSecs === 1 ? '' : 's'}`;
    if (diffMins < 60) return `Hace ${diffMins} minuto${diffMins === 1 ? '' : 's'}`;
    if (diffHours < 24) return `Hace ${diffHours} hora${diffHours === 1 ? '' : 's'}`;
    if (diffDays < 7) return `Hace ${diffDays} día${diffDays === 1 ? '' : 's'}`;

    return d.toLocaleDateString();
}