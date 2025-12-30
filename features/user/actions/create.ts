'use server';

import { hash } from "@/lib/bcrypt";
import { prisma } from "@/lib/prisma";
import { Role, StatusUser } from "@prisma/client";
import { userFormValues } from "../validations";

export async function create(formData: userFormValues) {
  const { name, username, password, role, status, fakultasId } = formData;
  let data = {
    name: name,
    username,
    password: await hash(String(password)),
    role: role as Role,
    status: status as StatusUser,
    fakultasId: fakultasId ? Number(fakultasId) : null,
  }
  return await prisma.user.create({
    data: data
  });
}
