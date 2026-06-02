/** Replace the keys of `T` that also appear in `P` with the versions from `P`. */
export type OverrideProps<T, P> = Omit<T, keyof P> & P
