import { useMutation } from '@apollo/client';
import { CREATE_USER } from '../apollo/mutations';

export const useCreateUser  = () => {
    const [createUser, { data, loading, error }] = useMutation(CREATE_USER);

    // This function can be called to execute the mutation
    const handleCreateUser = async (name: string, email: string) => {
        try {
            const response = await createUser({
                variables: {
                    name,
                    email,
                },
            });
            return response.data;  // Return the data on success
        } catch (err) {
            console.error("Error creating user:", err);
            throw err;  // Rethrow error if you want the calling component to handle it
        }
    };

    return { handleCreateUser, data, loading, error };
};