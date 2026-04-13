"use server"
import { openDb } from "../opendb";
import { z } from "zod";
import { redirect } from "next/navigation";

const formSchema2 = z.object({
    name: z.string().min(1, {message: "name"}),
    email: z.string().email({ message: "email" }),
    password: z.string().min(1, { message: "password" }),
    password_repeat: z.string().min(1, { message: "password_repeat" }),
});

export async function handleRegistration(prevstate: any, formData: FormData) {
    const data = Object.fromEntries(formData);
    const validatedData = formSchema2.safeParse(data);
    if (!validatedData.success) {
        return {
            errors: {
                name: validatedData.error.flatten().fieldErrors?.name,
                email: validatedData.error.flatten().fieldErrors?.email,
                password: validatedData.error.flatten().fieldErrors?.password,
                password_repeat: validatedData.error.flatten().fieldErrors?.password_repeat
            }
        }
    }
    const db = await openDb();
    const users = await db.all("SELECT * FROM users");
    for (let i = 0; i < users.length; i++) {
        if (users[i]["email"] == validatedData.data.email) {
            return {
                errors: {
                    name: "none",
                    email: "taken",
                    password: "none",
                    password_repeat: "none"
                }
            }
        }
    }
    if (validatedData.data.password != validatedData.data.password_repeat) {
            return {
                errors: {
                    name: "none",
                    email: "none",
                    password: "unmatch",
                    password_repeat: "unmatch"
                }
            }
    }
    await db.run("INSERT INTO users (name,email,password) VALUES (?, ?, ?)", [validatedData.data.name, validatedData.data.email, validatedData.data.password]);
    await db.close();
    return
    {
        success: "ok"
    };
}