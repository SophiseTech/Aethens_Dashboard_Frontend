import CustomDatePicker from "@components/form/CustomDatePicker";
import CustomForm from "@components/form/CustomForm";
import CustomInput from "@components/form/CustomInput";
import CustomSelect from "@components/form/CustomSelect";
import CustomSubmit from "@components/form/CustomSubmit";
import ItemsInputTable from "@pages/Bills/Components/ItemsInputTable";
import { sumFromObjects } from "@utils/helper";
import { Form, Modal, Table, Checkbox, Card, Divider, Tag, Space, Alert, Button } from "antd";
import { WalletOutlined, DollarOutlined, CheckCircleOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";
import { useStore } from "zustand";
import centersStore from "@stores/CentersStore";
import userStore from "@stores/UserStore";
import { ROLES } from "@utils/constants";
import logger from "@utils/logger";
import walletService from "@services/WalletService";
import billStore from "@stores/BillStore";

function GenerateBill({
  items = [],
  courses = [],
  customers = [],
  customersOptions = [],
  // invoiceNo,
  center_initial = '',
  onSave = async () => { },
  bill = null,
  handleCancel,
  isModalOpen,
  handleOk,
  onSearch,
  onCustomerSearch
}) {
  const [selectedItem, setSelectedItem] = useState({});
  const [totals, setTotals] = useState({});
  const [applyWallet, setApplyWallet] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [form] = Form.useForm();
  const selectedSubject = Form.useWatch("subject", form);
  const selectedFormCenter = Form.useWatch("centerId", form);
  const selectedCustomer = Form.useWatch("generated_for", form);
  const { centers, getCenters, setSelectedCenter, selectedCenter } = useStore(centersStore);
  const { user } = useStore(userStore);
  const [savingAsDraft, setSavingAsDraft] = useState(false);
  const isEditMode = Boolean(bill);
  const isEditDraft = isEditMode && bill?.status === 'draft';
  const isEditUnpaid = isEditMode && bill?.status === 'unpaid';
  const [selectedCustomerWallet, setSelectedCustomerWallet] = useState({})
  const { getInvoiceNo, invoiceNo } = billStore()

  // Format invoice number for display (e.g., "WFD1001")
  const formattedInvoiceNo = `${center_initial || bill?.center_initial || bill?.center_id?.center_initial || ''}${invoiceNo || bill?.invoiceNo || ''}`;

  const defaultInitialValues = useMemo(() => ({
    invoiceNo: invoiceNo || 0,
    items: [],
    generated_for: "",
    subject: "",
    generated_on: dayjs(),
    discountType: "percentage",
    centerId: selectedCenter
  }), [invoiceNo, selectedCenter]);

  const initialValues = useMemo(() => {
    if (!bill) return defaultInitialValues;
    return {
      invoiceNo: bill.invoiceNo || 0,
      items: bill.items?.map((item) => ({
        ...item,
        itemName: item.name,
        taxMode: item.taxMode || 'exclusive',
        discountType: item.discountType || 'percentage'
      })) || [],
      generated_for: bill.generated_for?._id || bill.generated_for || "",
      subject: bill.subject || "",
      generated_on: bill.generated_on ? dayjs(bill.generated_on) : dayjs(),
      discountType: bill.discountType || "percentage",
      centerId: bill.center_id || bill.centerId || selectedCenter
    }
  }, [bill, defaultInitialValues, selectedCenter]);
  const loading = false;

  const subjectOptions = [
    {
      label: "Materials",
      value: "materials",
    },
    {
      label: "Gallery",
      value: "gallery",
    },
    {
      label: "Courses",
      value: "course",
      disabled: true,
    },
  ];

  const getItemType = (selectedSubject) => {
    switch (selectedSubject) {
      case "materials":
        return "InventoryItem";
      case "gallery":
        return "InventoryItem";
      case "course":
        return "Course";
      default:
        break;
    }
  };

  useEffect(() => {

    const loadWallet = async () => {
      if (isEditMode) {
        const studentId =
          bill.generated_for?._id || bill.generated_for;

        const wallet = await walletService.getWalletByStudentId(studentId);

        setSelectedCustomerWallet(wallet);
      } else {
        const customerData = customersOptions.find((customer) => customer.value === selectedCustomer);
        setSelectedCustomerWallet(customerData?.data ?? null);
      }
    };

    loadWallet();
  }, [isEditMode, bill?.generated_for, selectedCustomer]);
  // useEffect(() => {
  //   getCenters();
  // }, []);

  useEffect(() => {
    if (isModalOpen) {
      user.role === ROLES.ADMIN || user.role === ROLES.OPERATIONS_MANAGER ? getInvoiceNo(selectedCenter) : getInvoiceNo();
    }
  }, [selectedCenter, isModalOpen])

  // useEffect(() => {
  //   if (selectedFormCenter && selectedFormCenter !== selectedCenter) setSelectedCenter(selectedFormCenter);
  // }, [selectedFormCenter])

  useEffect(() => {
    if (!isModalOpen) return;
    form.setFieldsValue(initialValues);

    if (bill?.items?.length) {
      const mappedSelected = {};
      bill.items.forEach((item, index) => {
        mappedSelected[index] = { ...item, _id: item.item || item._id };
      });
      setSelectedItem(mappedSelected);
      setTotals({
        undiscountedTotal: bill.undiscountedTotal,
        subtotal: bill.subtotal,
        total_tax: bill.total_tax,
        total: bill.total,
        total_discount: bill.total_discount
      });
      setApplyWallet(Boolean(bill.applyWallet));
    } else {
      setSelectedItem({});
      setTotals({});
      setApplyWallet(false);
      setPaymentAmount(0);
    }
  }, [isModalOpen, bill, initialValues]);

  const columns2 = [
    {
      dataIndex: "name",
      className: "font-bold text-start",
    },
    {
      dataIndex: "value",
      className: "text-end font-semibold",
      render: (value, record, index) => {
        if (record.name === "Final Total") {
          return <p className="text-lg font-bold text-green-600">₹{value?.toFixed(2)}</p>;
        }
        if (record.name === "Grand Total" && applyWallet && walletBalance > 0) {
          return <p className="text-lg font-bold line-through opacity-60 text-primary">₹{value?.toFixed(2)}</p>;
        }
        if (record.name === "Grand Total") {
          return <p className="text-lg font-bold text-primary">₹{value?.toFixed(2)}</p>;
        }
        if (record.name === "Amount Deducted (Wallet)") {
          return <p className="font-semibold text-orange-600">-₹{value?.toFixed(2)}</p>;
        }
        // if (record.name === "Wallet Balance") {
        //   return <p className="font-semibold text-blue-600">₹{value?.toFixed(2)}</p>;
        // }
        if (record.name === "Payment Amount") {
          return <p className="text-lg font-bold text-green-600">₹{value?.toFixed(2)}</p>;
        }
        if (record.name === "Wallet Credit") {
          return <p className="font-semibold text-purple-600">+₹{value?.toFixed(2)}</p>;
        }
        return `₹${value?.toFixed(2) || 0}`;
      },
    },
  ];

  const itemsOptionsBySubject = useMemo(() => {
    if (!selectedSubject) {
      return items?.map((item) => ({ label: item.name, value: item._id }));
    }
    return items
      ?.filter((item) => item.type === selectedSubject)
      ?.map((item) => ({ label: item.name, value: item._id }));
  }, [items, selectedSubject]);

  // const selectedCustomerWallet = useMemo(() => {
  //   if (!selectedCustomer) return null;
  //   return customersOptions.find((option) => option.value === selectedCustomer)?.data || null;
  // }, [selectedCustomer, customersOptions]);

  const walletBalance = selectedCustomerWallet?.balance || 0;
  const effectiveWalletBalance = isEditMode ? walletBalance + bill.walletAmountDeducted : walletBalance;
  const walletAmountDeducted = applyWallet && walletBalance > 0 ? Math.min(walletBalance, totals?.total || 0) : 0;
  const effectiveWalletAmountDeducted = applyWallet && effectiveWalletBalance > 0 ? Math.min(effectiveWalletBalance, totals?.total || 0) : 0;
  const finalGrandTotal = (totals?.total || 0) - effectiveWalletAmountDeducted;
  const excessPayment = Math.max(0, paymentAmount - finalGrandTotal);
  let walletCreditAmount = excessPayment;

  useEffect(() => {
    if (isEditMode) {
      setPaymentAmount(Number(applyWallet ? finalGrandTotal : bill?.paymentAmount));
    } else {
      setPaymentAmount(Number(applyWallet ? finalGrandTotal : totals?.total));
    }
  }, [finalGrandTotal, totals])

  // Submit function
  const onSubmit = async (values) => {
    values?.items?.forEach((item, index) => {
      item.item = selectedItem[index]?._id;
      item.name = selectedItem[index]?.name;
      item.item_type = getItemType(selectedSubject);
    });
    const shouldSaveAsDraft = isEditDraft || savingAsDraft;
    await onSave({
      ...values,
      ...totals,
      status: isEditDraft ? 'draft' : bill?.status,
      saveAsDraft: shouldSaveAsDraft,
      center_initial: bill?.center_initial || center_initial,  // Include center initial for storage
      walletBalance: walletBalance,
      applyWallet: applyWallet,
      walletAmountDeducted: effectiveWalletAmountDeducted,
      finalTotal: finalGrandTotal,
      paymentAmount: paymentAmount,
      walletCreditAmount: walletCreditAmount,
      newWalletBalance: walletBalance + walletCreditAmount - walletAmountDeducted,
      walletId: selectedCustomerWallet?._id
    });
    handleOk();
    setSavingAsDraft(false);
  };

  // logger.debug(walletBalance, walletAmountDeducted, bill, effectiveWalletAmountDeducted)
  return (
    <>
      <Modal
        title={isEditDraft ? "Edit Draft" : isEditMode ? "Edit Bill" : "Generate Bill"}
        open={isModalOpen}
        footer={null}
        onCancel={handleCancel}
        width={"90%"}
      >
        <CustomForm form={form} initialValues={initialValues} action={onSubmit}>
          <div className="flex gap-5">
            <CustomInput
              label={center_initial ? `Invoice Number (${formattedInvoiceNo})` : "Invoice Number"}
              name={"invoiceNo"}
              placeholder={"1001"}
              inputProps={{ readOnly: true }}
            />
            <CustomDatePicker
              label={"Invoice Date"}
              name={"generated_on"}
              className="w-full"
            />
          </div>
          <div className="flex gap-5">
            {/* <CustomInput label={"Subject"} name={"subject"} placeholder={"Materials"} /> */}
            <CustomSelect
              name={"generated_for"}
              options={customersOptions}
              label={"Select Customer"}
              placeholder="Customer"
              onSearch={onCustomerSearch}
            />
            <CustomSelect
              name={"subject"}
              options={subjectOptions}
              label={"Subject"}
              placeholder="Subject"
              disabled={user.role === ROLES.ADMIN && !selectedFormCenter}
            />
          </div>
          {/* <div className="w-1/2">
            {user.role === ROLES.ADMIN && (
              <CustomSelect
                label={"Center"}
                name={"centerId"}
                options={centerOptions}
              />
            )}
          </div> */}
          <ItemsInputTable
            form={form}
            items={items}
            itemsOptions={itemsOptionsBySubject}
            name={"items"}
            selectedItem={selectedItem}
            setSelectedItem={setSelectedItem}
            setTotals={setTotals}
            itemType={selectedSubject}
            onSearch={onSearch}
          />
          <div className="flex flex-row-reverse gap-6 items-start">
            <Table
              className="ml-auto w-fit"
              showHeader={false}
              columns={columns2}
              pagination={false}
              dataSource={[
                { name: "Gross Total", value: totals?.undiscountedTotal },
                { name: "Discount", value: totals?.total_discount },
                { name: "Subtotal", value: totals?.subtotal },
                { name: "Total Tax", value: totals?.total_tax },
                { name: "Grand Total", value: totals?.total },
                ...(effectiveWalletBalance > 0 ? [
                  // { name: "Wallet Balance", value: walletBalance },
                  ...(applyWallet ? [{ name: "Amount Deducted (Wallet)", value: effectiveWalletBalance }] : []),
                ] : []),
                ...(applyWallet && effectiveWalletBalance > 0 ? [{ name: "Final Total", value: finalGrandTotal }] : []),
                ...(paymentAmount > 0 ? [{ name: "Payment Amount", value: paymentAmount }] : []),
                ...(walletCreditAmount > 0 ? [{ name: "Wallet Credit", value: walletCreditAmount }] : []),
              ]}
            />

            {finalGrandTotal > 0 && (
              <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200" style={{ borderLeft: "4px solid #52c41a" }}>
                <Space direction="vertical" className="w-full" size="small">
                  <p className="text-sm text-gray-600">Payment Amount</p>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                    placeholder={`Enter amount (min: ₹${finalGrandTotal.toFixed(2)})`}
                    className="px-3 py-2 w-full text-base font-semibold bg-white rounded-md border border-gray-300 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                  />

                  {paymentAmount > 0 && (
                    <div className="space-y-2">
                      {paymentAmount < finalGrandTotal && (
                        <Alert
                          message={`Insufficient payment`}
                          description={`Amount due: ₹${(finalGrandTotal - paymentAmount).toFixed(2)}`}
                          type="error"
                          showIcon
                          style={{ fontSize: "12px" }}
                        />
                      )}
                      {paymentAmount === finalGrandTotal && (
                        <Alert
                          message="Exact payment"
                          type="success"
                          showIcon
                        />
                      )}
                      {paymentAmount > finalGrandTotal && (
                        <Alert
                          message={`Excess payment: ₹${walletCreditAmount.toFixed(2)}`}
                          description={`This amount will be credited to the wallet`}
                          type="warning"
                          showIcon
                          icon={<WalletOutlined />}
                          style={{ fontSize: "12px" }}
                        />
                      )}
                    </div>
                  )}
                </Space>
              </Card>
            )}

            {walletBalance >= 0 ? (
              <Card
                className="mt-6 bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200"
                style={{ borderLeft: "4px solid #1890ff" }}
              >
                <Space direction="vertical" className="w-full" size="middle">
                  <div className="flex flex-col justify-between">
                    <p className="mb-1 text-sm text-gray-600">Available Wallet Balance</p>
                    <div className="flex gap-2 items-center">
                      <WalletOutlined className="text-2xl text-blue-600" />
                      <p className="text-2xl font-bold text-blue-600">₹{walletBalance.toFixed(2)}</p>
                    </div>
                    {applyWallet && (
                      <Tag color="success" icon={<CheckCircleOutlined />}>
                        Applied
                      </Tag>
                    )}
                  </div>

                  <div>
                    {isEditMode && bill.applyWallet && bill.walletAmountDeducted > 0 && (
                      <p> Previous wallet deducted: {bill.walletAmountDeducted}</p>
                    )}
                  </div>

                  <Divider className="my-3" />

                  <Checkbox
                    checked={applyWallet}
                    onChange={(e) => setApplyWallet(e.target.checked)}
                    className="text-base"
                  >
                    <span className="font-medium">Use wallet balance to reduce bill amount</span>
                  </Checkbox>

                  {applyWallet && walletBalance > 0 && (
                    <Alert
                      message={`₹${walletBalance.toFixed(2)} will be deducted from wallet`}
                      description={`Your new total: ₹${finalGrandTotal.toFixed(2)} (Remaining wallet: ₹${(walletBalance - walletAmountDeducted).toFixed(2)})`}
                      type="success"
                      showIcon
                      icon={<DollarOutlined />}
                    />
                  )}

                  {walletBalance < (totals?.total || 0) && walletBalance > 0 && (
                    <p className="text-xs italic text-gray-500">
                      💡 Wallet balance is less than bill total. Remaining amount: ₹{((totals?.total || 0) - walletBalance).toFixed(2)}
                    </p>
                  )}
                </Space>
              </Card>
            ) : (
              <div className="p-4 mt-6 text-center text-gray-500 bg-gray-100 rounded-lg">
                <p className="text-sm">No wallet balance available for this customer</p>
              </div>
            )}
          </div>
          <div className="flex gap-3 justify-end mt-4">
            {isEditDraft ? (
              <Button
                type="primary"
                className="bg-primary"
                onClick={() => {
                  setSavingAsDraft(true);
                  form.submit();
                }}
                loading={loading}
              >
                Save Draft Changes
              </Button>
            ) : isEditUnpaid ? (
              <Button
                type="primary"
                className="bg-primary"
                onClick={() => {
                  setSavingAsDraft(false);
                  form.submit();
                }}
                loading={loading}
              >
                Save Unpaid Changes
              </Button>
            ) : (
              <>
                <Button
                  onClick={() => {
                    setSavingAsDraft(true);
                    form.submit();
                  }}
                  loading={loading}
                >
                  Save as Draft
                </Button>
                <Button
                  type="primary"
                  className="bg-primary"
                  onClick={() => {
                    setSavingAsDraft(false);
                    form.submit();
                  }}
                  loading={loading}
                >
                  Generate Invoice
                </Button>
              </>
            )}
          </div>
        </CustomForm>
      </Modal>
    </>
  );
}

export default GenerateBill;
