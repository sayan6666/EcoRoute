"use server"
import { openDb } from "../opendb";
import { z } from "zod";
import { redirect } from "next/navigation";
import { cookies } from "next/headers"
import { validate } from "maplibre-gl";

const formSchema = z.object({
    email: z.string().email({ message: "email" }),
    password: z.string().min(1, { message: "password" }),
});

const formSchema2 = z.object({
    name: z.string().min(1, {message: "name"}),
    email: z.string().email({ message: "email" }),
    password: z.string().min(1, { message: "password" }),
    password_repeat: z.string().min(1, { message: "password_repeat" }),
});

const formSchema3 = z.object({
    glass: z.boolean({ message: "glass" }),
    plastic: z.boolean({ message: "plastic" }),
    metall: z.boolean({ message: "metall" }),
});

const formSchema4 = z.object({
    rating: z.int({ message: "rating" }),
    comment: z.string({message: "comment"}),
})

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

export async function handleSubmit(prevState: any, formData: FormData) {
    const data = Object.fromEntries(formData);
    const validatedData = formSchema.safeParse(data);
    if (!validatedData.success) {
        return {
            errors: {
                email: validatedData.error.flatten().fieldErrors?.email,
                password: validatedData.error.flatten().fieldErrors?.password
            }
        }
    }
    const db = await openDb();
    const admins = await db.get("SELECT * FROM admins WHERE email=?", validatedData.data.email);
    const users = await db.get("SELECT * FROM users WHERE email=?", validatedData.data.email);
    const companies = await db.get("SELECT * FROM companies WHERE email=?", validatedData.data.email);
    if (admins) {
        if (admins["password"] == validatedData.data.password) {
            const expires = new Date(Date.now() + 10 * 100000);
            const cookieStore = await cookies();
            cookieStore.set("session", admins["email"] + "_admin", { expires, httpOnly: true });
            await db.close();
            redirect("/acc");
        }
    }
    if (users) {
        if (users["password"] == validatedData.data.password) {
            const expires = new Date(Date.now() + 10 * 100000);
            const cookieStore = await cookies();
            cookieStore.set("session", users["email"] + "_user", { expires, httpOnly: true });
            await db.close();
            redirect("/acc");
        }
    }
    if (companies) {
        if (companies["password"] == validatedData.data.password) {
            const expires = new Date(Date.now() + 10 * 100000);
            const cookieStore = await cookies();
            cookieStore.set("session", companies["email"] + "_company", { expires, httpOnly: true });
            await db.close();
            redirect("/acc");
        }
    }
    return
    {
        success: "ok"
    };
}

export async function getPoints() {
    const db = await openDb();
    const points = await db.all("SELECT * FROM points");
    return points;
}

export async function getSession() {
    const nextCookies = await cookies();
    const session = nextCookies.get("session")?.value;
    return session ? session : null;
}

//format x_y
export async function getCurrentPoint() {
    const nextCookies = await cookies();
    const point = nextCookies.get("point")?.value;
    return point;
}

export async function getProfile() {
    const sessionType = await getSession();
    const db = await openDb();
    let profile = null;
    if (sessionType != null) {
        profile = await db.get("SELECT name, email FROM " + sessionType.split("_")[1] + " WHERE email=?", sessionType.split("_")[0]);
    }
    return profile;
}

export async function handleReview(prevstate: any, formData: FormData) {
    const data = Object.values(formData);
    const validatedData = formSchema4.safeParse(data);
    if (!validatedData.success) {
        return {
            errors: {
                rating: validatedData.error.flatten().fieldErrors?.rating,
                comment: validatedData.error.flatten().fieldErrors?.comment,
            }
        }
    }
    const db = await openDb();
    const point = await getCurrentPoint();
    const user = await getProfile();
    const date = new Date(Date.now().toString());
    const pointID = db.get("SELECT id FROM points WHERE x=? AND y=?", [point.split("_")[0], point.split("_")[1]]);
    const userID = db.get("SELECT id FROM users WHERE email=?", user.split("_")[0])
    db.run("INSERT INTO reviews (user_id,point_id,date,rating,comment)", [userID, pointID, date, validatedData.data.rating, validatedData.data.comment]);
    await db.close();
}

//unused
export async function handleFilter(prevstate: any, formData: FormData) {
    const data = Object.values(formData);
    const validatedData = formSchema3.safeParse(data);
    if (!validatedData.success) {
        return {
            errors: {
                glass: validatedData.error.flatten().fieldErrors?.glass,
                plastic: validatedData.error.flatten().fieldErrors?.plastic,
                metall: validatedData.error.flatten().fieldErrors?.metall,
            }
        }
    }

    const filters = [];
    if (validatedData.data.glass) {
        filters.push("glass");
    }
    if (validatedData.data.plastic) {
        filters.push("plastic");
    }
    if (validatedData.data.metall) {
        filters.push("metall");
    }
    const points = await getPoints();
    const valid_points = [];
    for (let i = 0; i < points.length; i++) {
        for (let j = 0; j < filters.length; j++) {
            if (points[i]["type"].search(filters[j]) != -1) {
                valid_points.push(points[i]);
            }
        }
    }
    if (filters.length == 0) {
        for (let i = 0; i < points.length; i++) {
            valid_points.push(points[i]);
        }
    }
    return {
        success: "ok"
    };
}