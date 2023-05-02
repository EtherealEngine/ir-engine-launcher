import { Workloads } from 'models/Workloads'
import { useEffect, useState } from 'react'
import LoadingPage from 'renderer/pages/LoadingPage'
import { useConfigFileState } from 'renderer/services/ConfigFileService'
import { useWorkloadsState, WorkloadsService } from 'renderer/services/WorkloadsService'

import { Box, Card, CardActionArea, CardContent, Grid, Typography } from '@mui/material'

import WorkloadsTable from './WorkloadsTable'

const WorkloadsView = () => {
  const [selectedCard, setSelectedCard] = useState('all')

  const configFileState = useConfigFileState()
  const { selectedCluster, selectedClusterId } = configFileState.value

  const workloads = useWorkloadsState()
  const currentWorkloads = workloads.value.find((item) => item.clusterId === selectedClusterId)

  useEffect(() => {
    if (selectedCluster && currentWorkloads?.isFetched === false && currentWorkloads?.isLoading === false)
      WorkloadsService.fetchWorkloads(selectedCluster)
  }, [currentWorkloads])

  if (!selectedCluster) {
    return <></>
  }

  if (!currentWorkloads?.isFetched) {
    return <LoadingPage title="Loading" variant="body2" isInPage />
  }

  return (
    <Box>
      <Grid container spacing={1} sx={{ mb: 1 }}>
        {currentWorkloads?.workloads.map((item, index) => (
          <Grid item key={item.id} xs={12} sm={6} md={item.id === 'projectUpdate' ? 2 : 1}>
            <ServerItemCard
              key={index}
              data={item}
              isSelected={selectedCard === item.id}
              onCardClick={setSelectedCard}
            />
          </Grid>
        ))}
      </Grid>
      <WorkloadsTable selectedCard={selectedCard} />
    </Box>
  )
}

interface ServerItemProps {
  data: Workloads
  isSelected: boolean
  onCardClick: (key: string) => void
}

const ServerItemCard = ({ data, isSelected, onCardClick }: ServerItemProps) => {
  return (
    <Card sx={{ backgroundColor: isSelected ? 'var(--panelCards)' : undefined }}>
      <CardActionArea onClick={() => onCardClick(data.id)}>
        <CardContent>
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

export default WorkloadsView
