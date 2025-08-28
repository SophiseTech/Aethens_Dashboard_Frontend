import { Alert, Card } from 'antd'
import React from 'react'

function PhaseInstructions({ phase }) {
  return (
    <Card title="Phase Requirements" className="mb-6" headStyle={{ backgroundColor: '#fafafa' }}>
      <Alert
        message="Phase Instructions"
        description={`Complete the ${phase.title.toLowerCase()} according to the specified requirements. Ensure all deliverables are properly documented and submitted.`}
        type="info"
        showIcon
        className="mb-4"
      />
      <ul className="list-disc list-inside space-y-2 text-gray-700">
        <li>Follow the project guidelines and standards</li>
        <li>Include proper documentation and comments</li>
        <li>Submit all required files and images</li>
        {phase.requiresSubject && <li>Provide a clear subject/title for your submission</li>}
        <li>Ensure work is original and meets quality standards</li>
      </ul>
    </Card>
  )
}

export default PhaseInstructions