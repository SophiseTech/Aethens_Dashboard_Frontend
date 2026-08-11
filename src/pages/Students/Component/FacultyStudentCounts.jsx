import { Flex, Tag } from 'antd'

function FacultyStudentCounts({ data }) {
  if (!data?.length) return null

  return (
    <Flex gap={8} wrap className="mb-3">
      {data.map(({ facultyName, count }) => (
        <div
          key={facultyName}
          className="flex gap-2 items-center px-3 py-1.5 rounded-lg border border-border bg-white"
        >
          <span className="text-xs font-medium text-gray-700">{facultyName}</span>
          <Tag color={facultyName === 'Unassigned' ? 'orange' : 'blue'} className="m-0 rounded-full">
            {count}
          </Tag>
        </div>
      ))}
    </Flex>
  )
}

export default FacultyStudentCounts
