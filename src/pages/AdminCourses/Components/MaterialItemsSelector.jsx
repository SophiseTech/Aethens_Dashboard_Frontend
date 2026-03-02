import { useEffect, useState } from 'react';
import { Select, Spin, Empty, Typography } from 'antd';
import inventoryService from '@services/Inventory';
import { debounce } from 'lodash';
import { useMemo } from 'react';

const { Text } = Typography;
const { Option } = Select;

/**
 * Component for selecting default material items from inventory
 * Returns array of ObjectIds
 */
function MaterialItemsSelector({ value = [], onChange }) {
    const [inventoryItems, setInventoryItems] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchInventoryItems("", true);
    }, []);

    const fetchInventoryItems = async (searchQuery = "", isInitialLoad = false) => {
        try {
            setLoading(true);
            const filters = searchQuery ? { searchQuery } : {};
            const response = await inventoryService.getInventoryItems(0, 50, filters);
            let responseItems = response?.items || [];

            setInventoryItems(prev => {
                // Keep selected items in the list even if search filters them out to prevent raw ID display
                if (!isInitialLoad && value?.length > 0) {
                    const existingSelected = prev.filter(item => value.includes(item._id));
                    const newIds = new Set(responseItems.map(item => item._id));
                    const missingSelected = existingSelected.filter(item => !newIds.has(item._id));
                    return [...missingSelected, ...responseItems];
                }
                return responseItems;
            });
        } catch (error) {
            console.error('Error fetching inventory items:', error);
        } finally {
            setLoading(false);
        }
    };

    const debouncedFetchItems = useMemo(() => {
        return debounce((val) => fetchInventoryItems(val, false), 300);
    }, [value]);

    if (loading) {
        return (
            <div className="flex justify-center py-4">
                <Spin tip="Loading inventory items..." />
            </div>
        );
    }

    return (
        <div>
            <Text strong className="mb-2 block">Default Material Items</Text>
            <Select
                mode="multiple"
                placeholder="Select default materials for this course"
                style={{ width: '100%' }}
                value={value}
                onChange={onChange}
                onSearch={debouncedFetchItems}
                filterOption={false}
                notFoundContent={inventoryItems.length === 0 ? <Empty description="No inventory items found" /> : null}
            >
                {inventoryItems.map((item) => (
                    <Option key={item._id} value={item._id}>
                        {item.name}
                    </Option>
                ))}
            </Select>
            {value.length > 0 && (
                <Text type="secondary" className="text-xs mt-1 block">
                    {value.length} material item{value.length !== 1 ? 's' : ''} selected
                </Text>
            )}
        </div>
    );
}

export default MaterialItemsSelector;
