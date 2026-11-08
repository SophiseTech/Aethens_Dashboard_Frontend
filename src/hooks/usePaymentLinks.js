import { useEffect, useState } from 'react';
import { Form } from 'antd';
import { useStore } from 'zustand';
import paymentLinkStore from '@stores/PaymentLinkStore';

// Admin Payment Links page: list + add/edit modal + delete
function usePaymentLinks() {
  const { links, loading, saving, getLinks, saveLink, deleteLink } = useStore(paymentLinkStore);
  const [form] = Form.useForm();
  const [editing, setEditing] = useState(null); // null = closed, {} = add, record = edit

  useEffect(() => {
    getLinks();
  }, [getLinks]);

  const openAdd = () => {
    form.resetFields();
    setEditing({});
  };

  const openEdit = (record) => {
    form.setFieldsValue({ amount: record.amount, link: record.link });
    setEditing(record);
  };

  const close = () => setEditing(null);

  const submit = async (values) => {
    try {
      await saveLink(editing?._id, { amount: values.amount, link: values.link?.trim() });
      close();
    } catch {
      // Error already shown; keep the modal open so the admin can fix it
    }
  };

  const remove = async (record) => {
    try {
      await deleteLink(record._id);
    } catch {
      // Error already shown
    }
  };

  return {
    links,
    loading,
    saving,
    form,
    modalOpen: editing !== null,
    isEdit: Boolean(editing?._id),
    openAdd,
    openEdit,
    close,
    submit,
    remove,
  };
}

export default usePaymentLinks;
