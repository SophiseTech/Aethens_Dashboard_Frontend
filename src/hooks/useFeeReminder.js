import { useEffect, useMemo, useRef, useState } from 'react';
import { useStore } from 'zustand';
import dayjs from 'dayjs';
import debounce from 'lodash/debounce';
import feeStore from '@stores/FeeStore';
import useWhatsAppTemplateStore from '@stores/WhatsAppTemplateStore';
import useAlert from '@hooks/useAlert';
import { substituteTemplate } from '@utils/whatsappTemplate';

const FEE_REMINDER_TEMPLATE_NAME = 'fee_due_reminder';
const FEE_REMINDER_TEMPLATE_LANGUAGE = 'en';
const PREVIEW_DEBOUNCE_MS = 300;

// Drives the Fee Reminder dialog: renders a live preview of the approved
// "fee_due_reminder" WhatsApp template as the manager edits amount/due date,
// and sends the reminder. The template variables (month, date, amount, the
// center's UPI ID and payment link) come from the server's preview endpoint —
// the same builder the send uses — so the preview is exactly what goes out.
// The dialog is mounted only while open (one shared instance for the whole Fee
// KPIs card), so the template is looked up on open — once per session, shared via
// WhatsAppTemplateStore.ensureTemplate — never once per table row.
function useFeeReminder(row, amount, dueDate) {
  const sendFeeReminder = useStore(feeStore, (state) => state.sendFeeReminder);
  const previewFeeReminder = useStore(feeStore, (state) => state.previewFeeReminder);
  // undefined = still loading, null = no such template
  const template = useStore(
    useWhatsAppTemplateStore,
    (state) => state.templatesByKey[`${FEE_REMINDER_TEMPLATE_NAME}:${FEE_REMINDER_TEMPLATE_LANGUAGE}`]
  );
  const ensureTemplate = useStore(useWhatsAppTemplateStore, (state) => state.ensureTemplate);
  const alert = useAlert();
  const [sending, setSending] = useState(false);
  // null = not loaded yet; { variables, missing } or { error }
  const [preview, setPreview] = useState(null);
  const previewSeq = useRef(0);

  useEffect(() => {
    ensureTemplate(FEE_REMINDER_TEMPLATE_NAME, FEE_REMINDER_TEMPLATE_LANGUAGE);
  }, [ensureTemplate]);

  const loadPreview = useMemo(
    () =>
      debounce(async (payload) => {
        const seq = ++previewSeq.current;
        try {
          const result = await previewFeeReminder(payload);
          if (seq === previewSeq.current) setPreview(result);
        } catch (error) {
          if (seq === previewSeq.current) setPreview({ error: error.message || 'Could not build the message' });
        }
      }, PREVIEW_DEBOUNCE_MS),
    [previewFeeReminder]
  );

  useEffect(() => () => loadPreview.cancel(), [loadPreview]);

  const dueDateIso = dueDate ? dayjs(dueDate).toISOString() : null;
  useEffect(() => {
    if (!row?.studentId || !dueDateIso) {
      loadPreview.cancel();
      previewSeq.current += 1; // drop any response still in flight
      setPreview(null);
      return;
    }
    loadPreview({ studentId: row.studentId, amount: Number(amount) || 0, dueDate: dueDateIso });
  }, [row?.studentId, amount, dueDateIso, loadPreview]);

  const templateReady = Boolean(template?.approvalStatus === 'approved' && template?.active);
  const missingCenterFields = preview?.missing || [];

  const previewText = useMemo(() => {
    if (template === undefined) return 'Loading template…';
    if (!template) return `No approved "${FEE_REMINDER_TEMPLATE_NAME}" WhatsApp template found — create and get it approved first.`;
    if (!templateReady) return `The "${FEE_REMINDER_TEMPLATE_NAME}" template is not approved/active yet.`;
    if (!dueDateIso) return 'Pick a due date to see the message.';
    if (preview?.error) return preview.error;
    if (!preview) return 'Loading preview…';

    return substituteTemplate(template.bodyText || '', preview.variables);
  }, [template, templateReady, dueDateIso, preview]);

  const canSend = templateReady && Boolean(preview?.variables) && missingCenterFields.length === 0;

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

  return { previewText, canSend, missingCenterFields, sending, send };
}

export default useFeeReminder;
