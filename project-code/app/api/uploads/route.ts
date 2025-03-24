import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(req: Request){

    try{

        const formData = await req.formData();

        const file = formData.get("profile_image") as File;

        if(!file){
            return NextResponse.json({
                status: false,
                message: "Profile photo not found"
            })
        }

        const uploadDirectory = path.join(process.cwd(), "public/uploads");
        if(!fs.existsSync(uploadDirectory)){
            // Create Uploads folder
            fs.mkdirSync(uploadDirectory)
        }

        const fileExtension = file.name.split(".").pop(); // abc.png
        const fileName = `${Date.now()}.${fileExtension}`;

        const filePath = path.join(uploadDirectory, fileName)

        const stream = fs.createWriteStream(filePath);
        stream.write(Buffer.from(await file.arrayBuffer()))

        return NextResponse.json({
            status: true,
            message: "Profile Image URL",
            url: `/uploads/${fileName}`
        })
    } catch(error) {
        return NextResponse.json({
            status: false,
            message: "Failed to upload Profile Image"
        });
    }
}