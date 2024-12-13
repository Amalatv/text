"use client";

import React, {
  ChangeEvent,
  KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from "react";

import axios from "axios";
import { FiLoader } from "react-icons/fi";
import { toast } from "react-toastify";
import { API_URL } from "@/server";
import { useDispatch, useSelector } from "react-redux";
import { setAuthUser } from "@/store/authSlice";
import { useRouter } from "next/navigation";
import { RootState } from "@/store/store";

interface ApiError {
  response: {
    data: {
      message: string;
    };
  };
}

const VerifyComponent = () => {
  const [otp, setOtp] = useState(["", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const router = useRouter();

  const user = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    if (!user) {
      toast.warning("You must sign up first!");
      router.replace("/auth/signup");
    }
  }, [user, router]);

  const handleChange = (
    index: number,
    event: ChangeEvent<HTMLInputElement>
  ): void => {
    const { value } = event.target;
    if (value.length > 1) return;

    const newOtp = [...otp];
    newOtp[index] = value;

    setOtp(newOtp);

    if (value && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    event: KeyboardEvent<HTMLInputElement>
  ): void => {
    if (
      event.key === "Backspace" &&
      !inputRefs.current[index]?.value &&
      inputRefs.current[index - 1]
    ) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setLoading(true);

    try {
      const otpValue = otp.join("");
      const response = await axios.post(
        `${API_URL}/users/verify`,
        { otp: otpValue },
        { withCredentials: true }
      );

      const verifiedUser = response.data.data.user;
      dispatch(setAuthUser(verifiedUser));
      toast.success("Verification Successful");
      router.push("/");
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to verify OTP. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    try {
      await axios.post(`${API_URL}/users/resend-otp`, null, {
        withCredentials: true,
      });
      toast.success("OTP resent successfully");
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to resend OTP. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#eaeefb] flex items-center justify-center font-montserrat p-4">
      <div className="bg-white rounded-[30px] shadow-lg p-8 w-[95%] md:w-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">OTP Verification</h2>
          <p className="text-gray-600 mb-6">Enter the OTP sent to your email</p>
        </div>

        <form className="space-y-6">
          <div className="flex justify-center space-x-4">
            {otp.map((value, index) => {
              return (
                <input
                  name="otp"
                  key={index}
                  type="text"
                  maxLength={1}
                  className="w-12 h-12 text-center text-xl font-semibold border-2 border-gray-300 rounded-lg focus:border-[#4318ff] focus:outline-none"
                  value={value}
                  onChange={(e) => handleChange(index, e)}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                />
              );
            })}
          </div>

          <div>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={loading}
              className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                loading
                  ? "bg-[#4318ff] cursor-not-allowed"
                  : "bg-[#4318ff] text-white hover:bg-[#3a14e0]"
              }`}
            >
              {loading ? (
                <FiLoader className="animate-spin text-white mx-auto" />
              ) : (
                "Verify OTP"
              )}
            </button>
            {!loading && (
              <p className="text-[#4318ff] text-center mt-6">
                Didn't receive the code?{" "}
                <button
                  onClick={handleResendOtp}
                  className="text-[#4318ff] font-semibold hover:underline"
                >
                  Resend OTP
                </button>
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default VerifyComponent;
