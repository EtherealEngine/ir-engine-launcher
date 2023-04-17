import Channels from 'constants/Channels'
import { cloneCluster } from 'models/Cluster'
import { useSnackbar } from 'notistack'
import { useConfigFileState } from 'renderer/services/ConfigFileService'
import { DeploymentService, useDeploymentState } from 'renderer/services/DeploymentService'

import DownloadIcon from '@mui/icons-material/Download'
import RemoveCircleOutlineRoundedIcon from '@mui/icons-material/RemoveCircleOutlineRounded'
import UploadIcon from '@mui/icons-material/Upload'
import {
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  SxProps,
  Theme,
  Tooltip,
  Typography
} from '@mui/material'

interface Props {
  name: string
  repoType: string
  sx?: SxProps<Theme>
}

const GitView = ({ name, repoType, sx }: Props) => {
  const { enqueueSnackbar } = useSnackbar()
  const configFileState = useConfigFileState()
  const { selectedCluster, selectedClusterId } = configFileState.value

  const deploymentState = useDeploymentState()
  const currentDeployment = deploymentState.value.find((item) => item.clusterId === selectedClusterId)

  if (!selectedCluster || !currentDeployment) {
    return <></>
  }

  let branches: string[] = []
  if (currentDeployment.gitStatus[repoType].data) {
    const allowedBranches = ['dev', '/dev', 'master', '/master']
    branches =
      currentDeployment.gitStatus[repoType].data?.branches.filter((item) =>
        allowedBranches.some((allowed) => item.endsWith(allowed))
      ) || []

    const current = currentDeployment.gitStatus[repoType].data?.current
    if (current && branches.includes(current) === false) {
      branches = [current, ...branches]
    }
  }

  const handleBranchChange = async (event: SelectChangeEvent<string | null>) => {
    try {
      const { value } = event.target

      if (value) {
        // Here we are cloning cluster object so that when selected Cluster is changed,
        // The context cluster does not change.
        const clonedCluster = cloneCluster(selectedCluster)
        const success = await window.electronAPI.invoke(
          Channels.Git.ChangeBranch,
          clonedCluster,
          selectedCluster.configs[repoType],
          value
        )
        if (success) {
          await DeploymentService.fetchGitStatus(clonedCluster, repoType)
        } else {
          throw 'Failed to checkout branch.'
        }
      }
    } catch (err: any) {
      enqueueSnackbar(err, {
        variant: 'error'
      })
      console.log(err)
    }
  }

  const handlePull = async () => {
    try {
      // Here we are cloning cluster object so that when selected Cluster is changed,
      // The context cluster does not change.
      const clonedCluster = cloneCluster(selectedCluster)
      const success = await window.electronAPI.invoke(
        Channels.Git.PullBranch,
        clonedCluster,
        selectedCluster.configs[repoType]
      )
      if (success) {
        await DeploymentService.fetchGitStatus(clonedCluster, repoType)
      } else {
        throw 'Failed to pull branch.'
      }
    } catch (err: any) {
      enqueueSnackbar(err, {
        variant: 'error'
      })
      console.log(err)
    }
  }

  const handlePush = async () => {
    try {
      // Here we are cloning cluster object so that when selected Cluster is changed,
      // The context cluster does not change.
      const clonedCluster = cloneCluster(selectedCluster)
      const success = await window.electronAPI.invoke(
        Channels.Git.PushBranch,
        clonedCluster,
        selectedCluster.configs[repoType]
      )
      if (success) {
        await DeploymentService.fetchGitStatus(clonedCluster, repoType)
      } else {
        throw 'Failed to push branch.'
      }
    } catch (err: any) {
      enqueueSnackbar(err, {
        variant: 'error'
      })
      console.log(err)
    }
  }

  if (currentDeployment.gitStatus[repoType].loading) {
    return (
      <>
        <CircularProgress size={25} />
        <Typography>Fetching Git status</Typography>
      </>
    )
  }

  if (
    currentDeployment.gitStatus[repoType].loading === false &&
    currentDeployment.gitStatus[repoType].data === undefined
  )
    return (
      <>
        <RemoveCircleOutlineRoundedIcon sx={{ fill: 'orange' }} />
        <Typography>Git status unavailable</Typography>
      </>
    )

  return (
    <>
      <Typography sx={sx}>{name}: </Typography>

      <FormControl margin="dense" size="small">
        <InputLabel id="branch-label">Branch</InputLabel>
        <Select
          labelId="branch-label"
          label="Branch"
          value={currentDeployment.gitStatus[repoType].data?.current}
          onChange={handleBranchChange}
        >
          {branches.map((branch) => (
            <MenuItem key={branch} value={branch}>
              {branch}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Tooltip arrow title="Pull/Behind">
        <span>
          <Button
            disabled={
              !currentDeployment.gitStatus[repoType].data || currentDeployment.gitStatus[repoType].data?.behind === 0
            }
            sx={{ minWidth: 'auto' }}
            onClick={handlePull}
          >
            <DownloadIcon />
            {currentDeployment.gitStatus[repoType].data?.behind}
          </Button>
        </span>
      </Tooltip>

      <Tooltip
        arrow
        title={
          <>
            Push/Ahead
            <br />
            <br />
            Note: Please make sure your terminal is configured with git credentials.
          </>
        }
      >
        <span>
          <Button
            disabled={
              !currentDeployment.gitStatus[repoType].data || currentDeployment.gitStatus[repoType].data?.ahead === 0
            }
            sx={{ minWidth: 'auto' }}
            onClick={handlePush}
          >
            <UploadIcon />
            {currentDeployment.gitStatus[repoType].data?.ahead}
          </Button>
        </span>
      </Tooltip>
    </>
  )
}

export default GitView
