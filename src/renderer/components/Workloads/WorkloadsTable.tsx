import TimeAgo from 'javascript-time-ago'
import en from 'javascript-time-ago/locale/en'
import { WorkloadsPodInfo } from 'models/Workloads'
import { useEffect, useState } from 'react'
import { useConfigFileState } from 'renderer/services/ConfigFileService'
import { useWorkloadsState, WorkloadsService } from 'renderer/services/WorkloadsService'

import CachedOutlinedIcon from '@mui/icons-material/CachedOutlined'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import FormControl from '@mui/material/FormControl'
import IconButton from '@mui/material/IconButton'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'

TimeAgo.addDefaultLocale(en)

const timeAgo = new TimeAgo('en-US')

interface Props {
  selectedCard: string
}

interface TableData {
  el: WorkloadsPodInfo
  name: string
  status: string
  age: string
  containers: JSX.Element
  restarts: string
  action: JSX.Element
}

const WorkloadsTable = ({ selectedCard }: Props) => {
  const [openConfirm, setOpenConfirm] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState('60')
  const [intervalTimer, setIntervalTimer] = useState<NodeJS.Timer | undefined>(undefined)
  const [selectedPod, setSelectedPod] = useState<WorkloadsPodInfo | null>(null)

  const configFileState = useConfigFileState()
  const { selectedCluster, selectedClusterId } = configFileState.value

  const workloads = useWorkloadsState()
  const currentWorkloads = workloads.value.find((item) => item.clusterId === selectedClusterId)

  useEffect(() => {
    if (autoRefresh !== '0') {
      const interval = setInterval(() => {
        handleRefreshWorkloads()
      }, parseInt(autoRefresh) * 1000)
      setIntervalTimer(interval)
      return () => {
        if (interval) clearInterval(interval) // This represents the unmount function, in which you need to clear your interval to prevent memory leaks.
      }
    } else if (intervalTimer) {
      clearInterval(intervalTimer)
      setIntervalTimer(undefined)
    }
  }, [autoRefresh])

  if (!selectedCluster) {
    return <></>
  }

  const createData = (el: WorkloadsPodInfo): TableData => {
    return {
      el,
      name: el.name,
      status: el.status,
      restarts: el.containers.map((item) => item.restarts).join(', '),
      containers: (
        <>
          {el.containers.map((item) => (
            <div
              key={item.name}
              style={{
                height: '15px',
                width: '15px',
                marginRight: '5px',
                backgroundColor:
                  item.status === 'Running' ? 'limegreen' : item.status === 'Terminated' ? 'red' : '#bbb',
                borderRadius: '50%',
                display: 'inline-block'
              }}
              title={`Name: ${item.name}\nStatus: ${item.status}`}
            />
          ))}
        </>
      ),
      age: timeAgo.format(new Date(el.age)),
      action: (
        <div style={{ float: 'right' }}>
          {/* <a
            href="#"
            onClick={() => WorkloadsService.fetchLogs(el.name, el.containers[el.containers.length - 1].name)}
          >
            <span>Logs</span>
          </a> */}
          <a
            href="#"
            onClick={() => {
              setSelectedPod(el)
              setOpenConfirm(true)
            }}
          >
            <span>Delete</span>
          </a>
        </div>
      )
    }
  }

  const handleRefreshWorkloads = () => {
    console.info('Refreshing workloads.')
    WorkloadsService.fetchWorkloads(selectedCluster)
  }

  const handleAutoRefreshWorkloadsChange = (e) => {
    const { value } = e.target

    setAutoRefresh(value)
  }

  const handleRemovePod = async () => {
    if (!selectedPod) {
      return
    }

    await WorkloadsService.removePod(selectedCluster, selectedPod.name)
    setOpenConfirm(false)
  }

  const autoRefreshMenu: { value: string; label: string }[] = [
    {
      value: '0',
      label: 'None'
    },
    {
      value: '10',
      label: '10 seconds'
    },
    {
      value: '30',
      label: '30 seconds'
    },
    {
      value: '60',
      label: '1 minute'
    },
    {
      value: '300',
      label: '5 minutes'
    },
    {
      value: '600',
      label: '10 minutes'
    }
  ]

  const workloadsDataColumns: { id: string; label: React.ReactNode }[] = [
    { id: 'name', label: 'Name' },
    { id: 'status', label: 'Status' },
    { id: 'restarts', label: 'Restarts' },
    { id: 'containers', label: 'Containers' },
    { id: 'age', label: 'Age' },
    {
      id: 'action',
      label: (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'end' }}>
          {currentWorkloads?.isLoading === false && (
            <IconButton title="Refresh Workloads" sx={{ marginRight: 1.5 }} onClick={handleRefreshWorkloads}>
              <CachedOutlinedIcon />
            </IconButton>
          )}

          {currentWorkloads?.isLoading && <CircularProgress size={24} sx={{ marginRight: 1.5 }} />}

          <FormControl margin="dense" size="small">
            <InputLabel id="workloads-refresh">Auto Refresh</InputLabel>
            <Select
              labelId="workloads-refresh"
              label="Auto Refresh"
              value={autoRefresh}
              onChange={handleAutoRefreshWorkloadsChange}
            >
              {autoRefreshMenu.map((item) => (
                <MenuItem key={item.value} value={item.value}>
                  {item.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      )
    }
  ]

  const rows = currentWorkloads?.workloads
    .find((item) => item.id === selectedCard)!
    .pods.map((el) => {
      return createData(el)
    })

  return (
    <>
      <TableContainer>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              {workloadsDataColumns.map((item) => (
                <TableCell key={item.id}>{item.label}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows?.map((row) => (
              <TableRow key={row.name} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                {Object.keys(row)
                  ?.filter((item) => item !== 'el')
                  .map((key) => (
                    <TableCell>{row[key]}</TableCell>
                  ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {/* <TableComponent
        allowSort={false}
        rows={rows}
        column={serverInfoDataColumns}
        page={0}
        count={rows.length}
        rowsPerPage={rows.length}
        handlePageChange={() => {}}
        handleRowsPerPageChange={() => {}}
      />

      <ConfirmDialog
        open={openConfirm}
        description={`${t('admin:components.server.confirmPodDelete')} '${selectedPod?.value?.name}'?`}
        onClose={() => setOpenConfirm(false)}
        onSubmit={handleRemovePod}
      /> */}
    </>
  )
}

export default WorkloadsTable
