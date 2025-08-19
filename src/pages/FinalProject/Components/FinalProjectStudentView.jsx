import useProjectsView from '@hooks/business/useProjectsView';
import ProjectCard from '@pages/FinalProject/Components/ProjectCard';
import { Card, List, Typography, Button, Empty, Skeleton } from 'antd';

const { Title, Text } = Typography;




function FinalProjectStudentView() {
  const { projectsInfo, viewContext, loading } = useProjectsView();
  const { projects } = projectsInfo;

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6 min-h-screen space-y-4">
        {[1, 2].map(i => (
          <Card key={i}>
            <Skeleton active paragraph={{ rows: 3 }} />
          </Card>
        ))}
      </div>
    );
  }

  if (!projects?.length) {
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description={
          <div className="text-gray-500">
            <p className="mb-1">No projects found</p>
            <Text type="secondary" className="text-sm">
              You haven't been enrolled in any final projects yet
            </Text>
          </div>
        }
      />
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 min-h-screen space-y-4">
      <div className="flex justify-between items-center mb-6">
        <Title level={3} className="mb-4">Final Projects</Title>
        {viewContext.isManagerView && (
          <Button type="primary">
            Create New Project
          </Button>
        )}
      </div>

      <List
        grid={{ gutter: 16, xs: 1, sm: 1, md: 1, lg: 1, xl: 1, xxl: 1 }}
        dataSource={projects}
        renderItem={project => (
          <List.Item>
            <ProjectCard project={project} />
          </List.Item>
        )}
      />
    </div>
  )
}

export default FinalProjectStudentView