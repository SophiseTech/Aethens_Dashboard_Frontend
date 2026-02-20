import { useEffect, useState } from 'react';
import { Select, Spin, Empty, Typography } from 'antd';
import inventoryService from '@services/Inventory';

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
        fetchInventoryItems();
    }, []);

    const fetchInventoryItems = async () => {
        try {
            setLoading(true);
            // Fetch with large limit to get all items for selection
            const response = await inventoryService.getInventoryItems(0, 1000);
            if (response?.items) {
                setInventoryItems(response.items);
            }
        } catch (error) {
            console.error('Error fetching inventory items:', error);
        } finally {
            setLoading(false);
        }
    };

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
                filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
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
