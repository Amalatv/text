"use client";

import React, { useState } from "react";
import axios from "axios";
import { FiLoader } from "react-icons/fi";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { API_URL } from "@/server";

const ForgetPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async () => {
    setLoading(true);

    try {
      await axios.post(
        `${API_URL}/users/forget-password`,
        { email },
        { withCredentials: true }
      );
      toast.success("Reset code send to your email.");
      router.push(`/auth/resetpassword?email=${encodeURIComponent(email)}`);
    } catch (error: any) {
      toast.error(error.response.data.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section>
      <div className="mx-auto min-h-screen container  p-4 flex items-center justify-center">
        <div className="bg-white w-full max-w-md py-5 px-10 mx-auto rounded-xl shadow-2xl">
          <div className="flex flex-col items-center mt-3">
            <h1 className="text-2xl text-slate-700 font-bold pb-3">
              Reset Password
            </h1>
            <div className="text-md text-slate-400 font-semibold pb-4">
              Enter your email for get otp to reset password
            </div>
          </div>

          <form className="w-full">
            <div className="grid pb-4">
              <label>Email</label>
              <div className="flex items-center p-2 pt-2 bg-slate-100 rounded-lg">
                <input
                  name="email"
                  className="outline-none w-full bg-slate-100"
                  type="email"
                  placeholder="Enter email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {!loading && (
              <button
                onClick={handleSubmit}
                className="bg-blue-600 p-2 rounded-lg text-white w-full font-semibold"
              >
                Submit
              </button>
            )}
            {loading && (
              <button className="bg-blue-600 p-2 rounded-lg text-white w-full font-semibold flex justify-center">
                <FiLoader className="animate-spin" />
              </button>
            )}
          </form>
        </div>
      </div>
    </section>
  );
};

export default ForgetPassword;
