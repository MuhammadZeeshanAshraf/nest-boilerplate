export function buildConditions(
  orConditions: string[],
  andConditions: string[],
) {
  const orClause =
    orConditions.length > 0 ? `(${orConditions.join(' OR ')})` : '';
  const andClause =
    andConditions.length > 0 ? `(${andConditions.join(' AND ')})` : '';
  const whereClause = [orClause, andClause].filter(Boolean).join(' AND ');
  return whereClause;
}
