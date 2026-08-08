import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

/** Return the signed-in database user for server components and route handlers. */
export async function getCurrentUser() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return null;
  }

  return prisma.user.findUnique({ where: { id: userId } });
}
