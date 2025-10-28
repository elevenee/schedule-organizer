'use server';

import { prisma } from "@/lib/prisma";
import { userFormValues } from "../validations";
import { Role, StatusUser } from "@prisma/client";
import { hash } from "@/lib/bcrypt";

export async function create(formData: userFormValues) {
  const { name, email, username, password, role, status } = formData;
  let data = {
    name: name,
    email: email,
    username,
    password: await hash(String(password)),
    role: role as Role,
    status: status as StatusUser,
  }
  return await prisma.user.create({
    data: data
  });
}
