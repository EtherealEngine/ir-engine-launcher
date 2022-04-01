declare global {
  interface ImportMeta {
    globEager: (glob: string) => { [module: string]: any }
  }
}

export const store = {
  receptors: [] as Function[],

  dispatch(action: { type: string; [key: string]: any }) {
    console.log(action)
    for (const r of store.receptors) r(action)
  }
}

export function useDispatch() {
  return store.dispatch
}