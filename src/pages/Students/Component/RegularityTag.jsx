import { Tag } from 'antd'
import React from 'react'

function RegularityTag({ regularity }) {
    const colorMap = {
        'Regular': 'green',
        'On Track': 'blue',
        'Irregular': 'red'
    }
    return (
        <Tag color={colorMap[regularity]}>
            {regularity}
        </Tag>
    )
}

export default RegularityTag