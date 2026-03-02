/**
 * paginationHelper.js
 *
 * Frontend counterpart of the backend PaginationHelper.
 * Enforces consistent pagination limits before values are sent to the API,
 * providing a second layer of protection alongside the backend cap.
 *
 * Rules:
 *  - If limit is undefined, null, or 0    → returns DEFAULT_LIMIT (50)
 *  - If limit exceeds MAX_LIMIT            → clamps to MAX_LIMIT (100)
 *  - Otherwise returns the provided limit as a number
 */

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;

/**
 * Ensures a pagination limit is within safe bounds.
 * @param {number|string|null|undefined} limit - The requested limit
 * @param {number} [defaultLimit=50] - Override default (for tighter UI contexts)
 * @returns {number} A safe, bounded limit value
 */
export function safePaginationLimit(limit, defaultLimit = DEFAULT_LIMIT) {
    const parsed = Number(limit);
    if (!limit || isNaN(parsed) || parsed <= 0) return defaultLimit;
    return Math.min(parsed, MAX_LIMIT);
}
