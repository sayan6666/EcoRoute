'use client'

import { handleSubmit } from "@/app/lib/actions"
import { useActionState } from "react"

const initialState = {
    success: "",
    errors: {
        email: "",
        password: "",
    }
};

export default function Login() {
    const [state, formAction] = useActionState(handleSubmit, initialState);
    return (
        <div>
            <h1>Login\n</h1>
            <form action={formAction}>
                <input type="email" name="email" width="20" placeholder="email"></input>
                <br></br>
                <input type="password" name="password" width="20" placeholder="password"></input>
                <br></br>
                <button type = "submit" className=" bg-blue-500 hover:scale-95 transition-all duration-75 ease-in px-5 py-2 rounded-md text-white">Submit</button>
            </form>
        </div>
    );
}