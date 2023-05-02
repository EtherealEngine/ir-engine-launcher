import { WorkloadsInfo } from 'models/Workloads'
import { memo } from 'react'

import { Card, CardActionArea, CardContent, Typography } from '@mui/material'

interface ServerItemProps {
  data: WorkloadsInfo
  isSelected: boolean
  onCardClick: (key: string) => void
}

const WorkloadsItemCard = ({ data, isSelected, onCardClick }: ServerItemProps) => {
  return (
    <Card>
      <CardActionArea onClick={() => onCardClick(data.id)}>
        <CardContent className="text-center">
          <Typography variant="h5" component="h5">
            {data.label}
          </Typography>
          <Typography variant="body1" component="p">
            {data.pods.filter((item) => item.status === 'Running').length}/{data.pods.length}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  )
}

WorkloadsItemCard.displayName = 'WorkloadsItemCard'

WorkloadsItemCard.defaultPros = {}

export default memo(WorkloadsItemCard)
