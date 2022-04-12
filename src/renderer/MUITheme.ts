const MUITheme = (mode: string) => ({
  palette: {
    mode: mode,
    primary: {
      main: 'rgb(81, 81, 255)'
    },
    secondary: {
      main: 'rgb(255, 214, 0)'
    }
  },
  components: {
    MuiListSubheader: {
      styleOverrides: {
        root: {
          'background-color': 'rgba(0,0,0,0)'
        }
      }
    },
    MuiTab: {
      styleOverrides: {
        root: {
          color: 'inherit',
          opacity: 0.7
        }
      }
    }
  }
})

export default MUITheme
