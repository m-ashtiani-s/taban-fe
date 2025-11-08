import { useSearchParams } from 'next/navigation';

const useReadSearchParams = (keys: string[]) => {
  const searchParams = useSearchParams();

  const getParamsObject = () => {
    const paramsObj: Record<string, string | null> = {};

    keys.forEach((key) => {
      const value = searchParams.get(key);
      paramsObj[key] = value !== null ? value : null;
    });

    return paramsObj;
  };

  return getParamsObject();
};

export default useReadSearchParams;
