"use client";

import React, { useState } from "react";
import Image from "next/image";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Link from "next/link";
import axios from "axios";
import { FiLoader } from "react-icons/fi";
import { useDispatch } from "react-redux";
import { setAuthUser } from "@/store/authSlice";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { API_URL } from "@/server";

const Login = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const submitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/users/login`, formData, {
        withCredentials: true,
      });

      const user = response.data.data.user;
      toast.success("Signin successful");
      console.log(user);

      dispatch(setAuthUser(user));
      router.push("/");
    } catch (error: any) {
      toast.error(error.response.data.message);
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section>
      <div className="min-h-screen mx-auto container p-4 flex items-center justify-center">
        <div className="bg-white w-full max-w-md py-5 px-10 mx-auto rounded-xl shadow-2xl">
          <div className="text-4xl w-20 h-20 mx-auto flex items-center justify-center p-5 rounded-full bg-slate-100 text-blue-600">
            <Image
              src="/img/default.png"
              alt="Default Image"
              width={200}
              height={200}
            />
          </div>

          <div className="flex flex-col items-center mt-3">
            <h1 className="text-3xl text-slate-800 font-bold mb-3">
              Welcome Back!
            </h1>
            <div className="text-md text-slate-400 font-semibold pb-4">
              Use your email and password to login
            </div>
          </div>

          <form onSubmit={submitHandler} className="w-full">
            <div className="grid pb-4">
              <label>Email</label>
              <input
                name="email"
                className="outline-none p-2 pt-2 bg-slate-100 rounded-lg"
                type="email"
                placeholder="Enter email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="pb-1">
              <label>Password</label>
              <div className="flex items-center p-2 pt-2 bg-slate-100 rounded-lg">
                <input
                  name="password"
                  className="outline-none w-full bg-slate-100"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  value={formData.password}
                  onChange={handleChange}
                />

                <div
                  className="cursor-pointer text-xl"
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </div>
              </div>
            </div>
            <Link
              href={"/auth/forgetpassword"}
              className="text-blue-600 pb-5 underline cursor-pointer text-sm font-semibold text-right block"
            >
              Forget Password
            </Link>

            {!loading && (
              <button className="bg-blue-600 p-2 rounded-lg text-white w-full font-semibold">
                Login
              </button>
            )}
            {loading && (
              <button className="bg-blue-600 p-2 rounded-lg text-white w-full font-semibold flex justify-center">
                <FiLoader className="animate-spin" />
              </button>
            )}
          </form>

          <h2 className="text-center mt-5 font-normal">
            Don&apos;t have an account?{" "}
            <Link href={"/auth/signup"}>
              <span className="text-blue-600 cursor-pointer font-semibold">
                Sign Up
              </span>
            </Link>
          </h2>
        </div>
      </div>
    </section>
  );
};

export default Login;
