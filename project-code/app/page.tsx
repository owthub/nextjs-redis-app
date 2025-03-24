"use client";

import { useForm } from "react-hook-form"
import * as yup from "yup"
import { yupResolver } from "@hookform/resolvers/yup"
import { useEffect, useState } from "react";
import Image from "next/image";
import axios from "axios";
import toast from "react-hot-toast";
import Swal from "sweetalert2";

interface Employee{
  id?: string,
  name?: string,
  email?: string,
  gender?: string,
  designation?: string,
  profileImage?: string | File | undefined
}

// Required Fields Validation
const formSchema = yup.object().shape({
  name: yup.string().required("Employee Name is required"),
  email: yup.string().email("Invalid Email Address").required("Email is required"),
  gender: yup.string().oneOf(["male", "female", "other"], "Invalid gender").required("Gender is required"),
  designation: yup.string().required("Designation is required")
});

export default function Home(){

  const [employees, setEmployees] = useState<Employee[]>([])
  const [previewImage, setPreviewImage] = useState<File|string|undefined|null>(undefined)
  const [isEdit, setIsEdit] = useState<Employee|null>(null)

  const { register, handleSubmit, formState: { errors }, setValue, reset } = useForm({
    resolver: yupResolver(formSchema)
  })

  useEffect( () => {
    fetchAllEmployees();
  }, [])

  const fetchAllEmployees = async() => {
      const {data} = await axios.get("/api/employees")
      setEmployees(data)
  }

  // Upload Profile Image
  const uploadProfileImage = async (profileImage: File) => {
    const formdata = new FormData();
    formdata.append("profile_image", profileImage);
    const { data } = await axios.post( "/api/uploads", formdata)
    return data.url;
  }

  // Form Submit
  const onFormSubmit = async (data: Employee) => {
    console.log(data)

    let imagePath = data.profileImage || "";

    if(data.profileImage instanceof File){

      imagePath = await uploadProfileImage(data.profileImage);
    }

    // Detect - Operation Type
    if(isEdit){

      // Edit
      const employeeData = {
        ...data,
        id: isEdit.id,
        profile_image: imagePath
     };

     //console.log(employeeData);return;
     

     const response = await axios.put( `/api/employees/${isEdit.id}`, employeeData)

     if(response.data.status) {

        toast.success(response.data.message)
        fetchAllEmployees();
     } else {

        toast.error(response.data.message)
     }

    } else {

      // Add 
      const employeeData = {
        ...data,
        id: Date.now().toString(),
        profile_image: imagePath
     };
 
     console.log(employeeData);
 
     const response = await axios.post( "/api/employees", employeeData );
 
     if(response.data.status) {
        toast.success(response.data.message);
        fetchAllEmployees();
     } else {
        toast.error(response.data.message);
     }

     reset()
     setPreviewImage(null)
    }
  }

  // Render Existing Information of an Employee
  const handleEmployeeEdit = (employee: Employee) => {
    setValue("name", employee.name)
    setValue("email", employee.email);
    setValue("gender", employee.gender);
    setValue("designation", employee.designation);
    setValue("profileImage", employee.profile_image);
    setPreviewImage(employee.profile_image)
    setIsEdit(employee)
  }

  // Handle Employee Delete
  const handleEmployeeDelete = (id: string) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!"
    }).then(async(result) => {
      if (result.isConfirmed) {
        const response = await axios.delete( ` /api/employees/${id} `);
        if(response.data.status){
          toast.success(response.data.message)
          fetchAllEmployees()
        } else {
          toast.error(response.data.message)
        }
      }
    });
  }

  return <>
    <div className="container mt-4">
      <div className="row">
        <div className="col-md-5">
          <form onSubmit={ handleSubmit(onFormSubmit) } className="card p-3 shadow">
            <input placeholder="Name" className="form-control mb-2" {...register("name")} />
            <p className="text-danger">{ errors.name?.message }</p>
            
            <input placeholder="Email" className="form-control mb-2" { ...register("email") } />
            <p className="text-danger">{ errors.email?.message }</p>
            
            <select className="form-control mb-2" {...register("gender")}>
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
            <p className="text-danger">{ errors.gender?.message }</p>
            
            <input placeholder="Designation" className="form-control mb-2" {...register("designation")} />
            <p className="text-danger">{ errors.designation?.message }</p>
            
            <input type="file" className="form-control mb-2" onChange={ (event) => {
              setValue("profileImage", event.target.files[0])
              setPreviewImage(URL.createObjectURL(event.target.files[0]))
            } } />
            {
              previewImage && (
                <Image src={previewImage} alt="Profile" className="mb-2" width={100} height={ 100 } />
              )
            }
            <button className="btn btn-primary">{ isEdit ? "Update" : "Add" } Employee</button>
          </form>
        </div>

        <div className="col-md-7">
          <table className="table table-bordered">
            <thead>
              <tr>
                <th>Profile</th>
                <th>Name</th>
                <th>Email</th>
                <th>Gender</th>
                <th>Designation</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {
                employees.length > 0 ? employees.map( (singlEmployee) => (
                  <tr key={ singlEmployee.id }>
                      <td>
                        {
                          singlEmployee?.profile_image ? (<img src={singlEmployee?.profile_image} alt="Profile" width="50" height={50} />) : ("--")
                        }
                      </td>
                      <td>{ singlEmployee?.name }</td>
                      <td>{ singlEmployee?.email }</td>
                      <td>{ singlEmployee?.gender }</td>
                      <td>{ singlEmployee?.designation }</td>
                      <td>
                          <button className="btn btn-warning btn-sm me-2" onClick={ () => handleEmployeeEdit(singlEmployee) }>Edit</button>
                          <button className="btn btn-danger btn-sm" onClick={ () => handleEmployeeDelete(singlEmployee.id) }>Delete</button>
                      </td>
                  </tr>
                ) )  : (
                  <tr>
                    <td colSpan={5} style={{ textAlign: "center" }}> No Rows Found </td>
                </tr>
                )
              }              
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </>
}