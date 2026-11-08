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

const toLinkAmount = (amount) => Math.round(Number(amount) || 0);
const formatAmount = (amount) => `₹${toLinkAmount(amount).toLocaleString('en-IN')}`;

// Drives the Fee Reminder dialog: renders a live preview of the approved
// "fee_due_reminder" WhatsApp template as the manager edits amount/due date/link,
// and sends the reminder. Variables (month, date, amount, center UPI ID, payment
// link) come from the server's preview endpoint — the same builder the send uses —
// so the preview is exactly what goes out.
// Payment link: filled from the amount → link mapping (admin Payment Links page)
// whenever the amount changes, unless the manager has typed their own link for the
// current amount. Blank means "use the mapping" on the server too.
// The dialog is mounted only while open (one shared instance for the whole Fee
// KPIs card), so the template is looked up on open — once per session, shared via
// WhatsAppTemplateStore.ensureTemplate — never once per table row.
function useFeeReminder(row, form, { amount, dueDate, paymentLink }) {
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
  // null = not loaded; { variables, mappedLink, problems, forAmount } or { error }
  const [preview, setPreview] = useState(null);
  const previewSeq = useRef(0);
  // True once the manager types a link for the current amount — stops auto-fill
  const linkEdited = useRef(false);

  useEffect(() => {
    ensureTemplate(FEE_REMINDER_TEMPLATE_NAME, FEE_REMINDER_TEMPLATE_LANGUAGE);
  }, [ensureTemplate]);

  const loadPreview = useMemo(
    () =>
      debounce(async (payload) => {
        const seq = ++previewSeq.current;
        try {
          const result = await previewFeeReminder(payload);
          if (seq === previewSeq.current) setPreview({ ...result, forAmount: toLinkAmount(payload.amount) });
        } catch (error) {
          if (seq === previewSeq.current) setPreview({ error: error.message || 'Could not build the message' });
        }
      }, PREVIEW_DEBOUNCE_MS),
    [previewFeeReminder]
  );

  useEffect(() => () => loadPreview.cancel(), [loadPreview]);

  const linkAmount = toLinkAmount(amount);
  const dueDateIso = dueDate ? dayjs(dueDate).toISOString() : null;
  const enteredLink = (paymentLink || '').trim();

  // A new amount means a new mapping — let auto-fill take over again
  useEffect(() => {
    linkEdited.current = false;
  }, [linkAmount]);

  useEffect(() => {
    if (!row?.studentId || !dueDateIso) {
      loadPreview.cancel();
      previewSeq.current += 1; // drop any response still in flight
      setPreview(null);
      return;
    }
    loadPreview({ studentId: row.studentId, amount: linkAmount, dueDate: dueDateIso, paymentLink: enteredLink || undefined });
  }, [row?.studentId, linkAmount, dueDateIso, enteredLink, loadPreview]);

  // Auto-fill the link field from the mapping for the current amount
  useEffect(() => {
    if (!preview || preview.error || preview.forAmount !== linkAmount || linkEdited.current) return;
    const mapped = preview.mappedLink || '';
    if ((form.getFieldValue('paymentLink') || '') !== mapped) form.setFieldValue('paymentLink', mapped);
  }, [preview, linkAmount, form]);

  const onLinkEdited = () => {
    linkEdited.current = true;
  };

  const mappingReady = preview && !preview.error && preview.forAmount === linkAmount;
  const linkHint = !mappingReady
    ? null
    : preview.mappedLink
      ? (enteredLink === preview.mappedLink
        ? `From the payment link set for ${formatAmount(linkAmount)}`
        : `Edited — the saved link for ${formatAmount(linkAmount)} is ${preview.mappedLink}`)
      : `No payment link saved for ${formatAmount(linkAmount)} — paste one to send`;

  const templateReady = Boolean(template?.approvalStatus === 'approved' && template?.active);
  const problems = preview?.problems || [];

  const previewText = useMemo(() => {
    if (template === undefined) return 'Loading template…';
    if (!template) return `No approved "${FEE_REMINDER_TEMPLATE_NAME}" WhatsApp template found — create and get it approved first.`;
    if (!templateReady) return `The "${FEE_REMINDER_TEMPLATE_NAME}" template is not approved/active yet.`;
    if (!dueDateIso) return 'Pick a due date to see the message.';
    if (preview?.error) return preview.error;
    if (!preview) return 'Loading preview…';

    return substituteTemplate(template.bodyText || '', preview.variables);
  }, [template, templateReady, dueDateIso, preview]);

  const canSend = templateReady && Boolean(mappingReady) && problems.length === 0;

  const send = async ({ amount: sendAmount, dueDate: sendDueDate, paymentLink: sendLink }) => {
    if (!row?.studentId || !sendDueDate) return false;
    setSending(true);
    try {
      await sendFeeReminder({
        studentId: row.studentId,
        amount: sendAmount,
        dueDate: dayjs(sendDueDate).toISOString(),
        paymentLink: (sendLink || '').trim() || undefined,
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

  return { previewText, canSend, problems, linkHint, onLinkEdited, sending, send };
}

export default useFeeReminder;
