import { NextResponse } from "next/server";
import redis from "@/lib/redis";

export async function PUT(req: Request, { params } : { params: { id: string } }){

    try{
        const {
            id, name, email, gender, designation, profile_image
        } = await req.json()

        await redis.hset("employees_db", params.id, JSON.stringify({
            id,
            name,
            email,
            gender,
            designation,
            profile_image
        }))

        return NextResponse.json({
            status: true,
            message: "Employees data updated successfully"
        })
    } catch(error){
        console.log(error)
    }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }){

    try{

        await redis.hdel("employees_db", params.id)
        return NextResponse.json({
            status: true,
            message: "Employee Deleted"
        })
    } catch(error){
        console.log(error)
    }
}