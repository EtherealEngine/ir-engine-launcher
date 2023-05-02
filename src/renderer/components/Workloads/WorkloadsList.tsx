import { memo } from 'react'

import { Grid } from '@mui/material'

import WorkloadsItemCard from './WorkloadsItemCard'

const WorkloadsList = ({ data, selectedCard, setSelectedCard }) => {
  return data.map((item, index) => (
    <Grid item key={item.id} xs={12} sm={6} md={2}>
      <WorkloadsItemCard key={index} data={item} isSelected={selectedCard === item.id} onCardClick={setSelectedCard} />
    </Grid>
  ))
}

WorkloadsList.displayName = 'WorkloadsList'

WorkloadsList.defaultProps = {}

export default memo(WorkloadsList)
