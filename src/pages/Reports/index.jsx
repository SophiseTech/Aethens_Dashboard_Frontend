import { Card } from 'antd';
import { DollarOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import Title from '@components/layouts/Title';

const REPORT_CATEGORIES = [
  {
    key: 'financial',
    label: 'Financial',
    description: 'Download finance-related reports (audit report, and more to come).',
    icon: <DollarOutlined className="text-2xl" />,
    path: '/manager/reports/financial',
  },
];

function Reports() {
  const nav = useNavigate();

  return (
    <Title title="Reports">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {REPORT_CATEGORIES.map((category) => (
          <Card
            key={category.key}
            hoverable
            onClick={() => nav(category.path)}
            className="cursor-pointer"
          >
            <div className="flex items-center gap-3">
              {category.icon}
              <div>
                <p className="font-semibold">{category.label}</p>
                <p className="text-xs text-gray-500">{category.description}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </Title>
  );
}

export default Reports;
