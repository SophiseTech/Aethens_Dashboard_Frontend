import {
  Modal,
  Button,
  Select,
  Typography,
  Space,
  Flex,
  Card,
  message,
} from 'antd';
import { useEffect, useState } from 'react';
import { isUserActive } from '@utils/helper';
import centersService from '@/services/Centers';
import studentService from '@/services/Student';

const { Title, Text } = Typography;

function MigrateCenter({ student }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [centers, setCenters] = useState([]);
  const [selectedCenter, setSelectedCenter] = useState(null);
  const [loadingCenters, setLoadingCenters] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const fetchCenters = async () => {
      if (!isModalOpen) return;

      try {
        setLoadingCenters(true);
        const res = await centersService.getCenters({}, 0, 0);
        const availableCenters = res?.centers?.filter(
          (c) => c._id !== (student?.details_id?.center_id?._id || student?.details_id?.center_id)
        ) || [];
        setCenters(availableCenters);
      } catch (err) {
        console.error(err);
        message.error('Failed to load centers');
      } finally {
        setLoadingCenters(false);
      }
    };

    fetchCenters();
  }, [isModalOpen, student.details_id?.center_id]);

  const handleCancel = () => {
    setIsModalOpen(false);
    setSelectedCenter(null);
  };

  const handleMigration = () => {
    if (!selectedCenter) {
      message.warning('Please select a new center');
      return;
    }

    Modal.confirm({
      title: 'Confirm Migration',
      content: 'Are you sure you want to move this student to the selected center?',
      okText: 'Migrate',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          setProcessing(true);
          await studentService.migrateStudentCenter(
            student._id,
            selectedCenter
          );
          message.success('Center updated successfully');
          handleCancel();
          window.location.reload();
        } catch (error) {
          console.error(error);
          message.error('Failed to migrate center');
        } finally {
          setProcessing(false);
        }
      },
    });
  };

  return (
    <>
      <Button
        onClick={() => setIsModalOpen(true)}
        disabled={!isUserActive(student)}
        variant="filled"
        color="blue"
      >
        Migrate Center
      </Button>

      <Modal
        title={<Title level={4}>Migrate Center</Title>}
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
        destroyOnClose
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Card>
            <Space direction="vertical" size="small">
              <div>
                <Text strong>Student: </Text>
                <Text>{student.username}</Text>
              </div>
              {/* <div>
                <Text strong>Current Center: </Text>
                <Text>{student.details_id?.center_id?.center_name || 'N/A'}</Text>
              </div> */}
            </Space>
          </Card>

          <Flex gap={10} wrap="wrap">
            <Select
              style={{ minWidth: 250 }}
              placeholder="Select New Center"
              value={selectedCenter}
              onChange={(value) => setSelectedCenter(value)}
              loading={loadingCenters}
              options={centers.map((center) => ({
                label: center.center_name,
                value: center._id,
              }))}
            />
          </Flex>

          <Flex justify="end" gap={10} wrap="wrap">
            <Button onClick={handleCancel}>Cancel</Button>
            <Button
              type="primary"
              onClick={handleMigration}
              loading={processing}
              disabled={!selectedCenter || processing}
            >
              Migrate Center
            </Button>
          </Flex>
        </Space>
      </Modal>
    </>
  );
}

export default MigrateCenter;
