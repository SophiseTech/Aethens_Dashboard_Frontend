import PropTypes from 'prop-types';
import { Button } from 'antd';
import { CreditCardOutlined } from '@ant-design/icons';

function PayOnlineButton({ bill, onPay, loading = false }) {
  if (!bill || bill.status !== 'unpaid') return null;

  return (
    <Button
      type="primary"
      size="large"
      icon={<CreditCardOutlined />}
      loading={loading}
      onClick={() => onPay?.(bill._id)}
      className="!bg-emerald-600 hover:!bg-emerald-500 !text-white !font-semibold !rounded-full shadow-md hover:shadow-lg !min-h-[44px] !px-6 transition-all duration-200 flex items-center gap-2"
    >
      Pay Online {bill.total ? `₹${Number(bill.total).toLocaleString('en-IN')}` : ''}
    </Button>
  );
}

PayOnlineButton.propTypes = {
  bill: PropTypes.shape({
    _id: PropTypes.string,
    status: PropTypes.string,
    total: PropTypes.number,
  }),
  onPay: PropTypes.func,
  loading: PropTypes.bool,
};

export default PayOnlineButton;
