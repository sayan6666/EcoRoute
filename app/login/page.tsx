'use client'

import { useActionState } from "react"
import { handleRegistration } from "@/app/lib/actions"

const initialState = {
    success: "",
    errors: {
        name: "",
        email: "",
        password: "",
        password_repeat: "",
    }
};

export default function Login() {
    const [state, formAction] = useActionState(handleRegistration, initialState);
    return (
        <div>
            <h1>Reg\n</h1>
            <form action={formAction}>
                <input type="text" name="name" width="20" placeholder="name"></input>
                <br></br>
                <input type="email" name="email" width="20" placeholder="email"></input>
                <br></br>
                <input type="password" name="password" width="20" placeholder="password"></input>
                <br></br>
                <input type="password" name="password_repeat" width="20" placeholder="repeat password"></input>
                <br></br>
                <button type = "submit" className=" bg-blue-500 hover:scale-95 transition-all duration-75 ease-in px-5 py-2 rounded-md text-white">Submit</button>
            </form>
        </div>
    );
}