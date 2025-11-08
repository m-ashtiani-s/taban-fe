import { useRouter, usePathname, useSearchParams } from 'next/navigation';

const useUpdateSearchParams = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateSearchParams = (paramsObj: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());

    for (const [key, value] of Object.entries(paramsObj)) {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key); 
      }
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  return updateSearchParams;
};

export default useUpdateSearchParams;
