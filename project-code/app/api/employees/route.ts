import { NextResponse } from "next/server";
import redis from "@/lib/redis";

export async function GET(){

    const employees = await redis.hgetall("employees_db") || {};

    return NextResponse.json(Object.values(employees).map( (singleEmployee) => JSON.parse(singleEmployee) ))
}

export async function POST(req: Request){

    try{
        const { id, name, email, gender, designation, profile_image } = await req.json()

        const allEmployees = await redis.hgetall("employees_db")

        // Check duplicate email
        const isEmployeeExists = Object.values(allEmployees).some( (singleEmployee) => JSON.parse(singleEmployee as string).email === email )

        if(isEmployeeExists){
            return NextResponse.json({
                status: false,
                message: "Email already exists"
            })
        }

        await redis.hset("employees_db", id, JSON.stringify({
            id,
            name,
            email,
            gender,
            designation,
            profile_image
        }) )

        return NextResponse.json({
            status: true,
            message: "Employee Added Successfully"
        })
    } catch(error){
        return NextResponse.json({
            status: false,
            message: "Failed to create employee - Error"
        })
    }
}