import axios from "axios";

export const loginUser = async (data: any) => {
    const res = await axios.post("/api/auth/login", data, {
        headers: {
            "Content-Type": "application/json",
        },
    });

    return res.data;
};