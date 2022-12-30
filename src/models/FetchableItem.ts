export type FetchableItem<T> = {
  loading: boolean
  data: T
  error: string
}
