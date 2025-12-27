import { getAT, getUser, setAT, setUserFromToken } from "@/lib/AuthToken";
import api from "@/lib/axios";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { NhanKhau } from "./types";

export const getAllNhanKhau = async (): Promise<NhanKhau[]> => {
  const res = await api.get("/nhan-khau");
  return res.data;
};

//BE tao ID, FE ko gui
export const createNhanKhau = async (
  data: Omit<NhanKhau, "id">
): Promise<NhanKhau> => {
  const res = await api.post("/api/nhan-khau", data);
  return res.data;
};

export const deleteNhanKhau = async (id: string): Promise<void> => {
  await api.delete(`/api/nhan-khau/${id}`);
};
