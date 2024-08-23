import { useQuery } from '@apollo/client';
import { IS_EVEN_OR_ODD } from '../apollo/queries';

export const useGetEvenOrOdd = () => {
    const { data, loading, error } = useQuery(IS_EVEN_OR_ODD);
    return { data, loading, error };
};