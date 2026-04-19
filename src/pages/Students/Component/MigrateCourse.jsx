/* eslint-disable react-hooks/exhaustive-deps */
import {
  Modal,
  Button,
  Select,
  Typography,
  Space,
  Flex,
  Card,
  message,
  Checkbox,
  Radio,
  InputNumber,
  DatePicker,
  Alert,
  Divider,
  Spin,
} from 'antd';
import { useEffect, useState } from 'react';
import courseService from '@/services/Course';
import studentService from '@/services/Student';
import { FeeService } from '@/services/Fee';
import { isUserActive, calculateAge, formatDate } from '@utils/helper';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const PAYMENT_TYPES = [
  { label: 'Single (Full)', value: 'single' },
  { label: 'Partial', value: 'partial' },
  { label: 'Monthly', value: 'monthly' },
];

function MigrateCourse({ student }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedCourseData, setSelectedCourseData] = useState(null);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [prevCourses, setPrevCourses] = useState(new Map());

  // Pending fees state
  const [pendingFees, setPendingFees] = useState(null);
  const [loadingFees, setLoadingFees] = useState(false);

  /**
   * generateFeeAccount:
   *   true  → Path A: close old, credit wallet, create new fee account with fresh payment details
   *   false → Path B: close old, mark old bills migration_closed, copy fee account to new course
   */
  const [generateFeeAccount, setGenerateFeeAccount] = useState(true);
  const [paymentType, setPaymentType] = useState('single');
  const [courseFee, setCourseFee] = useState(null);
  const [regFee, setRegFee] = useState(3500);
  const [paidAmountPartial, setPaidAmountPartial] = useState(null);
  const [numberOfInstallments, setNumberOfInstallments] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [isCourseCompleted, setIsCourseCompleted] = useState(false);

  useEffect(() => {
    if (!isModalOpen) return;

    const fetchData = async () => {
      try {
        setLoadingCourses(true);
        setLoadingFees(true);

        const [res, prevCoursesResponse, feesResponse] = await Promise.all([
          courseService.getCourses({}, 0, 0),
          studentService.getCourseHistory(0, 10, { query: { user_id: student?._id } }),
          FeeService.getFeeDetailsByStudent(student?._id),
        ]);

        const prevCoursesMap = new Map(
          (prevCoursesResponse?.courseHistories || []).map((c) => [c.course_id, c])
        );
        setPrevCourses(prevCoursesMap);

        const availableCourses =
          res?.courses?.filter(
            (c) => c._id !== (student?.details_id?.course_id?._id || student?.details_id?.course_id)
          ) || [];
        setCourses(availableCourses);

        const feeData = feesResponse?.data;
        setPendingFees(feeData?.summary || null);
      } catch (err) {
        console.error(err);
        message.error('Failed to load data');
      } finally {
        setLoadingCourses(false);
        setLoadingFees(false);
      }
    };

    fetchData();
  }, [isModalOpen, student._id]);

  const handleCancel = () => {
    setIsModalOpen(false);
    setSelectedCourse(null);
    setSelectedCourseData(null);
    setGenerateFeeAccount(true);
    setPaymentType('single');
    setCourseFee(null);
    setRegFee(3500);
    setPaidAmountPartial(null);
    setNumberOfInstallments(null);
    setStartDate(null);
    setPendingFees(null);
    setIsCourseCompleted(false);
  };

  const handleCourseChange = (value) => {
    setSelectedCourse(value);
    const course = courses.find((c) => c._id === value);
    setSelectedCourseData(course || null);
    setCourseFee(course?.rate || null);
  };

  const buildFeeAccountData = () => {
    if (!generateFeeAccount || !selectedCourse) return null;

    const base = {
      student_id: student.details_id?._id,
      user_id: student._id,
      course_id: selectedCourse,
      center_id: student.details_id?.center_id || student.center_id,
      type: paymentType,
      total_course_fee: courseFee ?? selectedCourseData?.rate ?? 0,
      reg_fee: regFee,
      isCourseCompleted,
    };

    if (paymentType === 'partial') return { ...base, paidAmount: paidAmountPartial || 0 };
    if (paymentType === 'monthly') {
      return {
        ...base,
        numberOfInstallments,
        start_date: startDate ? startDate.toISOString() : new Date().toISOString(),
      };
    }
    return base;
  };

  const isFeeFormValid = () => {
    if (!generateFeeAccount) return true; // copy path needs no extra fields
    if (paymentType === 'monthly' && (!numberOfInstallments || !startDate)) return false;
    return true;
  };

  const handleMigration = () => {
    if (!selectedCourse) {
      message.warning('Please select a new course');
      return;
    }
    if (!isFeeFormValid()) {
      message.warning('Please fill in all fee account fields');
      return;
    }

    const hasPaid = pendingFees?.amountPaid > 0;
    const walletLine = generateFeeAccount && !isCourseCompleted
      ? `\n\n₹${pendingFees.amountPaid.toLocaleString()} will be credited to the student's wallet.`
      : '';
    const copyLine = !generateFeeAccount
      ? '\n\nThe existing fee structure will be copied to the new course — old bills will be marked as closed.'
      : '';

    Modal.confirm({
      title: 'Confirm Course Migration',
      content: `This will migrate the student to the selected course. Existing slots will be updated.${walletLine}${copyLine}`,
      okText: 'Migrate Course',
      cancelText: 'Cancel',
      okType: 'primary',
      onOk: async () => {
        try {
          setProcessing(true);
          await studentService.migrateStudentCourse(
            student._id,
            student?.details_id?._id,
            selectedCourse,
            true,
            {
              generateFeeAccount,
              feeAccountData: buildFeeAccountData(),
            }
          );
          message.success('Course migrated successfully');
          handleCancel();
        } catch (error) {
          console.error(error);
          message.error('Failed to migrate course');
        } finally {
          setProcessing(false);
        }
      },
    });
  };

  const hasPendingBalance = pendingFees?.balance > 10;
  const fullyPaid = pendingFees && pendingFees.amountPaid > 0 && pendingFees.balance <= 10;

  return (
    <>
      <Button onClick={() => setIsModalOpen(true)} disabled={!isUserActive(student)} variant='filled' color='purple'>
        Migrate Course
      </Button>

      <Modal
        title={<Title level={4}>Migrate Course</Title>}
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
        destroyOnClose
        width={620}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>

          {/* Student Info */}
          <Card size="small">
            <Space direction="vertical" size="small">
              <div><Text strong>Student: </Text><Text>{student.username}</Text></div>
              <div><Text strong>Age: </Text><Text>{calculateAge(student?.DOB) ?? 'N/A'} years</Text></div>
              <div><Text strong>Current Course: </Text><Text>{student.details_id?.course?.course_name || 'N/A'}</Text></div>
              <div><Text strong>Joined: </Text><Text>{formatDate(student?.details_id?.enrollment_date) || 'N/A'}</Text></div>
            </Space>
          </Card>

          {/* Pending Fees */}
          {loadingFees ? (
            <Flex justify="center"><Spin size="small" /></Flex>
          ) : hasPendingBalance ? (
            <Alert
              type="warning"
              showIcon
              message="Pending Fees on Current Course"
              description={
                <Space direction="vertical" size={2}>
                  <Text>Total: <Text strong>₹{pendingFees.totalFees?.toLocaleString()}</Text></Text>
                  <Text>Paid: <Text strong>₹{pendingFees.amountPaid?.toLocaleString()}</Text></Text>
                  <Text type="danger">Balance: <Text strong type="danger">₹{pendingFees.balance?.toLocaleString()}</Text></Text>
                </Space>
              }
            />
          ) : fullyPaid && !isCourseCompleted ? (
            <Alert
              type="success"
              showIcon
              message="All fees cleared on current course"
              description={
                <Text>
                  Paid amount (₹{pendingFees.amountPaid?.toLocaleString()}) will be credited to the student&apos;s wallet if you choose to create a new fee account (unless marked as Course Completed).
                </Text>
              }
            />
          ) : null}

          {/* Course Selection */}
          <div>
            <Text strong style={{ display: 'block', marginBottom: 6 }}>Select New Course</Text>
            <Select
              style={{ width: '100%' }}
              placeholder="Select New Course"
              value={selectedCourse}
              onChange={handleCourseChange}
              loading={loadingCourses}
              options={courses.map((course) => ({
                label: course.course_name,
                value: course._id,
                disabled: !!prevCourses.get(course._id),
              }))}
            />
          </div>

          <Divider style={{ margin: '4px 0' }} />

          {/* Fee Account Checkbox */}
          <div>
            {/* <Checkbox
              checked={!generateFeeAccount}
              onChange={(e) => setGenerateFeeAccount(!e.target.checked)}
            >
              <Text strong>Use old fee structure</Text>
            </Checkbox>
            <div style={{ marginTop: 4, paddingLeft: 24 }}>
              {!generateFeeAccount ? (
                <Text type="secondary" style={{ fontSize: 12 }}>
                  New fee account will follow same bill and fee status. New course fee same as old course fee.
                </Text>
              ) : (
                <Text type="secondary" style={{ fontSize: 12 }}>
                  New fee account and refund of all paid bills to wallet.
                </Text>
              )}
            </div> */}

            {/* Course Completed Checkbox (Only if fully paid & creating new fee account) */}
            <div style={{ marginTop: 12 }}>
              <Checkbox
                checked={isCourseCompleted}
                onChange={(e) => setIsCourseCompleted(e.target.checked)}
              >
                <Text strong>Course Completed</Text>
              </Checkbox>
              <div style={{ paddingLeft: 24, marginTop: 4 }}>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Only for upgradation, the previously paid fees (₹{pendingFees?.amountPaid?.toLocaleString()}) will <Text strong type="danger">NOT</Text> be refunded to the wallet.
                </Text>
              </div>
            </div>
          </div>


          {/* New fee account fields (Path A only) */}
          {generateFeeAccount && (
            <Card size="small" title="New Fee Account Details">
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>

                {/* Payment Type */}
                <div>
                  <Text strong style={{ display: 'block', marginBottom: 6 }}>Payment Type</Text>
                  <Radio.Group
                    value={paymentType}
                    onChange={(e) => setPaymentType(e.target.value)}
                    options={PAYMENT_TYPES}
                    optionType="button"
                    buttonStyle="solid"
                  />
                </div>

                {/* Registration Fee */}
                <div>
                  <Text strong style={{ display: 'block', marginBottom: 6 }}>Registration Fee</Text>
                  <InputNumber
                    style={{ width: '100%' }}
                    placeholder="Registration fee"
                    value={regFee}
                    onChange={(val) => setRegFee(val)}
                    min={0}
                    prefix="₹"
                    formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(v) => v.replace(/₦\s?|(,*)/g, '')}
                  />
                </div>

                {/* Course Fee */}
                <div>
                  <Text strong style={{ display: 'block', marginBottom: 6 }}>Course Fee</Text>
                  <InputNumber
                    style={{ width: '100%' }}
                    placeholder="Course fee"
                    value={courseFee}
                    onChange={(val) => setCourseFee(val)}
                    min={0}
                    prefix="₹"
                    formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(v) => v.replace(/₹\s?|(,*)/g, '')}
                  />
                </div>

                {/* Partial — upfront paid amount */}
                {paymentType === 'partial' && (
                  <div>
                    <Text strong style={{ display: 'block', marginBottom: 6 }}>Initial Paid Amount</Text>
                    <InputNumber
                      style={{ width: '100%' }}
                      placeholder="Amount paid upfront"
                      value={paidAmountPartial}
                      onChange={(val) => setPaidAmountPartial(val)}
                      min={0}
                      max={courseFee ?? selectedCourseData?.rate ?? undefined}
                      prefix="₹"
                      formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={(v) => v.replace(/₦\s?|(,*)/g, '')}
                    />
                  </div>
                )}

                {/* Monthly — installments + start date */}
                {paymentType === 'monthly' && (
                  <>
                    <div>
                      <Text strong style={{ display: 'block', marginBottom: 6 }}>Number of Installments</Text>
                      <InputNumber
                        style={{ width: '100%' }}
                        placeholder="e.g. 6"
                        value={numberOfInstallments}
                        onChange={(val) => setNumberOfInstallments(val)}
                        min={1}
                        max={60}
                      />
                    </div>
                    <div>
                      <Text strong style={{ display: 'block', marginBottom: 6 }}>Start Date</Text>
                      <DatePicker
                        style={{ width: '100%' }}
                        placeholder="Select start date"
                        value={startDate ? dayjs(startDate) : null}
                        onChange={(date) => setStartDate(date ? date.toDate() : null)}
                      // disabledDate={(current) => current && current < dayjs().startOf('day')}
                      />
                    </div>
                  </>
                )}
              </Space>
            </Card>
          )}

          {/* Actions */}
          <Flex justify="end" gap={10} wrap="wrap">
            <Button onClick={handleCancel}>Cancel</Button>
            <Button
              type="primary"
              onClick={handleMigration}
              loading={processing}
              disabled={!selectedCourse || processing}
            >
              Migrate Course
            </Button>
          </Flex>
        </Space>
      </Modal>
    </>
  );
}

MigrateCourse.propTypes = {
  student: PropTypes.shape({
    _id: PropTypes.string,
    username: PropTypes.string,
    course_id: PropTypes.string,
    center_id: PropTypes.string,
    DOB: PropTypes.string,
    details_id: PropTypes.shape({
      _id: PropTypes.string,
      center_id: PropTypes.string,
      course_id: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.shape({ _id: PropTypes.string }),
      ]),
      course: PropTypes.shape({ course_name: PropTypes.string }),
      enrollment_date: PropTypes.string,
    }),
  }).isRequired,
};

export default MigrateCourse;
