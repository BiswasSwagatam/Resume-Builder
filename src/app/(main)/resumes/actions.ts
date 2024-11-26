"use server";

import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { del } from "@vercel/blob";
import { revalidatePath } from "next/cache";

export async function deleteResume(id: string) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("User not authenticated");
  }

  const resume = await prisma.resume.findUnique({
    where: {
      id,
      userId,
    },
  });
  console.log(resume);

  if (!resume) {
    throw new Error("Resume not found");
  }

  if (resume.photoUrl) {
    await del(resume.photoUrl);
  }

  await prisma.resume.delete({
    where: {
      id,
      userId,
    },
  });

  revalidatePath("/resumes");
}

// export async function deleteResume(id: string) {
//   const { userId } = await auth();

//   if (!userId) {
//     throw new Error("User not authenticated");
//   }

//   try {
//     const resume = await prisma.resume.findUnique({
//       where: {
//         id,
//         userId,
//       },
//     });

//     if (!resume) {
//       throw new Error("Resume not found");
//     }

//     if (resume.photoUrl) {
//       await del(resume.photoUrl);
//     }

//     await prisma.resume.delete({
//       where: {
//         id,
//       },
//     });

//     revalidatePath("/resumes");
//   } catch (error) {
//     console.error("Error deleting resume:", error);
//     // Handle the error, e.g., return an error message to the user
//     throw error; // Re-throw the error to propagate it to the caller
//   }
// }
