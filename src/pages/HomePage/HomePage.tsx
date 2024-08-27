import React from 'react';
import Cube from './Cube';
import styles from './HomePage.module.css';

const HomePage: React.FC = () => {
    //const { data, loading, error } = useGetUsers();  // Fetch users
    //if (loading) return <p>Loading...</p>;
    //if (error) return <p>Error: {error.message}</p>;

    //let num = 5;
    //let arr: number[] = [];
    //arr.push(num);
    //arr.push("asdf");

    const users = [{id:"user1", name:"u1", email:"u1@gmail.com"},
        {id:"user2", name:"u2", email:"u2@gmail.com"},
        {id:"user3", name:"u3", email:"u3@gmail.com"},
    ];

    return (
        <div className={styles.homePage}>
            <h1 className={styles.title}>Welcome to the Home Page</h1>
            <div className={styles.usersSection}>
                <h2 className={styles.usersTitle}>User List:</h2>
                <Cube></Cube>
                <ul className={styles.usersList}>
                    {users.map((user) => (
                        <li key={user.id} className={styles.userItem}>
                            {user.name} - {user.email}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default HomePage;