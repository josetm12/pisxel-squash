export const debounceFn = (fn: Function, delay: number) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return (...args: any[]) => {
    if (timeout) clearTimeout(timeout);

    timeout = setTimeout(() => fn(...args), delay);
  };
};
