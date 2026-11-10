'use server';

import { requireAuth } from "@/lib/auth-guard";
import { hash } from "@/lib/bcrypt";
import { prisma } from "@/lib/prisma";
import { Role, StatusUser } from "@prisma/client";
import { userFormValues, userSchema } from "../validations";

export async function create(formData: userFormValues) {
  await requireAuth([Role.ADMIN]);

  const validated = userSchema.safeParse(formData);
  if (!validated.success) {
    return { error: 'Validasi gagal', details: validated.error.flatten().fieldErrors };
  }

  const { name, username, password, role, status, fakultasId } = validated.data;

  if (!password) {
    return { error: 'Password wajib diisi untuk pengguna baru' };
  }

  const existing = await prisma.user.findUnique({
    where: { username },
  });
  if (existing) {
    return { error: 'Username sudah digunakan' };
  }

  const data = {
    name,
    username,
    password: await hash(String(password)),
    role: role as Role,
    status: (status as StatusUser) || StatusUser.ACTIVE,
    fakultasId: fakultasId ? BigInt(fakultasId) : null,
  };

  const created = await prisma.user.create({
    data,
    select: {
      id: true,
      name: true,
      username: true,
      role: true,
      status: true,
      fakultasId: true,
      createdAt: true,
    }
  });

  return created;
}
