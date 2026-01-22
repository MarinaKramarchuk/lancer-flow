import { currentUser } from "@clerk/nextjs/server"
import { db } from "./prisma";

export const checkUser = async () => {
  const user = await currentUser()

  if (!user) {
    return null;
  }

  try {
    const loggedInUser = await db.user.findUnique({
      where: {
        clerkUserId: user.id,
      },
    });

    if (loggedInUser) {
      return loggedInUser;
    }

    const name = user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : "Unnamed User"; 

    const newUser = await db.user.create({
      data: {
        clerkUserId: user.id,
        email: user.emailAddresses[0]?.emailAddress || "",
        name: name,
        imageUrl: user.imageUrl || "",
      },
    });

    return newUser;
  } catch (error) {
    console.error("Error extracting user details:", error);
    return null;
  }
}