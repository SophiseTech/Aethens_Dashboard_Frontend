import { useEffect, useState } from 'react'
import ledgerStore from '@stores/LedgerStore'
import LedgerForm from '@pages/Expenses/LedgerForm'
import LedgerSidebar from './LedgerSidebar'
import LedgerDetails from './LedgerDetails'
import Title from '@components/layouts/Title'

function Ledgers() {
    const {
        getLedgers,
        createLedger,
        updateLedger,
    } = ledgerStore()

    const [formOpen, setFormOpen] = useState(false)
    const [editLedger, setEditLedger] = useState(null)
    const [saveLoading, setSaveLoading] = useState(false)

    useEffect(() => {
        getLedgers()
    }, [getLedgers])

    const handleSave = async (values) => {
        setSaveLoading(true)
        try {
            if (editLedger) {
                await updateLedger(editLedger._id, values)
            } else {
                await createLedger(values)
            }
            setFormOpen(false)
            setEditLedger(null)
        } finally {
            setSaveLoading(false)
        }
    }

    const openEditForm = (ledger) => {
        setEditLedger(ledger)
        setFormOpen(true)
    }

    const openAddForm = () => {
        setEditLedger(null)
        setFormOpen(true)
    }

    return (
        <Title title="Ledger Management">
            <div className="flex bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden h-[calc(100vh-180px)] min-h-[500px]">
                {/* Master Panel */}
                <LedgerSidebar onAddClick={openAddForm} />

                {/* Detail Panel */}
                <LedgerDetails onEditClick={openEditForm} />
            </div>

            {/* Forms */}
            <LedgerForm
                open={formOpen}
                ledger={editLedger}
                onClose={() => { setFormOpen(false); setEditLedger(null) }}
                onSave={handleSave}
                loading={saveLoading}
            />
        </Title>
    )
}

export default Ledgers
