import { Form } from 'antd';
import PropTypes from 'prop-types';
import CustomInput from '@components/form/CustomInput';
import { METHODS_WITHOUT_TXN_ID } from '@utils/constants';

// Optional payment reference (UPI ref / card RRN / Paytm txn id), used for statement
// reconciliation. Shown once a payment method other than cash is picked; must sit
// inside a Form that has a `payment_method` field.
function TransactionIdInput({ methodField = 'payment_method' }) {
  const form = Form.useFormInstance();
  const method = Form.useWatch(methodField, form);
  if (!method || METHODS_WITHOUT_TXN_ID.includes(method)) return null;

  return (
    <CustomInput
      name="transaction_id"
      label="Transaction ID"
      placeholder="UPI ref / card RRN / Paytm transaction ID (optional)"
      required={false}
    />
  );
}

TransactionIdInput.propTypes = {
  methodField: PropTypes.string,
};

export default TransactionIdInput;
