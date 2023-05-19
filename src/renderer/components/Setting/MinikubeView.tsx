import { SxProps, Theme } from '@mui/material'

import DockerView from './DockerView'

interface Props {
  sx?: SxProps<Theme>
}

const MinikubeView = ({ sx }: Props) => {
  return <DockerView sx={sx} />
}

export default MinikubeView
