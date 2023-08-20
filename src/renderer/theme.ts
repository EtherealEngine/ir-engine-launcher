import { createTheme } from '@mui/material/styles'

const theme = createTheme({
  palette: {
    primary: {
      main: 'rgba(128, 128, 128, 50%)'
    },
    secondary: {
      main: 'rgba(128, 128, 128, 50%)'
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
          color: 'var(--textColor)',
          opacity: 0.5,

          '&.Mui-selected': {
            color: 'var(--textColor)',
            opacity: 1
          }
        }
      }
    },
    MuiStepLabel: {
      styleOverrides: {
        label: {
          color: 'var(--textColor)',
          opacity: 0.5,

          '&.Mui-active': {
            color: 'var(--textColor)',
            opacity: 1
          },
          '&.Mui-completed': {
            color: 'var(--textColor)',
            opacity: 1
          }
        }
      }
    },
    MuiSwitch: {
      styleOverrides: {
        thumb: {
          color: 'var(--textColor)'
        },
        track: {
          color: 'var(--textColor)'
        }
      }
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          color: 'var(--textColor)'
        }
        //     h1: {
        //       fontSize: 24,
        //       margin: '15px 0px',
        //       display: 'flex',
        //       alignItems: 'center'
        //     },
        //     h2: {
        //       fontSize: 16,
        //       fontWeight: 'bold',
        //       margin: '5px 0px',
        //       cursor: 'pointer',
        //       display: 'flex',
        //       alignItems: 'center',
        //       '&.MuiTypography-colorSecondary': {
        //         color: '#FFD600'
        //       }
        //     },
        //     h3: {
        //       fontSize: 14,
        //       margin: '5px 0px',
        //       fontWeight: 'bold',
        //       cursor: 'pointer',
        //       display: 'flex',
        //       alignItems: 'center',
        //       '&.MuiTypography-colorSecondary': {
        //         color: '#FFD600'
        //       }
        //     },
        //     h4: {
        //       fontSize: 14,
        //       margin: '5px 0px',
        //       cursor: 'pointer',
        //       display: 'flex',
        //       alignItems: 'center',
        //       '&.MuiTypography-colorSecondary': {
        //         color: '#FFD600'
        //       }
        //     },
        //     alignRight: {
        //       textAlign: 'right',
        //       justifyContent: 'flex-end',
        //       alignItems: 'right'
        //     },
        //     alignLeft: {
        //       textAlign: 'left',
        //       justifyContent: 'flex-start',
        //       alignItems: 'left'
        //     },
        //     alignCenter: {
        //       textAlign: 'center',
        //       justifyContent: 'center',
        //       alignItems: 'center'
        //     }
      }
    },
    MuiPopover: {
      styleOverrides: {
        paper: {
          borderRadius: '4px',
          background: 'var(--popupBackground)',
          color: 'var(--textColor)'
        }
      }
    },
    MuiDialog: {
      styleOverrides: {
        // paperWidthSm: {
        //   maxWidth: '40%',
        //   width: '40%',
        //   margin: '0 auto',
        //   fontSize: 16,
        //   textAlign: 'center',
        //   '@media (max-width: 768px)': {
        //     maxWidth: '90%',
        //     width: '90%'
        //   }
        // }
        paper: {
          background: 'var(--popupBackground)',
          color: 'var(--textColor)'
        }
      }
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          color: 'var(--textColor)'
          // display: 'flex',
          // flexDirection: 'row-reverse',
          // alignItems: 'center'
        }
      }
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          color: 'var(--textColor)'
          // textAlign: 'justify',
          // padding: ' 0 24px 24px 24px'
        }
      }
    },
    MuiDialogContentText: {
      styleOverrides: {
        root: {
          color: 'var(--textColor)'
        }
      }
    },
    // MuiButtonBase: {
    //   styleOverrides: {
    //     root: {
    //       backgroundColor: 'rgba(0, 0, 0, 0.9)',
    //       color: '#000000',
    //       fontSize: 16,
    //       textAlign: 'center'
    //     }
    //     // colorPrimary:{
    //     //   backgroundColor: 'transparent',
    //     //   color: '#FFFFFF',
    //     //   '&:hover':{
    //     //     backgroundColor: '#5151FF',
    //     //   },
    //     // },
    //   }
    // },
    MuiCircularProgress: {
      styleOverrides: {
        root: {
          color: 'var(--textColor)'
        }
      }
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          color: 'var(--textColor)'
        }
      }
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          color: 'var(--textColor)',
          '&:hover': {
            opacity: 0.7
          },
          '&.Mui-disabled': {
            color: 'var(--textColor)',
            opacity: 0.5
          }
        },
        colorPrimary: {
          backgroundColor: 'transparent',
          color: 'var(--textColor)',
          '&:hover': {
            opacity: 0.7
          }
        },
        colorSecondary: {
          backgroundColor: 'transparent',
          color: 'var(--textColor)',
          '&:hover': {
            opacity: 0.7
          }
        }
      }
    },
    // MuiSlider: {
    //   styleOverrides: {
    //     root: {
    //       color: '#484848'
    //     },
    //     thumb: {
    //       height: '24px',
    //       width: '24px',
    //       marginTop: '-10px',
    //       boxSizing: 'border-box'
    //     },
    //     thumbColorPrimary: {
    //       background: 'rgba(0, 0, 0, 0.8)',
    //       border: '2px solid #A8A8FF'
    //     }
    //   }
    // },
    MuiMenu: {
      styleOverrides: {
        paper: {
          backgroundColor: 'var(--dropdownMenuBackground)'
        }
      }
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          color: 'var(--textColor)',

          '&:hover': {
            backgroundColor: 'var(--dropdownMenuHoverBackground)'
          },
          '&.Mui-selected': {
            backgroundColor: 'var(--dropdownMenuSelectedBackground)',
            '&:hover': {
              backgroundColor: 'var(--dropdownMenuSelectedBackground)'
            }
          }
        }
      }
    },
    // MuiSnackbar: {
    //   styleOverrides: {
    //     root: {
    //       maxWidth: '80%',
    //       minWidth: '40%',
    //       width: 'auto',
    //       left: '30%',
    //       right: '30%',
    //       userSelect: 'none',
    //       borderRadius: '8px',
    //       fontSize: 16,
    //       backgroundColor: 'rgba(0,0,0,0.9)',
    //       boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.2)',
    //       padding: '20px',
    //       boxSizing: 'border-box',
    //       '@media (max-width: 768px)': {
    //         maxWidth: '90%',
    //         width: '90%',
    //         left: '5%',
    //         right: '5%'
    //       },
    //       MuiSvgIcon: {
    //         root: {
    //           height: '7em',
    //           width: 'auto',
    //           color: '#000000'
    //         }
    //       }
    //     },
    //     anchorOriginTopCenter: {
    //       top: '10%'
    //       // '@media (max-width: 768px)': {
    //       //   top: '10%',
    //       // },
    //     },
    //     anchorOriginBottomCenter: {
    //       bottom: '60px',
    //       left: '50%',
    //       transform: 'translate(-50%, 20px)'
    //     },
    //     anchorOriginTopLeft: {
    //       left: '0px',
    //       top: '24px',
    //       width: '52%',
    //       maxWidth: '80%',
    //       '@media (max-width: 768px)': {
    //         width: '90%'
    //       },
    //       '@media (min-width: 600px)': {
    //         left: '0px'
    //       }
    //     }
    //   }
    // },
    // MuiSnackbarContent: {
    //   styleOverrides: {
    //     root: {
    //       color: '#FFFFFF',
    //       backgroundColor: 'rgba(0, 0, 0, 0.9)',
    //       minWidth: '0px',
    //       '@media (min-width: 600px)': {
    //         minWidth: '0px'
    //       }
    //     }
    //   }
    // },
    // MuiDrawer: {
    //   styleOverrides: {
    //     paper: {
    //       padding: '20px',
    //       backgroundColor: 'rgba(0,0,0,0.85)'
    //     },
    //
    //     paperAnchorRight: {
    //       width: '25%',
    //       '@media (max-width: 1280px)': {
    //         width: '33%'
    //       },
    //       '@media (max-width: 1024px)': {
    //         width: '40%'
    //       },
    //       '@media (orientation: portrait)': {
    //         width: '100vw'
    //       }
    //     }
    //   }
    // },
    // MuiCardMedia: {
    //   styleOverrides: {
    //     media: {
    //       '&:hover': {
    //         backgroundColor: '#A8A8FF'
    //       }
    //     }
    //   }
    // },
    // MuiList: {
    //   styleOverrides: {
    //     root: {
    //       background: 'rgba(206,206,206,0.1)',
    //       color: '#FFFFFF'
    //     }
    //   }
    // },
    MuiListItem: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: 'var(--dropdownMenuHoverBackground)'
          },
          '&.Mui-selected': {
            backgroundColor: 'var(--dropdownMenuSelectedBackground)',
            '&:hover': {
              backgroundColor: 'var(--dropdownMenuSelectedBackground)'
            }
          }
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: 'var(--panelBackground)'
        }
      }
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          background: 'var(--tableHeaderBackground)',
          color: 'var(--textColor)',
          borderBottom: '2px solid var(--mainBackground)'
        },
        body: {
          background: 'var(--tableCellBackground)',
          borderBottom: '1px solid var(--mainBackground)',
          color: 'var(--textColor)'
        }
      }
    },
    // MuiListItemText: {
    //   styleOverrides: {
    //     root: {
    //       background: 'rgba(0, 0, 0, .5)',
    //       borderRadius: '5px',
    //       padding: '5px 10px',
    //       width: 'fit-content',
    //       flex: 'inherit',
    //       wordBreak: 'break-all'
    //     }
    //   }
    // },
    // MuiCardContent: {
    //   styleOverrides: {
    //     root: {
    //       '&:last-child': {
    //         paddingBottom: '0px',
    //         paddingLeft: '0px',
    //         paddingRight: '0px',
    //         paddingTop: '0px'
    //       }
    //     }
    //   }
    // },
    // MuiPaper: {
    //   styleOverrides: {
    //     root: {
    //       backgroundColor: 'rgba(0,0,0,0.8)'
    //     }
    //   }
    // },
    MuiInputBase: {
      styleOverrides: {
        input: {
          color: 'var(--textColor)',
          WebkitTextFillColor: 'var(--textColor)',

          '&:hover': {
            color: 'var(--textColor)'
          },
          '&.Mui-focused': {
            color: 'var(--textColor)'
          },
          '&.Mui-disabled': {
            color: 'var(--textColor)',
            WebkitTextFillColor: 'var(--textColor)',
            opacity: 0.7
          }
        },
        root: {
          color: 'var(--textColor)',
          WebkitTextFillColor: 'var(--textColor)',

          '&.Mui-focused': {
            color: 'var(--textColor)'
          },
          '&.Mui-disabled': {
            color: 'var(--textColor)',
            WebkitTextFillColor: 'var(--textColor)',
            opacity: 0.7
          }
        }
      }
    },
    MuiFormLabel: {
      styleOverrides: {
        root: {
          color: 'var(--textColor)',

          '&:hover': {
            color: 'var(--textColor)'
          },
          '&.Mui-focused': {
            color: 'var(--textColor)'
          },
          '&.Mui-disabled': {
            color: 'var(--textColor)',
            opacity: 0.7
          }
        }
      }
    },
    MuiOutlinedInput: {
      styleOverrides: {
        notchedOutline: {
          borderColor: 'var(--buttonOutlined) !important'
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          // width: '220px',
          // margin: '10px auto',
          // cursor: 'pointer',
          // fontSize: 16,
          color: 'var(--textColor)',

          '&.Mui-disabled': {
            color: 'var(--textColor)',
            opacity: 0.5
          }
        },
        //@ts-ignore
        label: {
          // textTransform: 'capitalize'
        },
        outlined: {
          backgroundColor: 'transparent',
          borderColor: 'var(--buttonOutlined)',
          '&:hover': {
            backgroundColor: 'transparent',
            borderColor: 'var(--buttonOutlined)'
          },
          '&:disabled': {
            backgroundColor: 'transparent',
            borderColor: 'var(--buttonOutlined)',
            color: 'var(--textColor)',
            opacity: 0.5
          }
        },
        contained: {
          backgroundColor: 'var(--buttonFilled)',

          '&:hover': {
            opacity: 0.8,
            backgroundColor: 'var(--buttonFilled)'
          },
          '&:disabled': {
            backgroundColor: 'var(--buttonFilled)',
            opacity: 0.5
          },
          '&:disabled.MuiLoadingButton-root': {
            opacity: 0.9
          }
        },
        outlinedPrimary: {
          '&:hover': {
            boxShadow: '0 0 10px var(--buttonOutlined)'
          },
          '&:disabled': {
            boxShadow: '0 0 10px var(--buttonOutlined)',
            opacity: 0.5
          }
        },
        outlinedSecondary: {
          '&:hover': {
            boxShadow: '0 0 10px var(--buttonOutlined)'
          },
          '&:disabled': {
            boxShadow: '0 0 10px var(--buttonOutlined)',
            opacity: 0.5
          }
        }
      }
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          color: 'var(--textColor)'
        }
      }
    },
    MuiSvgIcon: {
      styleOverrides: {
        root: {
          fill: 'var(--textColor)'
        }
      }
    }
    // MuiFab: {
    //   styleOverrides: {
    //     root: {
    //       height: '3em',
    //       width: 'fit-content',
    //       padding: '10px',
    //       margin: '0px 5px',
    //       display: 'flex',
    //       alignItems: 'center',
    //       textTransform: 'capitalize',
    //       text: {
    //         color: '#FFFFFF'
    //       }
    //     },
    //     primary: {
    //       backgroundColor: 'rgba(0,0,0,0.8)',
    //       borderRadius: '8px'
    //     }
    //   }
    // },
    // MuiFormGroup: {
    //   styleOverrides: {
    //     root: {
    //       display: 'flex',
    //       flexWrap: 'wrap',
    //       flexDirection: 'row'
    //     }
    //   }
    // },
    // MuiBadge: {
    //   styleOverrides: {
    //     // anchorOriginTopLeftRectangle: {
    //     //   left: '6px'
    //     // },
    //     dot: {
    //       height: '12px',
    //       width: '12px',
    //       borderRadius: '50%'
    //     },
    //     colorPrimary: {
    //       backgroundColor: '#7AFF64'
    //     }
    //   }
    // }
  }
})

export default theme
