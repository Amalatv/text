"use client";

import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import axios from "axios";
import { API_URL } from "@/server";
import { setAuthUser } from "@/store/authSlice";
import { toast } from "react-toastify";
import Image from "next/image";
import BackgroundImage from "./components/BackgroundImage";

export default function Home() {
  const user = useSelector((state: RootState) => state.auth.user);
  const dispatch = useDispatch();
  console.log("Redux User", user);

  const logoutHandler = async () => {
    await axios.post(`${API_URL}/users/logout`);
    dispatch(setAuthUser(null));
    toast.success("Logout Successful");
  };

  return (
    <>
      <BackgroundImage />
      <div className="bg-black opacity-50 w-full h-svh absolute"></div>
      <header className="relative h-svh w-full mx-auto">
        <div className="w-full shadow-[0_0_10px_#00000042]">
          <div className="w-full container mx-auto flex items-center justify-between p-3 ">
            <div className="text-2xl font-bold">
              <Image 
                src="/img/luminotech2.svg" 
                alt="Luminotech Logo"
                width={240}
                height={60}
                priority
              />
            </div>

            <div className="flex items-center gap-7 cursor-pointer">
              <div>
                {!user && (
                  <Link href={"/auth/signup"}>
                    <button className="px-3 py-2 rounded-lg bg-slate-300 text-blue-900 hover:bg-slate-50 ">
                      Register
                    </button>
                  </Link>
                )}

                {user && (
                  <div className="flex gap-4">
                    <div className="font-bold uppercase text-xl p-2 text-blue-100 w-10 h-10 border rounded-full flex justify-center items-center">
                      {user.username.split("")[0]}
                    </div>
                    <button className="hidden sm:block px-3 py-2 rounded-lg bg-slate-300 text-blue-900 hover:bg-slate-200 cursor-pointer">
                      Dashboard
                    </button>
                    <button
                      onClick={logoutHandler}
                      className="px-3 py-2 rounded-lg bg-slate-300 text-blue-900 hover:bg-slate-200 cursor-pointer"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="w-full max-w-md max-auto flex flex-col pt-10 gap-6 p-10">
          <h1 className="text-gray-400 flex  text-xl pt-20">
            Welcome to the Luminotech
          </h1>
          <h1 className="font-bold text-5xl text-gray-300">Grow Your Skills With Us</h1>
          <p className="text-blue-300 mb-10">find the new home to develop with technology</p>
          <button className="px-3 py-2 w-40 rounded-lg bg-slate-300 hover:bg-slate-200 text-blue-900 font-semibold cursor-pointer">
            JOIN NOW
          </button>
        </div>
      </header>
    </>
  );
}
