import { useEffect, useMemo, useState } from 'react';
import { useStore } from 'zustand';
import dayjs from 'dayjs';
import feeStore from '@stores/FeeStore';
import useWhatsAppTemplateStore from '@stores/WhatsAppTemplateStore';
import useAlert from '@hooks/useAlert';

const FEE_REMINDER_TEMPLATE_NAME = 'fee_due_reminder';
const FEE_REMINDER_TEMPLATE_LANGUAGE = 'en';

// Substitutes {{1}}, {{2}}, ... placeholders in a WhatsApp template body with
// the given values, leaving any placeholder without a supplied value as-is.
function substituteTemplate(bodyText, values) {
  return bodyText.replace(/\{\{(\d+)\}\}/g, (match, index) => (
    values[index] !== undefined ? String(values[index]) : match
  ));
}

// Drives the Fee Reminder dialog: renders a live preview of the approved
// "fee_due_reminder" WhatsApp template as the manager edits amount/due date,
// and sends the reminder (server re-does rounding/formatting as the source
// of truth — this preview is only so the manager can see what they're about
// to send).
function useFeeReminder(row, amount, dueDate) {
  const { sendFeeReminder } = useStore(feeStore);
  const { templates, fetch: fetchTemplates } = useStore(useWhatsAppTemplateStore);
  const alert = useAlert();
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!templates?.length) fetchTemplates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const template = useMemo(
    () => templates?.find(
      (t) => t.name === FEE_REMINDER_TEMPLATE_NAME && t.language === FEE_REMINDER_TEMPLATE_LANGUAGE
    ),
    [templates]
  );

  const templateReady = Boolean(template?.approvalStatus === 'approved' && template?.active);

  const previewText = useMemo(() => {
    if (!templates) return '';
    if (!template) return `No approved "${FEE_REMINDER_TEMPLATE_NAME}" WhatsApp template found — create and get it approved first.`;
    if (!templateReady) return `The "${FEE_REMINDER_TEMPLATE_NAME}" template is not approved/active yet.`;

    return substituteTemplate(template.bodyText || '', {
      1: row?.studentName || '',
      2: Math.round(amount || 0),
      3: dueDate ? dayjs(dueDate).format('DD MMM YYYY') : '',
    });
  }, [templates, template, templateReady, row?.studentName, amount, dueDate]);

  const send = async ({ amount: sendAmount, dueDate: sendDueDate }) => {
    if (!row?.studentId || !sendDueDate) return false;
    setSending(true);
    try {
      await sendFeeReminder({
        studentId: row.studentId,
        amount: sendAmount,
        dueDate: dayjs(sendDueDate).toISOString(),
      });
      alert.success('Reminder sent');
      return true;
    } catch (error) {
      alert.error(error.message || 'Failed to send reminder');
      return false;
    } finally {
      setSending(false);
    }
  };

  return { previewText, templateReady, sending, send };
}

export default useFeeReminder;
