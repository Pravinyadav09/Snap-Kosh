import { User } from "@/types"

export const userService = {
    getUsers: async (): Promise<User[]> => {
        // Mock API call
        return [
            {
                id: "1",
                name: "Alice Johnson",
                email: "alice@example.com",
                role: "Admin",
                status: "Active",
            },
            // ... more users
        ]
    },
}
