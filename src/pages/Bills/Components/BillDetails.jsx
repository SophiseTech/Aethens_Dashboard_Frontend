
import Invoice from '@pages/Bills/Components/Invoice';
import RecordPaymentModal from '@pages/Bills/Components/RecordPaymentModal';
import userStore from '@stores/UserStore';
import permissions from '@utils/permissions';
import { Button, Popconfirm } from 'antd';
import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useStore } from 'zustand';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { downloadPdf, toISTStartOfDayISO } from '@utils/helper';
import { PDFDownloadLink, PDFViewer } from '@react-pdf/renderer';
import InvoicePdf from '@pages/Bills/Components/Invoice';
import InvoiceHtml from '@pages/Bills/Components/InvoiceHtml';
import { CheckSquareOutlined, DownloadOutlined, EditOutlined, RestOutlined } from '@ant-design/icons';
import billStore from '@stores/BillStore';
import inventoryService from '@/services/Inventory';
import courseService from '@/services/Course';
import studentStore from '@stores/StudentStore';
import { ROLES } from '@utils/constants';
import centersStore from '@stores/CentersStore';

const GenerateBill = lazy(() => import('@pages/Bills/Components/GenerateBill'));
const ModalLoader = () => (
  <div className='fixed inset-0 bg-black/40 z-50 flex items-center justify-center'>
    <div className='bg-white px-4 py-2 rounded-md shadow-md text-sm'>Loading…</div>
  </div>
);

function BillDetails() {
  const { bills, editBill, id, deleteBill, editMaterials } = useOutletContext();
  const [bill, setBill] = useState({});
  const { user } = useStore(userStore);
  const { students, getStudentsByCenter, total: studentTotal } = useStore(studentStore);
  const { selectedCenter } = useStore(centersStore);
  const nav = useNavigate();
  const invoiceRef = useRef(null);
  const { finalizeBill } = billStore();
  const [lineItems, setLineItems] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    if (bills && bills.length > 0) {
      setBill(bills.find(bill => bill._id === id) || {});
    }
  }, [bills, id]);

  const handleRecordPayment = async (values) => {
    if (id && bill) {
      editBill(id, { status: "paid", payment_date: values.payment_date, payment_method: values.payment_method });
      // Backend automatically deducts inventory when marking materials as collected
      editMaterials(bill._id, { status: "collected", collected_on: new Date() });
    }
  };

  const handleDeleteBill = async () => {
    if (id) {
      await deleteBill(id);
      nav('/manager/bills');
    }
  };

  const handleFinalize = async () => {
    if (id && bill) {
      await finalizeBill(id, { /* No immediate payment params here since standard finalize */ });
    }
  };

  const loadInitData = async ({ itemType, centerId }) => {
    const effectiveCenterId = centerId || (user.role === ROLES.MANAGER ? user?.center_id : selectedCenter);

    if (itemType === "materials" && effectiveCenterId) {
      const response = await inventoryService.getCenterInventoryItems(effectiveCenterId, 0, 200, { type: "materials" });
      if (response?.items) {
        const mappedItems = response.items.map(record => ({
          ...record.item_id,
          rate: record.rate,
          discount: record.discount,
          taxes: record.tax,
          quantity: record.quantity,
          type: record.type,
        }));
        setLineItems(mappedItems);
      }
    }
    if (itemType === "course") {
      const { courses } = await courseService.getCourses({}, 0, 0);
      setLineItems([...courses?.map(course => ({ name: course.course_name, _id: course._id, type: "course", rate: course.rate, discount: 0, taxes: 18 }))]);
    }
    if (itemType === "gallery" && effectiveCenterId) {
      const response = await inventoryService.getCenterInventoryItems(effectiveCenterId, 0, 200, { type: "gallery" });
      if (response?.items) {
        const mappedItems = response.items.map(record => ({
          ...record.item_id,
          rate: record.rate,
          discount: record.discount,
          taxes: record.tax,
          quantity: record.quantity,
          type: record.type,
        }));
        setLineItems(mappedItems);
      }
    }

    if (students.length === 0 || students.length < studentTotal) {
      await getStudentsByCenter(0);
    }
  };

  const handleSearch = async (value, itemType) => {
    const effectiveCenterId = user.role === ROLES.MANAGER ? user?.center_id : selectedCenter;
    if (!effectiveCenterId) return;

    if (itemType === "materials") {
      const response = await inventoryService.getCenterInventoryItems(
        effectiveCenterId,
        0,
        value === "" ? 200 : 0,
        { searchQuery: value, type: "materials" }
      );
      if (response?.items) {
        const mappedItems = response.items.map(record => ({
          ...record.item_id,
          rate: record.rate,
          discount: record.discount,
          taxes: record.tax,
          quantity: record.quantity,
          type: record.type,
        }));
        setLineItems(mappedItems);
      }
      return;
    }
    if (itemType === "gallery") {
      const response = await inventoryService.getCenterInventoryItems(
        effectiveCenterId,
        0,
        value === "" ? 200 : 0,
        { searchQuery: value, type: "gallery" }
      );
      if (response?.items) {
        const mappedItems = response.items.map(record => ({
          ...record.item_id,
          rate: record.rate,
          discount: record.discount,
          taxes: record.tax,
          quantity: record.quantity,
          type: record.type,
        }));
        setLineItems(mappedItems);
      }
    }
  };

  useEffect(() => {
    if (isEditModalOpen && bill?.subject) {
      loadInitData({ itemType: bill.subject, centerId: bill.center_id || bill.centerId });
    }
  }, [isEditModalOpen, bill]);

  useEffect(() => {
    if (!bill?.items?.length) return;
    setLineItems((prev) => {
      const existingIds = new Set(prev.map(item => item._id));
      const merged = [...prev];
      bill.items.forEach((item) => {
        const id = item.item || item._id || item.name;
        if (!existingIds.has(id)) {
          merged.push({ ...item, _id: id, type: bill.subject });
        }
      });
      return merged;
    });
  }, [bill]);

  const customersOptions = useMemo(() => {
    const base = students?.map(item => ({ label: item.username, value: item._id, data: item?.wallet })) || [];
    const currentId = bill?.generated_for?._id || bill?.generated_for;
    const hasCurrent = base.some(option => option.value === currentId);
    if (currentId && !hasCurrent) {
      return [{ label: bill?.generated_for?.username || "Current Customer", value: currentId, data: bill?.generated_for?.wallet }, ...base];
    }
    return base;
  }, [students, bill]);

  const handleEditDraftSave = async (values) => {
    if (!id) return;
    await editBill(id, {
      ...values,
      generated_on: toISTStartOfDayISO(values.generated_on),
      status: 'draft',
      saveAsDraft: true,
      invoiceNo: bill?.invoiceNo,
      center_initial: bill?.center_initial
    });
  };

  return (
    <div className='rounded-xl lg:flex-1 lg:h-full lg:overflow-auto bg-card flex flex-col'>
      <div className='border-b border-border flex justify-between | p-5 2xl:p-10'>
        <h1 className='font-bold | max-2xl:text-xl 2xl:text-2xl'>Preview</h1>
        <div className='flex gap-2'>
          {bill?.status === 'draft' && permissions.bills?.edit_draft?.includes(user.role) && (
            <Button
              className='rounded-full'
              color='default'
              icon={<EditOutlined />}
              variant='outlined'
              onClick={() => setIsEditModalOpen(true)}
            >
              Edit Draft
            </Button>
          )}
          {bill?.status === 'draft' && permissions.bills?.finalize?.includes(user.role) && (
            <Popconfirm
              title="Finalize Draft"
              description="Finalizing this will assign an invoice number and make it official. Proceed?"
              onConfirm={handleFinalize}
            >
              <Button
                className='rounded-full'
                color='primary'
                icon={<CheckSquareOutlined />}
                variant='solid'
                type='primary'
              >
                Finalize Draft
              </Button>
            </Popconfirm>
          )}
          {permissions.bills?.record_payment?.includes(user.role) && bill?.status !== 'draft' &&
            <RecordPaymentModal handleRecordPayment={handleRecordPayment} bill={bill} />
          }


          <PDFDownloadLink
            document={<InvoicePdf bill={bill} />}
            fileName={`INV-${bill?.invoiceNo ? `${bill?.center_initial || bill?.center_id?.center_initial || ''}${bill?.invoiceNo}` : 'Draft'}.pdf`}
          >
            {({ loading, url, error }) => (
              <Button
                className='rounded-full'
                color='blue'
                icon={<DownloadOutlined />}
                variant='outlined'
              >
                {loading ? 'Preparing PDF...' : 'Download'}
              </Button>
            )}
          </PDFDownloadLink>

          {permissions.bills?.delete?.includes(user.role) &&
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
        {/android/i.test(navigator.userAgent) ? (
          // Android Chrome cannot render blob: PDFs inside iframes — shows "Open in" instead.
          // Use a plain HTML preview for Android; PDFViewer works fine on iOS/iPad/desktop.
          <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'auto', minHeight: 600 }}>
            <InvoiceHtml bill={bill} />
          </div>
        ) : (
          <PDFViewer width="100%" height="1000">
            <InvoicePdf bill={bill} />
          </PDFViewer>
        )}
      </div>

      <Suspense fallback={isEditModalOpen ? <ModalLoader /> : null}>
        {isEditModalOpen && (
          <GenerateBill
            bill={bill}
            isModalOpen={isEditModalOpen}
            handleCancel={() => setIsEditModalOpen(false)}
            handleOk={() => setIsEditModalOpen(false)}
            loadInitData={loadInitData}
            items={lineItems}
            customersOptions={customersOptions}
            customers={students}
            onSave={handleEditDraftSave}
            invoiceNo={bill?.invoiceNo}
            center_initial={bill?.center_initial}
            onSearch={handleSearch}
          />
        )}
      </Suspense>
    </div>
  );
}

export default BillDetails;
