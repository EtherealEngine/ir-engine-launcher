import { Channels } from 'constants/Channels'
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
  Tooltip,
  Typography
} from '@mui/material'

const GitView = () => {
  const { enqueueSnackbar } = useSnackbar()
  const configFileState = useConfigFileState()
  const { selectedCluster, selectedClusterId } = configFileState.value

  const deploymentState = useDeploymentState()
  const currentDeployment = deploymentState.value.find((item) => item.clusterId === selectedClusterId)

  if (!selectedCluster || !currentDeployment) {
    return <></>
  }

  let branches: string[] = []
  if (currentDeployment.gitStatus.data) {
    branches = currentDeployment.gitStatus.data.branches

    const current = currentDeployment.gitStatus.data.current
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
        const success = await window.electronAPI.invoke(Channels.Git.ChangeBranch, clonedCluster, value)
        if (success) {
          await DeploymentService.fetchGitStatus(clonedCluster)
        } else {
          throw 'Failed to checkout branch.'
        }
      }
    } catch (err) {
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
      const success = await window.electronAPI.invoke(Channels.Git.PullBranch, clonedCluster)
      if (success) {
        await DeploymentService.fetchGitStatus(clonedCluster)
      } else {
        throw 'Failed to pull branch.'
      }
    } catch (err) {
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
      const success = await window.electronAPI.invoke(Channels.Git.PushBranch, clonedCluster)
      if (success) {
        await DeploymentService.fetchGitStatus(clonedCluster)
      } else {
        throw 'Failed to push branch.'
      }
    } catch (err) {
      enqueueSnackbar(err, {
        variant: 'error'
      })
      console.log(err)
    }
  }

  if (currentDeployment.gitStatus.loading) {
    return (
      <>
        <CircularProgress size={25} />
        <Typography>Fetching Git status</Typography>
      </>
    )
  }

  if (currentDeployment.gitStatus.loading === false && currentDeployment.gitStatus === undefined)
    return (
      <>
        <RemoveCircleOutlineRoundedIcon sx={{ color: 'orange' }} />
        <Typography>Git status unavailable</Typography>
      </>
    )

  return (
    <>
      <Typography>Git: </Typography>

      <FormControl margin="dense" size="small">
        <InputLabel id="branch-label">Branch</InputLabel>
        <Select
          labelId="branch-label"
          label="Branch"
          value={currentDeployment.gitStatus.data?.current}
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
            disabled={!currentDeployment.gitStatus.data || currentDeployment.gitStatus.data?.behind === 0}
            sx={{ minWidth: 'auto' }}
            onClick={handlePull}
          >
            <DownloadIcon />
            {currentDeployment.gitStatus.data?.behind}
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
            disabled={!currentDeployment.gitStatus.data || currentDeployment.gitStatus.data?.ahead === 0}
            sx={{ minWidth: 'auto' }}
            onClick={handlePush}
          >
            <UploadIcon />
            {currentDeployment.gitStatus.data?.ahead}
          </Button>
        </span>
      </Tooltip>
    </>
  )
}

export default GitView
