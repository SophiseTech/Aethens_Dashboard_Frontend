import { DownloadOutlined, RestOutlined } from '@ant-design/icons';
import Invoice from '@pages/Bills/Components/Invoice';
import RecordPaymentModal from '@pages/Bills/Components/RecordPaymentModal';
import inventoryStore from '@stores/InventoryStore';
import userStore from '@stores/UserStore';
import permissions from '@utils/permissions';
import { Button, Popconfirm } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useStore } from 'zustand';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { downloadPdf } from '@utils/helper';

function BillDetails() {
  const { bills, editBill, id, deleteBill, editMaterials } = useOutletContext();
  const [bill, setBill] = useState({});
  const { user } = useStore(userStore);
  const nav = useNavigate();
  const { editItem } = useStore(inventoryStore);
  const invoiceRef = useRef(null);

  useEffect(() => {
    if (bills && bills.length > 0) {
      setBill(bills.find(bill => bill._id === id) || {});
    }
  }, [bills, id]);

  const handleRecordPayment = async (values) => {
    if (id && bill) {
      editBill(id, { status: "paid", payment_date: values.payment_date, payment_method: values.payment_method });
      editMaterials(bill._id, { status: "collected", collected_on: new Date() });
      await Promise.all(bill?.items?.map(async material => {
        await editItem(material.item?._id, {
          $inc: { quantity: -(material.qty) }
        });
      }));
    }
  };

  const handleDeleteBill = async () => {
    if (id) {
      await deleteBill(id);
      nav('/manager/bills');
    }
  };

  return (
    <div className='rounded-xl lg:flex-1 lg:h-full lg:overflow-auto bg-card flex flex-col'>
      <div className='border-b border-border flex justify-between | p-5 2xl:p-10'>
        <h1 className='font-bold | max-2xl:text-xl 2xl:text-2xl'>Preview</h1>
        <div className='flex gap-2'>
          {permissions.bills.record_payment.includes(user.role) &&
            <RecordPaymentModal handleRecordPayment={handleRecordPayment} />
          }

          <Button
            className='rounded-full'
            color='blue'
            icon={<DownloadOutlined />}
            variant='outlined'
            onClick={() => {
              downloadPdf(invoiceRef, `invoice_${bill?.invoiceNo}.pdf`)
            }}
          >
            Download
          </Button>

          {permissions.bills.delete.includes(user.role) &&
            <Popconfirm
              title="Delete Bill"
              description="Are you sure to delete this bill?"
              onConfirm={handleDeleteBill}
            >
              <Button
                className='rounded-full'
                color='red'
                icon={<RestOutlined />}
                variant='outlined'
              >
                Delete
              </Button>
            </Popconfirm>
          }
        </div>
      </div>
      <div className='lg:flex-1 lg:overflow-auto h-auto lg:h-full | p-5 lg:p-10'>
        <Invoice bill={bill} type={"materials"} downloadRef={invoiceRef} />
      </div>
    </div>
  );
}

export default BillDetails;