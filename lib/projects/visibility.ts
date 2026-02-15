export const isCompanyExclusiveProject = (companyExclusiveUntil: Date | null) => {
  if (!companyExclusiveUntil) return false;
  return companyExclusiveUntil.getTime() > Date.now();
};
