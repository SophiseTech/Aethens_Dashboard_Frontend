import useProjectsView from '@hooks/business/useProjectsView';
import ProjectCard from '@pages/FinalProject/Components/ProjectCard';
import { Card, List, Typography, Empty, Skeleton } from 'antd';
import TitleLayout from '@components/layouts/Title'

const { Text } = Typography;




function FinalProjectStudentView() {
  const { projectsInfo, viewContext, loading, handleViewProjectDetails } = useProjectsView();
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
      <TitleLayout title="Final Projects">
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <div className="text-gray-500">
              <p className="mb-1">No projects found</p>
              {viewContext.isManagerView ?
                <Text type="secondary" className="text-sm">
                  No projects have been created for this student yet
                </Text>
                :
                <Text type="secondary" className="text-sm">
                  You haven&apos;t been enrolled in any final projects yet
                </Text>
              }
            </div>
          }
        />
      </TitleLayout>
    );
  }

  return (
    <TitleLayout title={"Final Projects"}>
      <div className="w-full mx-auto p-6 min-h-screen space-y-4">
        {/* <div className="flex justify-between items-center mb-6">
        <Title level={3} className="mb-4">Final Projects</Title>
        {viewContext.isManagerView && (
          <Button type="primary">
            Create New Project
          </Button>
        )}
      </div> */}

        <List
          grid={{ gutter: 16, xs: 1, sm: 1, md: 1, lg: 1, xl: 1, xxl: 1 }}
          dataSource={projects}
          renderItem={project => (
            <List.Item>
              <ProjectCard project={project} handleViewProjectDetails={handleViewProjectDetails} />
            </List.Item>
          )}
        />
      </div>
    </TitleLayout>
  )
}

export default FinalProjectStudentView