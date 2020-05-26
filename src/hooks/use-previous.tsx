import { useRef, useEffect } from "react";

function usePrevious<V = any>(value: V) {
  const ref = useRef<V | void>(value);
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}
export default usePrevious;
