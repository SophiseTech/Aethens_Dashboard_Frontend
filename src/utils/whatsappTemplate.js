// Substitutes {{1}}, {{2}}, ... placeholders in a WhatsApp template body with
// the given values, leaving any placeholder without a supplied value as-is.
export function substituteTemplate(bodyText, values) {
  return (bodyText || "").replace(/\{\{(\d+)\}\}/g, (match, index) => (
    values[index] !== undefined ? String(values[index]) : match
  ));
}

export const isSendableTemplate = (template) => template?.approvalStatus === "approved" && template?.active;
