import axios from "axios";
const url = 'http://localhost:3000'

export const instance = axios.create({
    baseURL: url,
    headers: {
        'Content-Type': 'application/json',
    }
    
})