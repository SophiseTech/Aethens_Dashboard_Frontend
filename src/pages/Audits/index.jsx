import Title from '@components/layouts/Title';
import AuditList from '@pages/Audits/Components/AuditList';
import CreateAuditModal from '@pages/Audits/Components/CreateAuditModal';
import ConductAudit from '@pages/Audits/Components/ConductAudit';
import AuditDetails from '@pages/Audits/Components/AuditDetails';
import inventoryAuditStore from '@stores/InventoryAuditStore';
import userStore from '@stores/UserStore';
import permissions from '@utils/permissions';
import { Button, Flex } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';

function Audits() {
    const { getAudits } = inventoryAuditStore();
    const { user } = userStore();
    const [createAuditModalOpen, setCreateAuditModalOpen] = useState(false);
    const [conductAuditDrawerOpen, setConductAuditDrawerOpen] = useState(false);
    const [auditDetailsDrawerOpen, setAuditDetailsDrawerOpen] = useState(false);
    const [selectedAudit, setSelectedAudit] = useState(null);

    const canCreateAudits = permissions.audits.create.includes(user?.role);

    useEffect(() => {
        loadAudits();
    }, []);

    const loadAudits = () => {
        const filters = {};
        if (user.role === 'manager') {
            filters.auditor_id = user._id;
        }
        getAudits(filters);
    };

    const handleViewDetails = (audit) => {
        setSelectedAudit(audit);
        setAuditDetailsDrawerOpen(true);
    };

    const handleConductAudit = (audit) => {
        setSelectedAudit(audit);
        setConductAuditDrawerOpen(true);
    };

    return (
        <Title
            title="Inventory Audits"
            button={
                canCreateAudits && (
                    <Flex gap={20}>
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => setCreateAuditModalOpen(true)}
                        >
                            Create Audit
                        </Button>
                    </Flex>
                )
            }
        >
            <AuditList onViewDetails={handleViewDetails} onConductAudit={handleConductAudit} />

            {/* Create Audit Modal */}
            <CreateAuditModal
                open={createAuditModalOpen}
                onClose={() => {
                    setCreateAuditModalOpen(false);
                    loadAudits();
                }}
            />

            {/* Conduct Audit Drawer (Manager) */}
            <ConductAudit
                open={conductAuditDrawerOpen}
                audit={selectedAudit}
                onClose={() => {
                    setConductAuditDrawerOpen(false);
                    setSelectedAudit(null);
                    loadAudits();
                }}
            />

            {/* Audit Details Drawer (Admin) */}
            <AuditDetails
                open={auditDetailsDrawerOpen}
                audit={selectedAudit}
                onClose={() => {
                    setAuditDetailsDrawerOpen(false);
                    setSelectedAudit(null);
                }}
            />
        </Title>
    );
}

export default Audits;
